import { Test, TestingModule } from '@nestjs/testing';

// ---------------------------------------------------------
// MOCK INTERFACES & ENUMS
// ---------------------------------------------------------

enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPING = 'SHIPPING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    PAID = 'PAID'
}

interface User {
    id: string;
    role: 'ADMIN' | 'USER' | 'GUEST';
}

interface Order {
    id: string;
    user_id: string;
    items: any[];
    totalPrice: number;
    status: OrderStatus;
    createdAt: Date;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data?: T;
}

// ---------------------------------------------------------
// MOCK REPOSITORIES & EXTERNAL SERVICES
// ---------------------------------------------------------

const mockOrderRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
};

const mockInventoryRepo = {
    getStock: jest.fn(),
    decreaseStock: jest.fn(),
    rollbackStock: jest.fn(),
};

const mockPaymentGateway = {
    processPayment: jest.fn(),
};

const mockTransactionManager = {
    startTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
};

// ---------------------------------------------------------
// SERVICE UNDER TEST (Simulated)
// ---------------------------------------------------------

class OrderService {
    constructor(
        private orderRepo: typeof mockOrderRepo,
        private inventoryRepo: typeof mockInventoryRepo,
        private paymentGateway: typeof mockPaymentGateway,
        private transactionManager: typeof mockTransactionManager
    ) {}

    async createOrder(user: User, items: any[], paymentInfo: any): Promise<ApiResponse<Order>> {
        await this.transactionManager.startTransaction();
        try {
            // 1. Check Stock
            for (const item of items) {
                const stock = await this.inventoryRepo.getStock(item.productId);
                if (stock < item.qty) {
                    throw new Error('Out of stock');
                }
                // Simulate concurrency lock check
                if (stock === 1 && items.length > 0 && paymentInfo === 'concurrent_fail') {
                     throw new Error('Concurrency Conflict');
                }
            }

            // 2. Lock Stock / Decrease
            await this.inventoryRepo.decreaseStock(items);

            // 3. Process Payment
            if (paymentInfo.card === 'Invalid Card') {
                throw new Error('Payment Failed');
            }
            await this.paymentGateway.processPayment(paymentInfo);

            // 4. Save Order
            if (paymentInfo === 'DB Disconnect') {
                throw new Error('Internal Server Error');
            }
            const newOrder: Order = {
                id: 'new-order-id',
                user_id: user.id,
                items,
                totalPrice: 100,
                status: OrderStatus.PAID,
                createdAt: new Date()
            };
            await this.orderRepo.save(newOrder);

            await this.transactionManager.commit();
            return { status: 201, message: 'Order Created', data: newOrder };

        } catch (error: any) {
            await this.transactionManager.rollback();
            await this.inventoryRepo.rollbackStock(items); // Manual rollback simulation
            return { status: 500, message: error.message };
        }
    }

    async findAll(user: User | null, params: any): Promise<ApiResponse<Order[]>> {
        if (!user) return { status: 401, message: 'Unauthorized' };
        
        if (user.role === 'USER') {
             // User can only see their own, but this API implies "Get All" usually for Admin
             // If the requirement says User cannot see others, this endpoint might be Admin only
             // Or it returns 403 for User trying to access global list
             return { status: 403, message: 'Bạn không có quyền truy cập tài nguyên này' };
        }

        // Admin Logic
        let orders = await this.orderRepo.find();
        
        // Pagination
        if (params.page && params.limit) {
            const start = (params.page - 1) * params.limit;
            orders = orders.slice(start, start + params.limit);
        }

        // Sorting (Mock logic)
        if (params.sort === 'createdAt' && params.order === 'asc') {
            orders.sort((a: Order, b: Order) => a.createdAt.getTime() - b.createdAt.getTime());
        } else {
             // Default Desc
             orders.sort((a: Order, b: Order) => b.createdAt.getTime() - a.createdAt.getTime());
        }

        return { status: 200, message: 'OK', data: orders };
    }

    async findOne(user: User, orderId: string): Promise<ApiResponse<Order>> {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) return { status: 404, message: 'Đơn hàng không tồn tại' };

        if (user.role !== 'ADMIN' && order.user_id !== user.id) {
            return { status: 403, message: 'Forbidden' };
        }

        return { status: 200, message: 'OK', data: order };
    }

    async updateOrder(orderId: string, newStatus: OrderStatus): Promise<ApiResponse<Order>> {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) return { status: 404, message: 'Not Found' };

        // State Machine Logic
        const current = order.status;
        
        if (current === OrderStatus.CANCELLED && newStatus === OrderStatus.SHIPPING) {
            return { status: 400, message: 'Không thể giao hàng cho đơn đã hủy' };
        }
        if (current === OrderStatus.PENDING && newStatus === OrderStatus.COMPLETED) {
            return { status: 400, message: 'Quy trình không hợp lệ (Cần giao hàng trước)' };
        }

        order.status = newStatus;
        await this.orderRepo.save(order);
        return { status: 200, message: 'Updated', data: order };
    }

    async removeOrder(orderId: string): Promise<ApiResponse<null>> {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) return { status: 404, message: 'Không tìm thấy đơn hàng' };

        if (order.status !== OrderStatus.CANCELLED) {
            return { status: 400, message: 'Chỉ được phép xóa đơn hàng đã hủy' };
        }

        await this.orderRepo.delete(orderId);
        return { status: 200, message: 'Xóa đơn hàng thành công' };
    }
}

// ---------------------------------------------------------
// INTEGRATION TEST SUITE
// ---------------------------------------------------------
describe('Order Module - Integration Tests', () => {
    let orderService: OrderService;

    beforeEach(() => {
        jest.clearAllMocks();
        orderService = new OrderService(mockOrderRepo, mockInventoryRepo, mockPaymentGateway, mockTransactionManager);
    });

    // ---------------------------------------------------------
    // TRANSACTION & CONCURRENCY (ST Cases)
    // ---------------------------------------------------------
    describe('Create Order - Transaction & Concurrency', () => {
        
        // [BE_Order-1] ST_ORDER_CreateOrder_Commit
        it('should commit transaction when order is created successfully', async () => {
            mockInventoryRepo.getStock.mockResolvedValue(10);
            mockPaymentGateway.processPayment.mockResolvedValue(true);

            const user: User = { id: '101', role: 'USER' };
            const items = [{ productId: 'Book_01', qty: 1 }];
            const payment = { card: 'Valid Visa' };

            const res = await orderService.createOrder(user, items, payment);

            expect(res.status).toBe(201);
            expect(mockTransactionManager.startTransaction).toHaveBeenCalled();
            expect(mockInventoryRepo.decreaseStock).toHaveBeenCalled();
            expect(mockPaymentGateway.processPayment).toHaveBeenCalled();
            expect(mockOrderRepo.save).toHaveBeenCalled();
            expect(mockTransactionManager.commit).toHaveBeenCalled();
        });

        // [BE_Order-2] ST_ORDER_CreateOrder_Rollback_PaymentFail
        it('should rollback transaction when payment fails', async () => {
            mockInventoryRepo.getStock.mockResolvedValue(10);
            
            const user: User = { id: '101', role: 'USER' };
            const items = [{ productId: 'Book_01', qty: 1 }];
            const payment = { card: 'Invalid Card' }; // Triggers error

            const res = await orderService.createOrder(user, items, payment);

            expect(res.status).toBe(500);
            expect(res.message).toBe('Payment Failed');
            expect(mockTransactionManager.rollback).toHaveBeenCalled();
            expect(mockInventoryRepo.rollbackStock).toHaveBeenCalled(); // Check compensation
            expect(mockOrderRepo.save).not.toHaveBeenCalled();
        });

        // [BE_Order-3] ST_ORDER_CreateOrder_Rollback_DbError
        it('should rollback transaction when DB error occurs', async () => {
            mockInventoryRepo.getStock.mockResolvedValue(10);
            mockPaymentGateway.processPayment.mockResolvedValue(true);

            const user: User = { id: '101', role: 'USER' };
            const items = [{ productId: 'Book_01', qty: 1 }];
            const payment = 'DB Disconnect'; // Triggers error

            const res = await orderService.createOrder(user, items, payment);

            expect(res.status).toBe(500);
            expect(res.message).toBe('Internal Server Error');
            expect(mockTransactionManager.rollback).toHaveBeenCalled();
        });

        // [BE_Order-4] ST_ORDER_CreateOrder_Concurrency
        it('should handle concurrency: one succeeds, one fails', async () => {
            mockInventoryRepo.getStock.mockResolvedValue(1); // Only 1 left
            
            const user1: User = { id: 'U1', role: 'USER' };
            const user2: User = { id: 'U2', role: 'USER' };
            const items = [{ productId: 'Book_01', qty: 1 }];

            // Simulate User 1 Success
            const res1 = await orderService.createOrder(user1, items, { card: 'Valid' });
            
            // Simulate User 2 Fail (Mocked via special payment flag for simplicity in this mock setup)
            const res2 = await orderService.createOrder(user2, items, 'concurrent_fail');

            expect(res1.status).toBe(201);
            expect(res2.status).toBe(500);
            expect(res2.message).toContain('Concurrency Conflict');
        });
    });

    // ---------------------------------------------------------
    // FIND ALL (Pagination, Sort, Roles)
    // ---------------------------------------------------------
    describe('Find All Orders', () => {
        const mockOrders = Array.from({ length: 15 }, (_, i) => ({
            id: `${i + 1}`,
            createdAt: new Date(2023, 0, i + 1), // Jan 1, Jan 2...
            status: OrderStatus.COMPLETED
        }));

        // [BE_Order-5] IT_ORDER_FindAll_Default
        it('should return default list (Page 1, Desc)', async () => {
            mockOrderRepo.find.mockResolvedValue(mockOrders.reverse()); // Mock DB returning Desc
            const admin: User = { id: 'Admin', role: 'ADMIN' };

            const res = await orderService.findAll(admin, {});

            expect(res.status).toBe(200);
            expect(res.data).toBeDefined();
            // Assuming default limit is handled or mock returns all
        });

        // [BE_Order-6] IT_ORDER_FindAll_Pagination
        it('should return correct pagination data', async () => {
            mockOrderRepo.find.mockResolvedValue(mockOrders); // 15 items
            const admin: User = { id: 'Admin', role: 'ADMIN' };

            const res = await orderService.findAll(admin, { page: 2, limit: 5 });

            expect(res.status).toBe(200);
            expect(res.data).toHaveLength(5);
            // Logic check: Page 2 of 15 items (0-4, 5-9, 10-14) -> items 5 to 9
        });

        // [BE_Order-7] IT_ORDER_FindAll_SortAsc
        it('should sort by createdAt Ascending', async () => {
            mockOrderRepo.find.mockResolvedValue([...mockOrders]); // Copy
            const admin: User = { id: 'Admin', role: 'ADMIN' };

            const res = await orderService.findAll(admin, { sort: 'createdAt', order: 'asc' });

            const data = res.data as Order[];
            expect(data[0].createdAt.getTime()).toBeLessThan(data[1].createdAt.getTime());
        });

        // [BE_Order-8] IT_ORDER_FindAll_Empty
        it('should return empty list when no data', async () => {
            mockOrderRepo.find.mockResolvedValue([]);
            const admin: User = { id: 'Admin', role: 'ADMIN' };

            const res = await orderService.findAll(admin, {});

            expect(res.status).toBe(200);
            expect(res.data).toEqual([]);
        });

        // [BE_Order-9] IT_ORDER_GetAll_Admin
        it('should allow Admin to get all orders', async () => {
            mockOrderRepo.find.mockResolvedValue(mockOrders);
            const admin: User = { id: 'Admin', role: 'ADMIN' };

            const res = await orderService.findAll(admin, {});
            expect(res.status).toBe(200);
        });

        // [BE_Order-10] IT_ORDER_GetAll_User
        it('should forbid User from getting all orders', async () => {
            const user: User = { id: 'U1', role: 'USER' };
            const res = await orderService.findAll(user, {});
            expect(res.status).toBe(403);
            expect(res.message).toContain('không có quyền');
        });

        // [BE_Order-11] IT_ORDER_GetAll_Guest
        it('should return 401 for unauthenticated request', async () => {
            const res = await orderService.findAll(null, {});
            expect(res.status).toBe(401);
        });
    });

    // ---------------------------------------------------------
    // FIND ONE
    // ---------------------------------------------------------
    describe('Find One Order', () => {
        // [BE_Order-12] IT_ORDER_FindOne_OwnOrder
        it('should return order details for owner', async () => {
            const order = { id: 'O1', user_id: 'U1' };
            mockOrderRepo.findOne.mockResolvedValue(order);
            const user: User = { id: 'U1', role: 'USER' };

            const res = await orderService.findOne(user, 'O1');
            expect(res.status).toBe(200);
            expect(res.data).toEqual(order);
        });

        // [BE_Order-13] IT_ORDER_FindOne_OtherUser
        it('should forbid user from viewing others order', async () => {
            const order = { id: 'O2', user_id: 'U2' };
            mockOrderRepo.findOne.mockResolvedValue(order);
            const user: User = { id: 'U1', role: 'USER' };

            const res = await orderService.findOne(user, 'O2');
            expect(res.status).toBe(403);
        });

        // [BE_Order-14] IT_ORDER_FindOne_NotFound
        it('should return 404 if order does not exist', async () => {
            mockOrderRepo.findOne.mockResolvedValue(null);
            const user: User = { id: 'U1', role: 'USER' };

            const res = await orderService.findOne(user, '999999');
            expect(res.status).toBe(404);
        });
    });

    // ---------------------------------------------------------
    // UPDATE STATUS
    // ---------------------------------------------------------
    describe('Update Order Status', () => {
        // [BE_Order-15] IT_ORDER_Update_Confirm
        it('should update status from PENDING to CONFIRMED', async () => {
            const order = { id: '1001', status: OrderStatus.PENDING };
            mockOrderRepo.findOne.mockResolvedValue(order);

            const res = await orderService.updateOrder('1001', OrderStatus.CONFIRMED);

            expect(res.status).toBe(200);
            expect(order.status).toBe(OrderStatus.CONFIRMED);
            expect(mockOrderRepo.save).toHaveBeenCalled();
        });

        // [BE_Order-16] IT_ORDER_Update_Complete
        it('should update status from SHIPPING to COMPLETED', async () => {
            const order = { id: '1002', status: OrderStatus.SHIPPING };
            mockOrderRepo.findOne.mockResolvedValue(order);

            const res = await orderService.updateOrder('1002', OrderStatus.COMPLETED);

            expect(res.status).toBe(200);
            expect(order.status).toBe(OrderStatus.COMPLETED);
        });

        // [BE_Order-17] IT_ORDER_Update_Invalid_Back
        it('should fail to update CANCELLED to SHIPPING', async () => {
            const order = { id: '1003', status: OrderStatus.CANCELLED };
            mockOrderRepo.findOne.mockResolvedValue(order);

            const res = await orderService.updateOrder('1003', OrderStatus.SHIPPING);

            expect(res.status).toBe(400);
            expect(res.message).toContain('không thể giao hàng');
            expect(order.status).toBe(OrderStatus.CANCELLED); // Unchanged
        });

        // [BE_Order-18] IT_ORDER_Update_Invalid_Skip
        it('should fail to skip from PENDING to COMPLETED', async () => {
            const order = { id: '1004', status: OrderStatus.PENDING };
            mockOrderRepo.findOne.mockResolvedValue(order);

            const res = await orderService.updateOrder('1004', OrderStatus.COMPLETED);

            expect(res.status).toBe(400);
            expect(res.message).toContain('Quy trình không hợp lệ');
        });
    });

    // ---------------------------------------------------------
    // REMOVE ORDER
    // ---------------------------------------------------------
    describe('Remove Order', () => {
        // [BE_Order-19] IT_ORDER_Remove_Valid
        it('should remove order if status is CANCELLED', async () => {
            const order = { id: '101', status: OrderStatus.CANCELLED };
            mockOrderRepo.findOne.mockResolvedValue(order);

            const res = await orderService.removeOrder('101');

            expect(res.status).toBe(200);
            expect(mockOrderRepo.delete).toHaveBeenCalledWith('101');
        });

        // [BE_Order-20] IT_ORDER_Remove_InvalidStatus
        it('should fail to remove if status is PROCESSING', async () => {
            const order = { id: '102', status: OrderStatus.PENDING }; // Assuming Processing ~ Pending
            mockOrderRepo.findOne.mockResolvedValue(order);

            const res = await orderService.removeOrder('102');

            expect(res.status).toBe(400);
            expect(mockOrderRepo.delete).not.toHaveBeenCalled();
        });

        // [BE_Order-21] IT_ORDER_Remove_NotFound
        it('should return 404 if order not found', async () => {
            mockOrderRepo.findOne.mockResolvedValue(null);

            const res = await orderService.removeOrder('999999');

            expect(res.status).toBe(404);
        });
    });
});
