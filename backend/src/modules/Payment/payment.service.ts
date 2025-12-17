import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { Payment } from 'src/modules/Payment/entity/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/modules/users/entities/user.entity';
import { OrdersService } from 'src/modules/orders/orders.service';
import { NotificationService } from 'src/modules/notification/notification.service';
import * as fs from 'fs';
import * as csv from 'csv-parser';
@Injectable()
export class PaymentService {
  constructor(

    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    @InjectRepository(Payment)

    private readonly paymentRes: Repository<Payment>,

    @InjectRepository(User)
    private readonly userRes: Repository<Payment>,


    @InjectRepository(User) readonly UserRes: Repository<User>,


    private readonly ordersService: OrdersService,

    private readonly notificationService: NotificationService,

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
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer',
  email?: string
)
{
  try {
    // Tìm user theo email
    const user = await this.UserRes.findOne({ where: { email } });

    if (!user) {
      throw new Error(`Không tìm thấy người dùng với email: ${email}`);
    }

    // Lấy thông tin PaymentIntent từ Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent || !paymentIntent.latest_charge) {
      throw new Error('Payment Intent không hợp lệ hoặc chưa có charge');
    }

    const chargeId = paymentIntent.latest_charge as string;

    // Gửi yêu cầu refund toàn bộ
    const refund = await this.stripe.refunds.create({
      charge: chargeId,
      reason,
    });

    // Cập nhật trạng thái đơn hàng
    await this.ordersService.updateStatusByPaymentIntent(paymentIntentId, "refunded");

    await this.notificationService.sendNotification({
            userId: user.id,
            title: `Đơn hàng của bạn đã được hoàn tiền thành công`,
            message: `Đơn hàng của bạn là đã được hoàn tiền`,
    });

    //  Ghi log hoặc gửi mail cho user
    console.log(`Refund thành công cho user ${user.email}, order ${paymentIntentId}`);

    // Trả kết quả
    return {
      success: true,
      message: 'Refund created and order status updated successfully',
      data: refund,
      user,
    };

  } catch (error: any) {
    console.error('Refund error:', error);
    return {
      success: false,
      message: error.message || 'Refund failed',
    };
  }
}

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


}

