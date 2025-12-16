import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity';
import { User, UserStatus } from 'src/modules/users/entities/user.entity';
import { OrdersService } from 'src/modules/orders/orders.service';
import { NotificationService } from 'src/modules/notification/notification.service';
import { NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';

describe('PaymentService - Unit Tests', () => {
  let service: PaymentService;
  let paymentRepository: any;
  let userRepository: any;
  let ordersService: OrdersService;
  let notificationService: NotificationService;
  let stripe: Stripe;

  const mockStripe = {
    products: {
      retrieve: jest.fn(),
      search: jest.fn(),
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

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockOrdersService = {
    createOrder: jest.fn(),
    updateOrder: jest.fn(),
    updateStatusByPaymentIntent: jest.fn(),
  };

  const mockNotificationService = {
    createNotification: jest.fn(),
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: 'STRIPE_CLIENT',
          useValue: mockStripe,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paymentRepository = module.get(getRepositoryToken(Payment));
    userRepository = module.get(getRepositoryToken(User));
    ordersService = module.get<OrdersService>(OrdersService);
    notificationService = module.get<NotificationService>(NotificationService);
    stripe = module.get<Stripe>('STRIPE_CLIENT');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================
  // Function: getProductByTitle
  // ==========================================================
  describe('getProductByTitle', () => {
    it('[PAY-1] Should return product when found', async () => {
      const title = 'Test Product';
      const mockProduct = {
        id: 'prod_test123',
        name: title,
      };

      mockStripe.products.search.mockResolvedValue({
        data: [mockProduct],
      });

      const result = await service.getProductByTitle(title);

      expect(result).toEqual({ id: mockProduct.id });
      expect(mockStripe.products.search).toHaveBeenCalledWith({
        query: `name:"${title}"`,
      });
    });

    it('[PAY-2] Should return message when product not found', async () => {
      const title = 'Non-existent Product';

      mockStripe.products.search.mockResolvedValue({
        data: [],
      });

      const result = await service.getProductByTitle(title);

      expect(result).toEqual({ message: 'No product found' });
    });
  });

  // ==========================================================
  // Function: createPaymentLink
  // ==========================================================
  describe('createPaymentLink', () => {
    it('[PAY-3] Should create payment link successfully', async () => {
      const date = '2025-12-15';
      const cartId = 'cart123';
      const items = [
        { id_stripe: 'prod_test1', quantity: 2 },
      ];

      const mockProduct = {
        id: 'prod_test1',
        default_price: 'price_test123',
      };

      const mockPaymentLink = {
        url: 'https://checkout.stripe.com/test',
      };

      mockStripe.products.retrieve.mockResolvedValue(mockProduct);
      mockStripe.paymentLinks.create.mockResolvedValue(mockPaymentLink);

      const result = await service.createPaymentLink(date, cartId, items);

      expect(result).toEqual({ url: mockPaymentLink.url });
      expect(mockStripe.products.retrieve).toHaveBeenCalledWith(items[0].id_stripe);
      expect(mockStripe.paymentLinks.create).toHaveBeenCalledWith({
        line_items: [
          {
            price: mockProduct.default_price,
            quantity: items[0].quantity,
          },
        ],
        metadata: {
          cart_id: cartId,
          date: date,
        },
      });
    });

    it('[PAY-4] Should throw error when product has no default price', async () => {
      const date = '2025-12-15';
      const cartId = 'cart123';
      const items = [
        { id_stripe: 'prod_test1', quantity: 2 },
      ];

      const mockProduct = {
        id: 'prod_test1',
        default_price: null,
      };

      mockStripe.products.retrieve.mockResolvedValue(mockProduct);

      await expect(
        service.createPaymentLink(date, cartId, items),
      ).rejects.toThrow(`Product ${items[0].id_stripe} has no default price`);
    });
  });

  // ==========================================================
  // Function: createPayment
  // ==========================================================
  describe('createPayment', () => {
    it('[PAY-5] Should create payment successfully', async () => {
      const cartId = 'cart123';
      const userId = 'user123';
      const amount = 1000;
      const currency = 'usd';
      const status = 'succeeded';
      const stripePaymentId = 'pi_test123';

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        status: UserStatus.ACTIVE,
      };

      const mockPayment = {
        id: 'payment123',
        user: { id: userId, status: UserStatus.ACTIVE },
        amount,
        currency,
        status,
        stripePaymentId,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);

      const result = await service.createPayment(
        cartId,
        userId,
        amount,
        currency,
        status,
        stripePaymentId,
      );

      expect(result).toEqual(mockPayment);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPaymentRepository.create).toHaveBeenCalled();
      expect(mockPaymentRepository.save).toHaveBeenCalledWith(mockPayment);
    });

    it('[PAY-6] Should throw NotFoundException when user not found', async () => {
      const cartId = 'cart123';
      const userId = 'nonexistent_user';
      const amount = 1000;
      const currency = 'usd';
      const status = 'succeeded';
      const stripePaymentId = 'pi_test123';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createPayment(
          cartId,
          userId,
          amount,
          currency,
          status,
          stripePaymentId,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================================
  // Function: refundPayment
  // ==========================================================
  describe('refundPayment', () => {
    it('[PAY-7] Should refund payment successfully', async () => {
      const paymentIntentId = 'pi_test123';
      const email = 'test@example.com';
      const reason = 'requested_by_customer' as const;

      const mockUser = {
        id: 'user123',
        email,
      };

      const mockPaymentIntent = {
        id: paymentIntentId,
        latest_charge: 'ch_test123',
      };

      const mockRefund = {
        id: 'ref_test123',
        amount: 1000,
        status: 'succeeded',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);
      mockStripe.refunds.create.mockResolvedValue(mockRefund);
      mockOrdersService.updateStatusByPaymentIntent.mockResolvedValue({});

      await service.refundPayment(paymentIntentId, reason, email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith(paymentIntentId);
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        charge: mockPaymentIntent.latest_charge,
        reason,
      });
      expect(mockOrdersService.updateStatusByPaymentIntent).toHaveBeenCalledWith(
        paymentIntentId,
        'refunded',
      );
    });

    it('[PAY-8] Should return error object when user not found', async () => {
      const paymentIntentId = 'pi_test123';
      const email = 'nonexistent@example.com';

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.refundPayment(paymentIntentId, 'requested_by_customer', email);

      expect(result).toEqual({
        success: false,
        message: `Không tìm thấy người dùng với email: ${email}`,
      });
    });

    it('[PAY-9] Should return error object when payment intent has no charge', async () => {
      const paymentIntentId = 'pi_test123';
      const email = 'test@example.com';

      const mockUser = {
        id: 'user123',
        email,
      };

      const mockPaymentIntent = {
        id: paymentIntentId,
        latest_charge: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      const result = await service.refundPayment(paymentIntentId, 'requested_by_customer', email);

      expect(result).toEqual({
        success: false,
        message: 'Payment Intent không hợp lệ hoặc chưa có charge',
      });
    });
  });
});