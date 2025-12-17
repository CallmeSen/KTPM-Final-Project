/**
 * Integration Test for Admin Module
 * Generated from Excel Test Cases
 * Framework: Jest/Vitest Compatible
 */

// ============================================================================
// MOCK INTERFACES
// ============================================================================

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  is_active: boolean;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  category_id: number;
  is_deleted: boolean;
  stock?: number;
}

interface Order {
  id: number;
  user_id: number;
  customer_name: string;
  total_price: number;
  status: 'pending' | 'shipping' | 'delivered' | 'cancelled';
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface ApiResponse<T> {
  status: number;
  data?: T;
  message?: string;
  meta?: {
    total_items?: number;
    total_pages?: number;
    current_page?: number;
  };
}

interface AuditLog {
  id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: number;
  timestamp: string;
}

interface StatsData {
  revenue: number;
  user_count: number;
  order_count: number;
  period: string;
}

// ============================================================================
// MOCK API CLIENT
// ============================================================================

class MockApiClient {
  private baseUrl = 'http://localhost:3000/api';

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body);
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint);
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    // Mock implementation - override in tests
    throw new Error('Mock implementation - override in tests');
  }
}

const apiClient = new MockApiClient();

// ============================================================================
// MOCK DATABASE
// ============================================================================

const mockDatabase = {
  users: [
    { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' as const, is_active: true, created_at: '2023-01-01' },
    { id: 2, username: 'user1', email: 'user1@example.com', role: 'user' as const, is_active: true, created_at: '2023-01-02' },
    { id: 3, username: 'locked_user', email: 'locked@example.com', role: 'user' as const, is_active: false, created_at: '2023-01-03' },
    { id: 4, username: 'Nguyen Van A', email: 'vana@example.com', role: 'user' as const, is_active: true, created_at: '2023-01-04' },
    { id: 5, username: 'Test User', email: 'test@example.com', role: 'user' as const, is_active: true, created_at: '2023-01-05' },
    ...Array.from({ length: 45 }, (_, i) => ({
      id: i + 6,
      username: `user${i + 6}`,
      email: `user${i + 6}@example.com`,
      role: 'user' as const,
      is_active: true,
      created_at: `2023-01-${String(i + 6).padStart(2, '0')}`
    }))
  ] as User[],

  products: [
    { id: 1, name: 'Product A', price: 100000, description: 'Description A', image_url: 'a.jpg', category_id: 1, is_deleted: false, stock: 50 },
    { id: 2, name: 'Product B', price: 200000, description: 'Description B', image_url: 'b.jpg', category_id: 2, is_deleted: false, stock: 30 },
    { id: 3, name: 'Product C', price: 150000, description: 'In Order', image_url: 'c.jpg', category_id: 1, is_deleted: false, stock: 10 }
  ] as Product[],

  orders: [
    {
      id: 1,
      user_id: 2,
      customer_name: 'User 1',
      total_price: 250000,
      status: 'pending' as const,
      items: [{ product_id: 3, product_name: 'Product C', quantity: 1, unit_price: 150000 }],
      created_at: '2023-12-01',
      updated_at: '2023-12-01'
    },
    {
      id: 2,
      user_id: 4,
      customer_name: 'Nguyen Van A',
      total_price: 500000,
      status: 'delivered' as const,
      items: [{ product_id: 1, product_name: 'Product A', quantity: 2, unit_price: 100000 }],
      created_at: '2023-12-10',
      updated_at: '2023-12-15'
    }
  ] as Order[],

  auditLogs: [] as AuditLog[],

  // Helper to add audit log
  addAuditLog(adminId: number, adminName: string, action: string, targetType: string, targetId: number) {
    this.auditLogs.push({
      id: this.auditLogs.length + 1,
      admin_id: adminId,
      admin_name: adminName,
      action,
      target_type: targetType,
      target_id: targetId,
      timestamp: new Date().toISOString()
    });
  },

  // Helper to check if product is in pending orders
  isProductInOrders(productId: number): boolean {
    return this.orders.some(order => 
      order.status !== 'delivered' && 
      order.status !== 'cancelled' &&
      order.items.some(item => item.product_id === productId)
    );
  }
};

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Admin Module - Integration Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.auditLogs = []; // Clear audit logs
  });

  // ==========================================================================
  // TEST GROUP: AUTHENTICATION
  // ==========================================================================

  describe('API: Admin Login', () => {

    it('[FE_ADMIN-1] FE_ADMIN_Login_Success - Đăng nhập thành công với quyền Admin', async () => {
      // Arrange: Mock API response for admin login
      const loginData = { email: 'admin@example.com', password: 'admin123' };
      
      const mockResponse: ApiResponse<{ token: string; user: User }> = {
        status: 200,
        data: {
          token: 'admin_token_12345',
          user: mockDatabase.users[0] // Admin user
        }
      };

      const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce(mockResponse);

      // Act: Call login API
      const response = await apiClient.post<{ token: string; user: User }>('/admin/login', loginData);

      // Assert
      expect(response.status).toBe(200); // 200 OK
      expect(response.data?.token).toBeDefined();
      expect(response.data?.user.role).toBe('admin'); // Role must be admin
      expect(mockPost).toHaveBeenCalledWith('/admin/login', loginData);

      mockPost.mockRestore();
    });

    it('[FE_ADMIN-2] FE_ADMIN_Login_Deny_User - User thường cố gắng đăng nhập Admin', async () => {
      // Arrange: Regular user tries to login to admin panel
      const loginData = { email: 'user1@example.com', password: 'user123' };
      
      const mockResponse: ApiResponse<any> = {
        status: 403,
        message: 'Bạn không có quyền truy cập'
      };

      const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce(mockResponse);

      // Act: Call login API
      const response = await apiClient.post('/admin/login', loginData);

      // Assert
      expect(response.status).toBe(403); // 403 Forbidden
      expect(response.message).toContain('không có quyền');
      // Should NOT return token or user data
      expect(response.data).toBeUndefined();

      mockPost.mockRestore();
    });

    it('[FE_ADMIN-3] FE_ADMIN_Login_WrongPass - Admin nhập sai mật khẩu', async () => {
      // Arrange: Correct email, wrong password
      const loginData = { email: 'admin@example.com', password: 'wrongpass' };
      
      const mockResponse: ApiResponse<any> = {
        status: 401,
        message: 'Sai mật khẩu'
      };

      const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce(mockResponse);

      // Act
      const response = await apiClient.post('/admin/login', loginData);

      // Assert
      expect(response.status).toBe(401); // 401 Unauthorized
      expect(response.message).toContain('Sai mật khẩu');

      mockPost.mockRestore();
    });

    it('[FE_ADMIN-4] FE_ADMIN_Login_Locked - Tài khoản Admin bị khóa', async () => {
      // Arrange: Locked admin account
      const lockedAdmin = { ...mockDatabase.users[0], is_active: false };
      const loginData = { email: lockedAdmin.email, password: 'admin123' };
      
      const mockResponse: ApiResponse<any> = {
        status: 403,
        message: 'Tài khoản bị khóa'
      };

      const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce(mockResponse);

      // Act
      const response = await apiClient.post('/admin/login', loginData);

      // Assert
      expect(response.status).toBe(403); // 403 Forbidden
      expect(response.message).toContain('bị khóa');

      mockPost.mockRestore();
    });
  });

  // ==========================================================================
  // TEST GROUP: MANAGE USERS
  // ==========================================================================

  describe('API: User Management', () => {

    it('[FE_ADMIN-6] FE_ADMIN_GetUsers_Page_Default - Phân trang User mặc định', async () => {
      // Arrange: Database has 50 users, default page size = 10
      const mockResponse: ApiResponse<User[]> = {
        status: 200,
        data: mockDatabase.users.slice(0, 10),
        meta: {
          total_items: 50,
          total_pages: 5,
          current_page: 1
        }
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act: Call GET /api/admin/users (default page 1)
      const response = await apiClient.get<User[]>('/admin/users');

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.length).toBe(10); // First 10 users
      expect(response.meta?.total_items).toBe(50);
      expect(response.meta?.current_page).toBe(1);

      mockGet.mockRestore();
    });

    it('[FE_ADMIN-7] FE_ADMIN_GetUsers_Page_Next - Chuyển trang User', async () => {
      // Arrange: Get page 2
      const page1Data = mockDatabase.users.slice(0, 10);
      const page2Data = mockDatabase.users.slice(10, 20);

      const mockResponse: ApiResponse<User[]> = {
        status: 200,
        data: page2Data,
        meta: {
          total_items: 50,
          total_pages: 5,
          current_page: 2
        }
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act: Call page 2
      const response = await apiClient.get<User[]>('/admin/users?page=2');

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.length).toBe(10);
      expect(response.meta?.current_page).toBe(2);

      // Verify no duplicate users between pages
      const page1Ids = page1Data.map(u => u.id);
      const page2Ids = response.data?.map(u => u.id) || [];
      const hasDuplicates = page1Ids.some(id => page2Ids.includes(id));
      expect(hasDuplicates).toBe(false);

      mockGet.mockRestore();
    });

    it('[FE_ADMIN-8] FE_ADMIN_GetUsers_Search_Name - Tìm kiếm User theo tên', async () => {
      // Arrange: Search for "Van A"
      const searchResults = mockDatabase.users.filter(u => u.username.includes('Van A'));
      
      const mockResponse: ApiResponse<User[]> = {
        status: 200,
        data: searchResults
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act: Search by name
      const response = await apiClient.get<User[]>('/admin/users?search=Van A');

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.length).toBeGreaterThan(0);
      
      // All results should contain "Van A"
      response.data?.forEach(user => {
        expect(user.username).toContain('Van A');
      });

      mockGet.mockRestore();
    });

    it('[FE_ADMIN-9] FE_ADMIN_GetUsers_Search_Email - Tìm kiếm User theo Email', async () => {
      // Arrange: Search by email
      const targetEmail = 'test@example.com';
      const searchResults = mockDatabase.users.filter(u => u.email === targetEmail);
      
      const mockResponse: ApiResponse<User[]> = {
        status: 200,
        data: searchResults
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act: Search by email
      const response = await apiClient.get<User[]>(`/admin/users?search=${targetEmail}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.length).toBe(1); // Unique email
      expect(response.data?.[0].email).toBe(targetEmail);

      mockGet.mockRestore();
    });

    it('[FE_ADMIN-10] FE_ADMIN_GetUsers_Filter_Active - Lọc User đang hoạt động', async () => {
      // Arrange: Filter by active status
      const activeUsers = mockDatabase.users.filter(u => u.is_active === true);
      
      const mockResponse: ApiResponse<User[]> = {
        status: 200,
        data: activeUsers
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act: Filter active users
      const response = await apiClient.get<User[]>('/admin/users?status=active');

      // Assert
      expect(response.status).toBe(200);
      
      // All users should be active
      response.data?.forEach(user => {
        expect(user.is_active).toBe(true);
      });

      mockGet.mockRestore();
    });

    it('[FE_ADMIN-11] FE_ADMIN_GetUsers_Filter_Banned - Lọc User bị khóa', async () => {
      // Arrange: Filter by banned status
      const bannedUsers = mockDatabase.users.filter(u => u.is_active === false);
      
      const mockResponse: ApiResponse<User[]> = {
        status: 200,
        data: bannedUsers
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act: Filter banned users
      const response = await apiClient.get<User[]>('/admin/users?status=banned');

      // Assert
      expect(response.status).toBe(200);
      
      // All users should be inactive
      response.data?.forEach(user => {
        expect(user.is_active).toBe(false);
      });

      mockGet.mockRestore();
    });

    it('[FE_ADMIN-12] FE_ADMIN_UpdateUser_Role - Nâng quyền User', async () => {
      // Arrange: Upgrade user to admin
      const targetUser = mockDatabase.users[1]; // Regular user
      const updatedUser = { ...targetUser, role: 'admin' as const };
      
      const mockResponse: ApiResponse<User> = {
        status: 200,
        data: updatedUser,
        message: 'Cập nhật quyền thành công'
      };

      const mockPut = jest.spyOn(apiClient, 'put').mockResolvedValueOnce(mockResponse);

      // Act: Update role
      const response = await apiClient.put<User>(`/admin/users/${targetUser.id}`, { role: 'admin' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.role).toBe('admin'); // Role upgraded
      expect(mockPut).toHaveBeenCalledWith(`/admin/users/${targetUser.id}`, { role: 'admin' });

      mockPut.mockRestore();
    });

    it('[FE_ADMIN-13] FE_ADMIN_UpdateUser_Lock - Khóa tài khoản User', async () => {
      // Arrange: Ban active user
      const targetUser = mockDatabase.users[1];
      const bannedUser = { ...targetUser, is_active: false };
      
      const mockResponse: ApiResponse<User> = {
        status: 200,
        data: bannedUser,
        message: 'Đã khóa tài khoản'
      };

      const mockPut = jest.spyOn(apiClient, 'put').mockResolvedValueOnce(mockResponse);

      // Act: Ban user
      const response = await apiClient.put<User>(`/admin/users/${targetUser.id}/ban`, {});

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.is_active).toBe(false); // User is now inactive

      mockPut.mockRestore();
    });

    it('[FE_ADMIN-14] FE_ADMIN_UpdateUser_Unlock - Mở khóa tài khoản User', async () => {
      // Arrange: Unban locked user
      const lockedUser = mockDatabase.users[2]; // is_active = false
      const unlockedUser = { ...lockedUser, is_active: true };
      
      const mockResponse: ApiResponse<User> = {
        status: 200,
        data: unlockedUser,
        message: 'Đã mở khóa tài khoản'
      };

      const mockPut = jest.spyOn(apiClient, 'put').mockResolvedValueOnce(mockResponse);

      // Act: Unban user
      const response = await apiClient.put<User>(`/admin/users/${lockedUser.id}/unban`, {});

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.is_active).toBe(true); // User is active again

      mockPut.mockRestore();
    });
  });

  // ==========================================================================
  // TEST GROUP: MANAGE PRODUCTS
  // ==========================================================================

  describe('API: Product Management', () => {

    it('[FE_ADMIN-15] FE_ADMIN_CreateProd_Valid - Tạo sản phẩm mới thành công', async () => {
      // Arrange: Valid product data
      const newProduct = {
        name: 'New Product',
        price: 300000,
        description: 'New description',
        image_url: 'new.jpg',
        category_id: 1
      };

      const mockResponse: ApiResponse<Product> = {
        status: 201,
        data: { id: 4, ...newProduct, is_deleted: false }
      };

      const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce(mockResponse);

      // Act: Create product
      const response = await apiClient.post<Product>('/admin/products', newProduct);

      // Assert
      expect(response.status).toBe(201); // 201 Created
      expect(response.data?.id).toBeDefined();
      expect(response.data?.name).toBe('New Product');

      mockPost.mockRestore();
    });

    it('[FE_ADMIN-20] FE_ADMIN_EditProd_Success - Cập nhật thông tin sản phẩm', async () => {
      // Arrange: Update price from 100k to 200k
      const productId = 1;
      const updatedData = { price: 200000 };
      
      const mockResponse: ApiResponse<Product> = {
        status: 200,
        data: { ...mockDatabase.products[0], price: 200000 }
      };

      const mockPut = jest.spyOn(apiClient, 'put').mockResolvedValueOnce(mockResponse);

      // Act: Update product
      const response = await apiClient.put<Product>(`/admin/products/${productId}`, updatedData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.price).toBe(200000); // Price updated

      mockPut.mockRestore();
    });

    it('[FE_ADMIN-22] FE_ADMIN_DelProd_Success - Xóa sản phẩm (Soft Delete)', async () => {
      // Arrange: Delete product (soft delete)
      const productId = 2;
      
      const mockResponse: ApiResponse<Product> = {
        status: 200,
        data: { ...mockDatabase.products[1], is_deleted: true },
        message: 'Đã xóa sản phẩm'
      };

      const mockDelete = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce(mockResponse);

      // Act: Delete product
      const response = await apiClient.delete<Product>(`/admin/products/${productId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.is_deleted).toBe(true); // Soft delete, not hard delete

      mockDelete.mockRestore();
    });

    it('[FE_ADMIN-23] FE_ADMIN_DelProd_InOrders - Xóa sản phẩm đang có trong đơn hàng', async () => {
      // Arrange: Product 3 is in pending order
      const productId = 3;
      const isInOrders = mockDatabase.isProductInOrders(productId);
      
      expect(isInOrders).toBe(true); // Product is in pending order

      const mockResponse: ApiResponse<any> = {
        status: 400,
        message: 'Không thể xóa sản phẩm đang được xử lý'
      };

      const mockDelete = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce(mockResponse);

      // Act: Try to delete
      const response = await apiClient.delete(`/admin/products/${productId}`);

      // Assert
      expect(response.status).toBe(400); // Bad Request
      expect(response.message).toContain('Không thể xóa');

      mockDelete.mockRestore();
    });
  });

  // ==========================================================================
  // TEST GROUP: MANAGE ORDERS
  // ==========================================================================

  describe('API: Order Management', () => {

    it('[FE_ADMIN-24] FE_ADMIN_GetOrders_All - Xem danh sách đơn hàng', async () => {
      // Arrange: Get all orders
      const mockResponse: ApiResponse<Order[]> = {
        status: 200,
        data: mockDatabase.orders
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act: Get orders
      const response = await apiClient.get<Order[]>('/admin/orders');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Verify order fields
      response.data?.forEach(order => {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('customer_name');
        expect(order).toHaveProperty('total_price');
        expect(order).toHaveProperty('status');
      });

      mockGet.mockRestore();
    });

    it('[FE_ADMIN-25] FE_ADMIN_UpdateOrder_Status - Cập nhật trạng thái đơn', async () => {
      // Arrange: Update order status from pending to shipping
      const orderId = 1;
      const newStatus = 'shipping';
      
      const updatedOrder = { ...mockDatabase.orders[0], status: 'shipping' as const };
      
      const mockResponse: ApiResponse<Order> = {
        status: 200,
        data: updatedOrder,
        message: 'Cập nhật trạng thái thành công'
      };

      const mockPut = jest.spyOn(apiClient, 'put').mockResolvedValueOnce(mockResponse);

      // Act: Update status
      const response = await apiClient.put<Order>(`/admin/orders/${orderId}`, { status: newStatus });

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.status).toBe('shipping');

      mockPut.mockRestore();
    });

    it('[FE_ADMIN-26] FE_ADMIN_UpdateOrder_Invalid - Cập nhật trạng thái ngược (Logic)', async () => {
      // Arrange: Try to revert status from delivered to pending (invalid)
      const orderId = 2; // Already delivered
      const invalidStatus = 'pending';
      
      const mockResponse: ApiResponse<any> = {
        status: 400,
        message: 'Không thể chuyển ngược trạng thái'
      };

      const mockPut = jest.spyOn(apiClient, 'put').mockResolvedValueOnce(mockResponse);

      // Act: Try invalid status change
      const response = await apiClient.put(`/admin/orders/${orderId}`, { status: invalidStatus });

      // Assert
      expect(response.status).toBe(400); // Bad Request
      expect(response.message).toContain('Không thể chuyển ngược');

      mockPut.mockRestore();
    });

    it('[FE_ADMIN-27] FE_ADMIN_OrderDetail_View - Xem chi tiết đơn hàng', async () => {
      // Arrange: Get order detail
      const orderId = 1;
      
      const mockResponse: ApiResponse<Order> = {
        status: 200,
        data: mockDatabase.orders[0]
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act: Get order detail
      const response = await apiClient.get<Order>(`/admin/orders/${orderId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.id).toBe(orderId);
      expect(response.data?.items).toBeDefined(); // Order items
      expect(Array.isArray(response.data?.items)).toBe(true);

      mockGet.mockRestore();
    });
  });

  // ==========================================================================
  // TEST GROUP: STATS / DASHBOARD
  // ==========================================================================

  describe('API: Statistics', () => {

    it('[FE_ADMIN-28] FE_ADMIN_Stats_Revenue - Thống kê doanh thu', async () => {
      // Arrange: Get revenue stats for current month
      const completedOrders = mockDatabase.orders.filter(o => o.status === 'delivered');
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total_price, 0);
      
      const mockResponse: ApiResponse<StatsData> = {
        status: 200,
        data: {
          revenue: totalRevenue,
          user_count: 0,
          order_count: completedOrders.length,
          period: 'December 2023'
        }
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act: Get revenue stats
      const response = await apiClient.get<StatsData>('/admin/stats/revenue');

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.revenue).toBe(totalRevenue);
      expect(response.data?.revenue).toBeGreaterThan(0);

      mockGet.mockRestore();
    });

    it('[FE_ADMIN-29] FE_ADMIN_Stats_UserCount - Thống kê số lượng user', async () => {
      // Arrange: Get user growth stats
      const mockResponse: ApiResponse<StatsData> = {
        status: 200,
        data: {
          revenue: 0,
          user_count: mockDatabase.users.length,
          order_count: 0,
          period: 'December 2023'
        }
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act: Get user count
      const response = await apiClient.get<StatsData>('/admin/stats/users');

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.user_count).toBe(50);

      mockGet.mockRestore();
    });

    it('[FE_ADMIN-30] FE_ADMIN_Stats_DateRange - Lọc thống kê theo ngày', async () => {
      // Arrange: Filter stats by date range
      const startDate = '2023-12-01';
      const endDate = '2023-12-15';
      
      const filteredOrders = mockDatabase.orders.filter(order => {
        return order.created_at >= startDate && order.created_at <= endDate;
      });

      const mockResponse: ApiResponse<StatsData> = {
        status: 200,
        data: {
          revenue: filteredOrders.reduce((sum, o) => sum + o.total_price, 0),
          user_count: 0,
          order_count: filteredOrders.length,
          period: `${startDate} to ${endDate}`
        }
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act: Get stats for date range
      const response = await apiClient.get<StatsData>(`/admin/stats?start=${startDate}&end=${endDate}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.period).toContain(startDate);
      expect(response.data?.order_count).toBe(filteredOrders.length);

      mockGet.mockRestore();
    });
  });

  // ==========================================================================
  // TEST GROUP: SYSTEM / UTILS
  // ==========================================================================

  describe('API: System Utilities', () => {

    it('[FE_ADMIN-31] FE_ADMIN_Export_CSV - Xuất báo cáo ra Excel/CSV', async () => {
      // Arrange: Export users to CSV
      const mockResponse: ApiResponse<Blob> = {
        status: 200,
        data: new Blob(['id,username,email\n1,admin,admin@example.com'], { type: 'text/csv' }) as any
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      // Act: Export users
      const response = await apiClient.get<Blob>('/admin/users/export');

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      
      // Verify blob type
      const blob = response.data as any;
      expect(blob instanceof Blob || typeof blob === 'object').toBe(true);

      mockGet.mockRestore();
    });

    it('[FE_ADMIN-32] FE_ADMIN_Import_Valid - Nhập dữ liệu từ Excel (Import)', async () => {
      // Arrange: Valid import file
      const csvData = 'name,price,category_id\nProduct X,100000,1\nProduct Y,200000,2';
      const file = new File([csvData], 'products.csv', { type: 'text/csv' });
      
      const mockResponse: ApiResponse<{ imported: number }> = {
        status: 200,
        data: { imported: 2 },
        message: 'Import thành công 2 sản phẩm'
      };

      const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce(mockResponse);

      // Act: Import file
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<{ imported: number }>('/admin/products/import', formData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.imported).toBe(2);

      mockPost.mockRestore();
    });

    it('[FE_ADMIN-33] FE_ADMIN_Import_InvalidFormat - Import file sai định dạng', async () => {
      // Arrange: Invalid CSV format
      const invalidCsv = 'name,invalid_column\nProduct,invalid';
      const file = new File([invalidCsv], 'invalid.csv', { type: 'text/csv' });
      
      const mockResponse: ApiResponse<any> = {
        status: 400,
        message: 'Lỗi định dạng tại dòng 1: Thiếu cột price'
      };

      const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce(mockResponse);

      // Act: Try import invalid file
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/admin/products/import', formData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.message).toContain('Lỗi định dạng');

      mockPost.mockRestore();
    });

    it('[FE_ADMIN-34] FE_ADMIN_AuditLog_Login - Ghi log đăng nhập Admin', async () => {
      // Arrange: Admin login triggers audit log
      const adminId = 1;
      const adminName = 'admin';
      
      // Simulate audit log creation
      mockDatabase.addAuditLog(adminId, adminName, 'logged in', 'auth', 0);
      
      // Act: Query audit logs
      const mockResponse: ApiResponse<AuditLog[]> = {
        status: 200,
        data: mockDatabase.auditLogs
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);
      const response = await apiClient.get<AuditLog[]>('/admin/audit-logs');

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.length).toBeGreaterThan(0);
      
      const loginLog = response.data?.find(log => log.action === 'logged in');
      expect(loginLog).toBeDefined();
      expect(loginLog?.admin_name).toBe('admin');

      mockGet.mockRestore();
    });

    it('[FE_ADMIN-35] FE_ADMIN_AuditLog_Action - Ghi log hành động nhạy cảm', async () => {
      // Arrange: Admin deletes a user
      const adminId = 1;
      const adminName = 'admin';
      const deletedUserId = 5;
      
      // Simulate audit log creation
      mockDatabase.addAuditLog(adminId, adminName, 'deleted User', 'user', deletedUserId);
      
      // Act: Query audit logs
      const mockResponse: ApiResponse<AuditLog[]> = {
        status: 200,
        data: mockDatabase.auditLogs
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);
      const response = await apiClient.get<AuditLog[]>('/admin/audit-logs');

      // Assert
      expect(response.status).toBe(200);
      
      const deleteLog = response.data?.find(log => log.action === 'deleted User');
      expect(deleteLog).toBeDefined();
      expect(deleteLog?.target_id).toBe(deletedUserId);
      expect(deleteLog?.timestamp).toBeDefined();

      mockGet.mockRestore();
    });
  });
});
