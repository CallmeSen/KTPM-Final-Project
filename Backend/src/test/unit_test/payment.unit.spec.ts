import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { NotFoundException } from '@nestjs/common';
import { OrdersService } from 'src/modules/orders/orders.service';
import { Payment } from 'src/modules/Payment/entity/payment.entity';
import { PaymentService } from 'src/modules/Payment/payment.service';
import { NotificationService } from 'src/modules/notification/notification.service';
import { User } from 'src/modules/users/entities/user.entity';

describe('PaymentService - Unit Test', () => {
  let service: PaymentService;
  let stripe: any;
  let paymentRepo: any;
  let userRepo: any;
  let ordersService: any;
  let notificationService: any;

  beforeEach(async () => {
    stripe = {
      products: {
        search: jest.fn(),
        retrieve: jest.fn(),
        create: jest.fn(),
      },
      paymentLinks: {
        create: jest.fn(),
      },
      paymentIntents: {
        retrieve: jest.fn(),
      },
      refunds: {
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

    ordersService = {
      updateStatusByPaymentIntent: jest.fn(),
    };

    notificationService = {
      sendNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: 'STRIPE_CLIENT', useValue: stripe },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: OrdersService, useValue: ordersService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  // ======================
  // getProductByTitle
  // ======================
  it('should return stripe product id when product exists', async () => {
    stripe.products.search.mockResolvedValue({
      data: [{ id: 'prod_123' }],
    });

    const result = await service.getProductByTitle('Gói Pro');

    expect(result).toEqual({ id: 'prod_123' });
  });

  it('should return message when product not found', async () => {
    stripe.products.search.mockResolvedValue({ data: [] });

    const result = await service.getProductByTitle('Unknown');

    expect(result).toEqual({ message: 'No product found' });
  });

  // ======================
  // createPaymentLink
  // ======================
  it('should create payment link successfully', async () => {
    stripe.products.retrieve.mockResolvedValue({
      default_price: 'price_123',
    });

    stripe.paymentLinks.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/test',
    });

    const result = await service.createPaymentLink(
      '2025-01-01',
      'cart_1',
      [{ id_stripe: 'prod_1', quantity: 2 }],
    );

    expect(result.url).toContain('stripe.com');
    expect(stripe.paymentLinks.create).toHaveBeenCalled();
  });

  // ======================
  // createPayment
  // ======================
  it('should create payment successfully', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'user1' });

    paymentRepo.create.mockReturnValue({ id: 'pay1' });
    paymentRepo.save.mockResolvedValue({ id: 'pay1' });

    const result = await service.createPayment(
      'cart1',
      'user1',
      100,
      'usd',
      'paid',
      'pi_123',
    );

    expect(paymentRepo.save).toHaveBeenCalled();
    expect(result.id).toBe('pay1');
  });

  it('should throw error if user not found', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(
      service.createPayment('c', 'u', 10, 'usd', 'paid', 'pi'),
    ).rejects.toThrow(NotFoundException);
  });

  // ======================
  // refundPayment
  // ======================
  it('should refund payment successfully', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u1', email: 'test@test.com' });

    stripe.paymentIntents.retrieve.mockResolvedValue({
      latest_charge: 'ch_123',
    });

    stripe.refunds.create.mockResolvedValue({ id: 'refund_1' });

    const result = await service.refundPayment(
      'pi_123',
      'requested_by_customer',
      'test@test.com',
    );

    expect(result.success).toBe(true);
    expect(ordersService.updateStatusByPaymentIntent).toHaveBeenCalled();
    expect(notificationService.sendNotification).toHaveBeenCalled();
  });
});
