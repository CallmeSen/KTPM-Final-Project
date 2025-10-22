import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
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

 
  async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer',
  ) {
    try {
     

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      const chargeId = paymentIntent.latest_charge as string;

     
      const refund = await this.stripe.refunds.create({
        charge: chargeId,
        amount: amount ? amount * 100 : undefined, 
        reason: reason,
      });

      return {
        success: true,
        message: 'Refund created successfully',
        data: refund,
      };
    } catch (error) {
      console.error('Refund error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

}

