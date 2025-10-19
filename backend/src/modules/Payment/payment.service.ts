import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { Payment } from 'src/modules/Payment/entity/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/modules/users/entities/user.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    @InjectRepository(Payment)
    private readonly paymentRes: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRes: Repository<Payment>,
    @InjectRepository(Cart)
    private readonly cartRes: Repository<Cart>,

    @InjectRepository(User) readonly UserRes: Repository<User>,
  ) { }

  async importProductsFromFile(filePath: string) {
    const results: any[] = [];

    return new Promise((resolve, reject) => {

      fs.createReadStream(filePath)
        .pipe(csv({ mapHeaders: ({ header }) => header.toLowerCase().trim() }))
        .on('data', (row) => results.push(row))
        .on('end', async () => {
          const createdProducts: Stripe.Response<Stripe.Product>[] = [];

          for (const row of results) {
            console.log("Row from CSV:", row);
            const product = await this.stripe.products.create({
              name: row.title,
              active: true,
              images: row.thumbnail ? [row.thumbnail] : [],
              default_price_data: {
                currency: 'usd',
                unit_amount: Number(row.price) * 100,
              },
            });

            createdProducts.push(product);
          }

          resolve({
            message: 'Products imported successfully',
            count: createdProducts.length,
            products: createdProducts,
          });
        })
        .on('error', (err) => reject(err));
    });
  }

  async getProductByTitle(title: string) {
    const cleanTitle = title.trim();

    const products = await this.stripe.products.search({
      query: `name:"${cleanTitle}"`
    });

    console.log(" Stripe returned:", products.data);

    if (products.data.length === 0) {
      return { message: 'No product found' };
    }

    return {
      id: products.data[0].id
    };
  }

  async createPaymentLink(
    date: string,
    cardId: string,
    items: { id_stripe: string; quantity: number }[],
  ) {


    const lineItems: Stripe.PaymentLinkCreateParams.LineItem[] = [];

    for (const item of items) {

      const product = await this.stripe.products.retrieve(item.id_stripe);

      console.log(product)

      if (!product.default_price) {
        throw new Error(`Product ${item.id_stripe} has no default price`);
      }

      lineItems.push({
        price:
          typeof product.default_price === 'string'
            ? product.default_price
            : product.default_price.id,
        quantity: item.quantity,
      });
    }


    const paymentLink = await this.stripe.paymentLinks.create({
      line_items: lineItems,
      metadata: {
        cart_id: cardId,
        date: date
      },
    });

    return { url: paymentLink.url };
  }


  async createPayment(
    cartId: string,
    userId: string,
    amount: number,
    currency: string,
    status: string,
    stripePaymentId: string,
  ): Promise<Payment> {
    const user = await this.userRes.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const payment = this.paymentRes.create({
      user: {
        id: userId,
        status: UserStatus.ACTIVE,
      },
      amount,
      currency,
      status,
      stripePaymentId,
    });
    return await this.paymentRes.save(payment);
  }

}

