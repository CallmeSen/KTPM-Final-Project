import { Controller, Post, Body, Inject, Get, Req, Res, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import Stripe from 'stripe'
import { Repository } from 'typeorm';
import { Book } from 'src/modules/books/entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartService } from 'src/modules/cart/cart.service';
import { User } from 'src/modules/users/entities/user.entity';
import { NotificationService } from 'src/modules/notification/notification.service';
@Controller('payment')
export class PaymentController {


  constructor(
    private readonly paymentService: PaymentService,
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    @InjectRepository(Book) readonly bookRepository: Repository<Book>,
    private readonly cartService: CartService,
    @InjectRepository(User) readonly UserRes: Repository<User>,
    private readonly notificationService: NotificationService,
  ) { }

  @Post('products')
  async createProduct(
    @Body() body: {
      name: string;
      description: string;
      price: number;
      currency?: string;
      interval?: 'day' | 'week' | 'month' | 'year';
      image?: string;
      metadata?: Record<string, string>;
    },
  ) {
    const {
      name,
      description,
      price,
      currency = 'usd',
      interval = 'month',
      image,
      metadata,
    } = body;

    const product = await this.stripe.products.create({
      name,
      description,
      active: true,
      images: image ? [image] : [],
      metadata: {
        category: 'subscription',
        ...metadata,
      },
      default_price_data: {
        currency,
        unit_amount: price,
        recurring: { interval },
      },
    });

    return {
      message: 'Product created successfully',
      product,
    };
  }

  @Post('create-customer')
  async createCustomer(@Body() body: { email: string; name?: string }) {
    return this.stripe.customers.create({
      email: body.email,
      name: body.name,
    });
  }

  @Post('create-connected-account')
  async createConnectedAccount(@Body() body: { email: string }) {
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: body.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_type: 'individual',
    });

    return account;
  }

  @Post('create-payment-link')
  async createPaymentLink(
    @Body() body: {
      date: string;
      cartId: string;
      items: { id_stripe: string; quantity: number }[];
    }
  ) {
    return await this.paymentService.createPaymentLink(body.date ,body.cartId, body.items);
  }


  @Post('update')
  async updateStripeIdsForAllBooks() {
    const books = await this.bookRepository.find();

    for (const book of books) {
      try {
        const stripeProduct = await this.paymentService.getProductByTitle(book.title);

        if (stripeProduct?.id) {
          book.id_stripe = stripeProduct.id;
          await this.bookRepository.save(book);
          console.log(` Updated book "${book.title}" with Stripe ID: ${stripeProduct.id}`);
        } else {
          console.log(` No Stripe product found for "${book.title}"`);
        }

      } catch (err) {
        console.error(`Error updating "${book.title}":`, err.message);
      }
    }

    return { message: 'Stripe IDs updated for all books' };
  }

  @Get('get-product-stripe')
  async GetProdcutSpipe(@Body() body: { title: string }) {
    return await this.paymentService.getProductByTitle(body.title)
  }

  @Get('products/import')
  async importProducts() {
    const filePath = "C:/Users/ASUS/Documents/GitHub/Bookstore/book-strore/src/modules/books/books-3.csv";
    return await this.paymentService.importProductsFromFile(filePath);
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {

    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body as unknown as Buffer,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      throw new BadRequestException(err.message);
    }

    switch (event.type) {
      case 'checkout.session.completed': {

        const session = event.data.object as Stripe.Checkout.Session;

        console.log('session', session);

        if (!session.metadata)
          throw new BadRequestException('No session object found in event data');

        const cartId = session.metadata.cart_id;

        const stripePaymentId = session.payment_intent as string;

        const amount = session.amount_total ?? 12;

        const currency = session.currency ?? 'usd';

        const status = session.payment_status;

        const customerEmail = session.customer_details?.email;

        let user: User | null = null;

        if (customerEmail) {
          user = await this.UserRes.findOne({ where: { email: customerEmail } });

          if (user) {
            await this.paymentService.createPayment(
              cartId,
              user.id,
              amount,
              currency,
              status,
              stripePaymentId,
            );

            console.log(`Payment saved for user ${user.email}`);

          } else {
            console.warn(`No user found for email ${customerEmail}`);
          }
        }

        if (cartId) {
          await this.cartService.removeAllItems(cartId);
          console.log(`Cart ${cartId} cleared after payment`);
        }

        if (user) {
          await this.notificationService.sendNotification({
            userId: user.id,
            title: `Mã đơn hàng ${session.metadata.date}) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất`,
            message: `Bạn đã thanh toán ${(amount / 100).toFixed(2)} ${currency.toUpperCase()} thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất`,
          });
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json();

  }



}
