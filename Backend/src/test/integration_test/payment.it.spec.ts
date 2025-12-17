import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { NotificationService } from 'src/modules/notification/notification.service';
import { Payment } from 'src/modules/Payment/entity/payment.entity';
import { OrdersService } from 'src/modules/orders/orders.service';
import { User } from 'src/modules/users/entities/user.entity';
import { PaymentService } from 'src/modules/Payment/payment.service';


describe('PaymentService Integration Flows', () => {
  let service: PaymentService;
  let stripe: any;
  let paymentRepo: any;
  let userRepo: any;

  beforeEach(async () => {
    stripe = {
      products: {
        retrieve: jest.fn(),
      },
      paymentLinks: {
        create: jest.fn(),
      },
    };

    paymentRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: 'STRIPE_CLIENT', useValue: stripe },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        {
          provide: OrdersService,
          useValue: { updateStatusByPaymentIntent: jest.fn() },
        },
        {
          provide: NotificationService,
          useValue: { sendNotification: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  // ======================
  // Integration Flow
  // ======================
  it('Flow: Create payment link end-to-end', async () => {
    stripe.products.retrieve.mockResolvedValue({
      default_price: 'price_abc',
    });

    stripe.paymentLinks.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/pay',
    });

    const result = await service.createPaymentLink(
      '2025-01-01',
      'cart123',
      [{ id_stripe: 'prod_123', quantity: 1 }],
    );

    expect(result.url).toContain('stripe.com');
  });

  it('Flow: Create payment record after Stripe success', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'user1' });

    paymentRepo.create.mockReturnValue({ id: 'pay1' });
    paymentRepo.save.mockResolvedValue({ id: 'pay1' });

    const result = await service.createPayment(
      'cart1',
      'user1',
      200,
      'usd',
      'success',
      'pi_999',
    );

    expect(result.id).toBe('pay1');
  });
});
