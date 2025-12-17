import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Order } from 'src/modules/orders/entities/order.entity';
import { OrdersService } from 'src/modules/orders/orders.service';

describe('OrdersService Unit Tests', () => {
  let service: OrdersService;
  let orderRepo: jest.Mocked<Repository<Order>>;

  const mockOrder: Order = {
    id: 'order-123',
    user_email: 'test@gmail.com',
    totalAmount: 200,
    stripePaymentId: 'pi_123',
    status: 'PENDING',
    orderStatus: 'processing',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepo,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepo = module.get(getRepositoryToken(Order));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // CREATE ORDER
  // ==========================================
  describe('createOrder', () => {
    it('should create order successfully', async () => {
      mockOrderRepo.create.mockReturnValue(mockOrder);
      mockOrderRepo.save.mockResolvedValue(mockOrder);

      const result = await service.createOrder(
        'test@gmail.com',
        200,
        'pi_123',
      );

      expect(orderRepo.create).toHaveBeenCalledWith({
        user_email: 'test@gmail.com',
        totalAmount: 200,
        stripePaymentId: 'pi_123',
        status: 'PENDING',
        createdAt: expect.any(Date),
      });

      expect(orderRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw error if save fails', async () => {
      mockOrderRepo.create.mockReturnValue(mockOrder);
      mockOrderRepo.save.mockRejectedValue(new Error('DB error'));

      await expect(
        service.createOrder('a@gmail.com', 100, 'pi_err'),
      ).rejects.toThrow('Failed to create order');
    });
  });

  // ==========================================
  // FIND ALL
  // ==========================================
  describe('findAll', () => {
    it('should return paginated orders', async () => {
      mockOrderRepo.findAndCount.mockResolvedValue([[mockOrder], 1]);

      const result = await service.findAll(1, 10);

      expect(orderRepo.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });

      expect(result).toEqual({
        orders: [mockOrder],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  // ==========================================
  // UPDATE ORDER
  // ==========================================
  describe('update', () => {
    it('should update order successfully', async () => {
      mockOrderRepo.findOne.mockResolvedValue(mockOrder);
      mockOrderRepo.save.mockResolvedValue({
        ...mockOrder,
        status: 'PAID',
      });

      const result = await service.update('order-123', {
  id: 'order-123',  // ✅ bắt buộc
  status: 'PAID',
});

      expect(orderRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PAID' }),
      );
      expect(result.status).toBe('PAID');
    });

    it('should throw error if order not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('order-123', { id: 'order-123', status: 'PAID' }),
      ).rejects.toThrow('Order with ID invalid-id not found');
    });
  });

  // ==========================================
  // UPDATE STATUS BY PAYMENT INTENT
  // ==========================================
  describe('updateStatusByPaymentIntent', () => {
    it('should update status successfully', async () => {
      mockOrderRepo.findOne.mockResolvedValue(mockOrder);
      mockOrderRepo.save.mockResolvedValue({
        ...mockOrder,
        status: 'SUCCEEDED',
      });

      const result = await service.updateStatusByPaymentIntent(
        'pi_123',
        'SUCCEEDED',
      );

      expect(result.status).toBe('SUCCEEDED');
    });

    it('should throw error if order not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatusByPaymentIntent('pi_x', 'FAILED'),
      ).rejects.toThrow('Order not found for this payment intent');
    });
  });
});
