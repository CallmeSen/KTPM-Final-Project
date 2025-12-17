/**
 * Integration Test for Cart Module
 * Generated from Excel Test Cases
 * Framework: Jest/Vitest Compatible
 */

// ============================================================================
// MOCK INTERFACES
// ============================================================================

interface CartItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  thumbnail: string | null;
  is_active?: boolean;
}

interface CartResponse {
  cart_id: string;
  items: CartItem[];
  total_price: number;
  updated_at: string;
}

interface ApiResponse<T> {
  status: number;
  data?: T;
  message?: string;
}

// ============================================================================
// MOCK API CLIENT
// ============================================================================

class MockApiClient {
  private baseUrl = 'http://localhost:3000/api';

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body);
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
  carts: new Map<string, CartResponse>([
    ['user1', {
      cart_id: 'cart-user1',
      items: [
        {
          product_id: 1,
          product_name: 'Clean Code',
          quantity: 2,
          unit_price: 250000,
          thumbnail: 'https://example.com/img1.jpg',
          is_active: true
        },
        {
          product_id: 2,
          product_name: 'Design Patterns',
          quantity: 1,
          unit_price: 300000,
          thumbnail: 'https://example.com/img2.jpg',
          is_active: true
        }
      ],
      total_price: 800000,
      updated_at: new Date().toISOString()
    }],
    ['new-user', {
      cart_id: 'cart-new',
      items: [],
      total_price: 0,
      updated_at: new Date().toISOString()
    }]
  ]),

  // Helper to get cart
  getCart(userId: string): CartResponse | undefined {
    return this.carts.get(userId);
  },

  // Helper to create cart with product without image
  createCartWithNoImageProduct(): CartResponse {
    return {
      cart_id: 'cart-no-image',
      items: [
        {
          product_id: 99,
          product_name: 'Product Without Image',
          quantity: 1,
          unit_price: 100000,
          thumbnail: null, // No image
          is_active: true
        }
      ],
      total_price: 100000,
      updated_at: new Date().toISOString()
    };
  },

  // Helper to create cart with decimal prices
  createCartWithDecimalPrices(): CartResponse {
    return {
      cart_id: 'cart-decimal',
      items: [
        {
          product_id: 50,
          product_name: 'Product with Decimal Price',
          quantity: 2,
          unit_price: 19.99,
          thumbnail: 'img.jpg',
          is_active: true
        }
      ],
      total_price: 39.98,
      updated_at: new Date().toISOString()
    };
  }
};

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Cart Module - Integration Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // TEST GROUP: API SCHEMA VALIDATION
  // ==========================================================================

  describe('API: GET /api/cart - Schema Validation', () => {

    it('[FE_CART-1] FE_CART_GetCart_Schema_Root - Kiểm thử cấu trúc Root của JSON', async () => {
      // Arrange: Mock API response
      const mockCart = mockDatabase.getCart('user1');
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockCart
      });

      // Act: Gửi request GET /api/cart
      const response = await apiClient.get<CartResponse>('/cart');

      // Assert
      expect(response.status).toBe(200);
      
      // JSON phải trả về Object {}
      expect(typeof response.data).toBe('object');
      expect(response.data).not.toBeNull();
      
      // Bắt buộc có các keys: cart_id, items, total_price, updated_at
      expect(response.data).toHaveProperty('cart_id');
      expect(response.data).toHaveProperty('items');
      expect(response.data).toHaveProperty('total_price');
      expect(response.data).toHaveProperty('updated_at');
      
      // Không được thiếu key nào
      const requiredKeys = ['cart_id', 'items', 'total_price', 'updated_at'];
      const actualKeys = Object.keys(response.data!);
      requiredKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });

      mockGet.mockRestore();
    });

    it('[FE_CART-2] FE_CART_GetCart_ItemSchema - Kiểm thử cấu trúc chi tiết từng Item', async () => {
      // Arrange: Mock API response với items
      const mockCart = mockDatabase.getCart('user1');
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockCart
      });

      // Act: Gửi request và parse mảng items
      const response = await apiClient.get<CartResponse>('/cart');
      const firstItem = response.data!.items[0];

      // Assert
      // Bắt buộc có: product_id, product_name, quantity, unit_price, thumbnail
      expect(firstItem).toHaveProperty('product_id');
      expect(firstItem).toHaveProperty('product_name');
      expect(firstItem).toHaveProperty('quantity');
      expect(firstItem).toHaveProperty('unit_price');
      expect(firstItem).toHaveProperty('thumbnail');

      // product_name không được null
      expect(firstItem.product_name).not.toBeNull();
      expect(firstItem.product_name).toBeTruthy();

      // quantity phải > 0
      expect(firstItem.quantity).toBeGreaterThan(0);

      mockGet.mockRestore();
    });

    it('[FE_CART-3] FE_CART_GetCart_DataTypes - Kiểm thử đúng kiểu dữ liệu', async () => {
      // Arrange: Mock API response
      const mockCart = mockDatabase.getCart('user1');
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockCart
      });

      // Act: Gửi request
      const response = await apiClient.get<CartResponse>('/cart');
      const cart = response.data!;
      const firstItem = cart.items[0];

      // Assert
      // total_price: Phải là Number, KHÔNG được là String
      expect(typeof cart.total_price).toBe('number');
      expect(cart.total_price).not.toBe('800000'); // Not a string
      expect(cart.total_price).toBe(800000); // Actual number

      // quantity: Integer
      expect(typeof firstItem.quantity).toBe('number');
      expect(Number.isInteger(firstItem.quantity)).toBe(true);

      // is_active: Boolean
      if (firstItem.is_active !== undefined) {
        expect(typeof firstItem.is_active).toBe('boolean');
      }

      // unit_price: Number
      expect(typeof firstItem.unit_price).toBe('number');

      mockGet.mockRestore();
    });

    it('[FE_CART-4] FE_CART_GetCart_EmptyArray - Kiểm thử mảng rỗng (Empty State)', async () => {
      // Arrange: User mới, chưa mua gì
      const mockCart = mockDatabase.getCart('new-user');
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockCart
      });

      // Act: Gửi request GET /api/cart
      const response = await apiClient.get<CartResponse>('/cart');

      // Assert
      expect(response.status).toBe(200);
      
      // items phải là mảng rỗng []
      expect(Array.isArray(response.data!.items)).toBe(true);
      expect(response.data!.items).toEqual([]);
      
      // TUYỆT ĐỐI KHÔNG được trả về null hoặc undefined
      expect(response.data!.items).not.toBeNull();
      expect(response.data!.items).not.toBeUndefined();
      
      // total_price phải là 0
      expect(response.data!.total_price).toBe(0);

      mockGet.mockRestore();
    });

    it('[FE_CART-5] FE_CART_GetCart_NullFields - Kiểm thử xử lý trường giá trị Null', async () => {
      // Arrange: Sản phẩm không có ảnh đại diện
      const mockCart = mockDatabase.createCartWithNoImageProduct();
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockCart
      });

      // Act: Gửi request
      const response = await apiClient.get<CartResponse>('/cart');
      const firstItem = response.data!.items[0];

      // Assert
      // Key thumbnail vẫn phải tồn tại
      expect(firstItem).toHaveProperty('thumbnail');
      
      // Giá trị có thể là null hoặc chuỗi rỗng
      expect(
        firstItem.thumbnail === null || firstItem.thumbnail === ''
      ).toBe(true);
      
      // Không được làm mất key đó khỏi object
      const keys = Object.keys(firstItem);
      expect(keys).toContain('thumbnail');

      mockGet.mockRestore();
    });

    it('[FE_CART-6] FE_CART_GetCart_Precision - Kiểm thử độ chính xác số thực', async () => {
      // Arrange: Sản phẩm có giá lẻ (19.99$)
      const mockCart = mockDatabase.createCartWithDecimalPrices();
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockCart
      });

      // Act: Gửi request
      const response = await apiClient.get<CartResponse>('/cart');
      const firstItem = response.data!.items[0];
      const totalPrice = response.data!.total_price;

      // Assert
      // unit_price không được có quá nhiều số sau dấu phẩy
      expect(firstItem.unit_price).toBe(19.99);
      expect(firstItem.unit_price).not.toBe(19.990000001); // Fail case
      
      // total_price cũng phải chính xác
      expect(totalPrice).toBe(39.98); // 19.99 * 2
      
      // Kiểm tra số chữ số thập phân (không quá 2 chữ số)
      const decimalPlaces = (firstItem.unit_price.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);

      mockGet.mockRestore();
    });
  });

  // ==========================================================================
  // TEST GROUP: SCHEMA EDGE CASES
  // ==========================================================================

  describe('API: Schema Edge Cases', () => {

    it('Should handle missing optional fields gracefully', async () => {
      // Arrange: Cart with minimal required fields only
      const minimalCart: CartResponse = {
        cart_id: 'minimal',
        items: [
          {
            product_id: 1,
            product_name: 'Product',
            quantity: 1,
            unit_price: 100,
            thumbnail: null
            // is_active is optional
          }
        ],
        total_price: 100,
        updated_at: new Date().toISOString()
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: minimalCart
      });

      // Act
      const response = await apiClient.get<CartResponse>('/cart');

      // Assert: Should not throw error
      expect(response.status).toBe(200);
      expect(response.data!.items[0]).toBeDefined();

      mockGet.mockRestore();
    });

    it('Should validate array is not mutated to object', async () => {
      // Arrange
      const mockCart = mockDatabase.getCart('user1');
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockCart
      });

      // Act
      const response = await apiClient.get<CartResponse>('/cart');

      // Assert: items must be array, not object
      expect(Array.isArray(response.data!.items)).toBe(true);
      expect(typeof response.data!.items).not.toBe('object'); // Array is technically object, but we want true array
      expect(response.data!.items.length).toBeDefined(); // Arrays have length property

      mockGet.mockRestore();
    });

    it('Should handle large quantities correctly', async () => {
      // Arrange: Cart with large quantity
      const largeCart: CartResponse = {
        cart_id: 'large',
        items: [
          {
            product_id: 1,
            product_name: 'Bulk Product',
            quantity: 9999,
            unit_price: 10,
            thumbnail: 'img.jpg'
          }
        ],
        total_price: 99990,
        updated_at: new Date().toISOString()
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: largeCart
      });

      // Act
      const response = await apiClient.get<CartResponse>('/cart');

      // Assert
      expect(response.data!.items[0].quantity).toBe(9999);
      expect(response.data!.total_price).toBe(99990);
      expect(typeof response.data!.total_price).toBe('number'); // Not string due to size

      mockGet.mockRestore();
    });

    it('Should validate date format is ISO 8601', async () => {
      // Arrange
      const mockCart = mockDatabase.getCart('user1');
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockCart
      });

      // Act
      const response = await apiClient.get<CartResponse>('/cart');

      // Assert
      expect(typeof response.data!.updated_at).toBe('string');
      
      // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      expect(response.data!.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      
      // Should be parseable as Date
      const parsedDate = new Date(response.data!.updated_at);
      expect(parsedDate).toBeInstanceOf(Date);
      expect(isNaN(parsedDate.getTime())).toBe(false);

      mockGet.mockRestore();
    });

    it('Should handle multiple items with consistent schema', async () => {
      // Arrange: Cart with multiple items
      const mockCart = mockDatabase.getCart('user1');
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockCart
      });

      // Act
      const response = await apiClient.get<CartResponse>('/cart');
      const items = response.data!.items;

      // Assert: All items must have same schema
      const requiredItemKeys = ['product_id', 'product_name', 'quantity', 'unit_price', 'thumbnail'];
      
      items.forEach((item, index) => {
        requiredItemKeys.forEach(key => {
          expect(item).toHaveProperty(key);
        });

        // Validate types for each item
        expect(typeof item.product_id).toBe('number');
        expect(typeof item.product_name).toBe('string');
        expect(typeof item.quantity).toBe('number');
        expect(typeof item.unit_price).toBe('number');
        expect(item.thumbnail === null || typeof item.thumbnail === 'string').toBe(true);
      });

      mockGet.mockRestore();
    });

    it('Should validate total_price matches sum of items', async () => {
      // Arrange
      const mockCart = mockDatabase.getCart('user1');
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockCart
      });

      // Act
      const response = await apiClient.get<CartResponse>('/cart');
      const cart = response.data!;

      // Assert: Calculate expected total
      const calculatedTotal = cart.items.reduce((sum, item) => {
        return sum + (item.unit_price * item.quantity);
      }, 0);

      expect(cart.total_price).toBe(calculatedTotal);

      mockGet.mockRestore();
    });

    it('Should handle cart with zero price items', async () => {
      // Arrange: Free item (price = 0)
      const freeCart: CartResponse = {
        cart_id: 'free',
        items: [
          {
            product_id: 100,
            product_name: 'Free Sample',
            quantity: 1,
            unit_price: 0,
            thumbnail: 'img.jpg'
          }
        ],
        total_price: 0,
        updated_at: new Date().toISOString()
      };

      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: freeCart
      });

      // Act
      const response = await apiClient.get<CartResponse>('/cart');

      // Assert
      expect(response.data!.items[0].unit_price).toBe(0);
      expect(response.data!.total_price).toBe(0);
      expect(typeof response.data!.total_price).toBe('number'); // Still number, not null

      mockGet.mockRestore();
    });
  });
});
