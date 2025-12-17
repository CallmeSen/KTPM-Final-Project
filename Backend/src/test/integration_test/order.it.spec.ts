import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from 'src/modules/orders/entities/order.entity';
import { OrdersService } from 'src/modules/orders/orders.service';

import { Repository } from 'typeorm';

describe('OrdersService Integration Flows', () => {
  let service: OrdersService;
  let orderRepo: jest.Mocked<Repository<Order>>;

  beforeEach(async () => {
    const mockOrderRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
    };

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
  // Flow 1: Create Order
  // ==========================================
  it('Flow 1: Should create order successfully', async () => {
    const dto = {
      user_email: 'test@example.com',
      totalAmount: 500,
      stripePaymentId: 'pi_123',
    };

    const savedOrder = {
      id: 'order-123',
      ...dto,
      status: 'PENDING',
      createdAt: new Date(),
    } as Order;

    orderRepo.create.mockReturnValue(savedOrder);
    orderRepo.save.mockResolvedValue(savedOrder);

    const result = await service.createOrder(
      dto.user_email,
      dto.totalAmount,
      dto.stripePaymentId,
    );

    expect(orderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_email: dto.user_email,
        totalAmount: dto.totalAmount,
        stripePaymentId: dto.stripePaymentId,
        status: 'PENDING',
      }),
    );

    expect(orderRepo.save).toHaveBeenCalledWith(savedOrder);
    expect(result).toEqual(savedOrder);
  });

  // ==========================================
  // Flow 2: Error Handling
  // ==========================================
  it('Flow 2: Should throw error if repository save fails', async () => {
    orderRepo.create.mockReturnValue({} as Order);
    orderRepo.save.mockRejectedValue(new Error('DB failure'));

    await expect(
      service.createOrder('user@mail.com', 100, 'pi_fail'),
    ).rejects.toThrow('Failed to create order');

    expect(orderRepo.save).toHaveBeenCalled();
  });

  // ==========================================
  // Flow 3: Pagination Flow
  // ==========================================
  it('Flow 3: Should return paginated orders', async () => {
    const orders = [{ id: 'o1' }, { id: 'o2' }] as Order[];

    orderRepo.findAndCount.mockResolvedValue([orders, 2]);

    const result = await service.findAll(1, 10);

    expect(orderRepo.findAndCount).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      order: { createdAt: 'DESC' },
    });

    expect(result).toEqual({
      orders,
      total: 2,
      page: 1,
      limit: 10,
    });
  });

  // ==========================================
  // Flow 4: Update Order
  // ==========================================
  it('Flow 4: Should update order successfully', async () => {
  const existingOrder = { id: 'order-1', status: 'PENDING' } as Order;

  // Mock repository
  orderRepo.findOne.mockResolvedValue(existingOrder);
  orderRepo.save.mockResolvedValue({ ...existingOrder, status: 'PAID' });

  // Call service method để lấy kết quả
  const result = await service.update('order-1', { id: 'order-1', status: 'PAID' });

  // Assertions
  expect(orderRepo.findOne).toHaveBeenCalledWith({ where: { id: 'order-1' } });
  expect(orderRepo.save).toHaveBeenCalledWith(
    expect.objectContaining({ status: 'PAID' }),
  );
  expect(result.status).toBe('PAID');
});
});
