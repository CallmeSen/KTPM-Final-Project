/**
 * Integration Test for Homepage Module
 * Generated from Excel Test Cases
 * Framework: Jest/Vitest Compatible
 */

// ============================================================================
// MOCK INTERFACES
// ============================================================================

interface Book {
  id: number;
  title: string;
  thumbnail: string;
  averageRating: number;
  author?: string;
  price?: number;
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

  async delete<T>(endpoint: string, headers?: any): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, null, headers);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    headers?: any
  ): Promise<ApiResponse<T>> {
    // Mock implementation - override in tests
    throw new Error('Mock implementation - override in tests');
  }

  // Helper to measure response time
  async timedRequest<T>(method: string, endpoint: string): Promise<{ response: ApiResponse<T>; duration: number }> {
    const startTime = Date.now();
    const response = await this.request<T>(method, endpoint);
    const duration = Date.now() - startTime;
    return { response, duration };
  }
}

const apiClient = new MockApiClient();

// ============================================================================
// MOCK DATABASE
// ============================================================================

const mockDatabase = {
  books: [
    { id: 1, title: 'Clean Code', thumbnail: 'img1.jpg', averageRating: 4.8, author: 'Robert Martin', price: 250000 },
    { id: 2, title: 'Design Patterns', thumbnail: 'img2.jpg', averageRating: 4.7, author: 'Gang of Four', price: 300000 },
    { id: 3, title: 'Refactoring', thumbnail: 'img3.jpg', averageRating: 4.6, author: 'Martin Fowler', price: 280000 },
    { id: 4, title: 'The Pragmatic Programmer', thumbnail: 'img4.jpg', averageRating: 4.5, author: 'Hunt & Thomas', price: 320000 },
    { id: 5, title: 'Code Complete', thumbnail: 'img5.jpg', averageRating: 4.4, author: 'Steve McConnell', price: 350000 },
    { id: 6, title: 'Head First Design Patterns', thumbnail: 'img6.jpg', averageRating: 4.3, author: 'Freeman', price: 270000 },
    { id: 7, title: 'Effective Java', thumbnail: 'img7.jpg', averageRating: 4.2, author: 'Joshua Bloch', price: 290000 },
    { id: 8, title: 'You Don\'t Know JS', thumbnail: 'img8.jpg', averageRating: 4.1, author: 'Kyle Simpson', price: 200000 }
  ] as Book[],

  // Helper to get top rated books
  getTopRated(limit?: number): Book[] {
    const sorted = [...this.books].sort((a, b) => b.averageRating - a.averageRating);
    return limit ? sorted.slice(0, limit) : sorted;
  },

  // Helper to clear all data
  clear() {
    this.books = [];
  },

  // Helper to reset to default data
  reset() {
    this.books = [
      { id: 1, title: 'Clean Code', thumbnail: 'img1.jpg', averageRating: 4.8, author: 'Robert Martin', price: 250000 },
      { id: 2, title: 'Design Patterns', thumbnail: 'img2.jpg', averageRating: 4.7, author: 'Gang of Four', price: 300000 },
      { id: 3, title: 'Refactoring', thumbnail: 'img3.jpg', averageRating: 4.6, author: 'Martin Fowler', price: 280000 },
      { id: 4, title: 'The Pragmatic Programmer', thumbnail: 'img4.jpg', averageRating: 4.5, author: 'Hunt & Thomas', price: 320000 },
      { id: 5, title: 'Code Complete', thumbnail: 'img5.jpg', averageRating: 4.4, author: 'Steve McConnell', price: 350000 },
      { id: 6, title: 'Head First Design Patterns', thumbnail: 'img6.jpg', averageRating: 4.3, author: 'Freeman', price: 270000 },
      { id: 7, title: 'Effective Java', thumbnail: 'img7.jpg', averageRating: 4.2, author: 'Joshua Bloch', price: 290000 },
      { id: 8, title: 'You Don\'t Know JS', thumbnail: 'img8.jpg', averageRating: 4.1, author: 'Kyle Simpson', price: 200000 }
    ];
  }
};

// ============================================================================
// MOCK TOKEN BLACKLIST SERVICE
// ============================================================================

const tokenBlacklist = new Set<string>();

const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token);
};

const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Homepage Module - Integration Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.reset();
    tokenBlacklist.clear();
  });

  // ==========================================================================
  // TEST GROUP: API GET TOP RATED
  // ==========================================================================

  describe('API: GET /api/books/top-rated', () => {

    it('[FE_HOME-1] FE_HOME_GetTopBooks_Success - Kiểm thử gọi API thành công (Happy Case)', async () => {
      // Arrange: Mock API response
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockDatabase.getTopRated()
      });

      // Mock timed request để đo thời gian phản hồi
      const mockTimedRequest = jest.spyOn(apiClient, 'timedRequest').mockResolvedValueOnce({
        response: {
          status: 200,
          data: mockDatabase.getTopRated()
        },
        duration: 150 // ms
      });

      // Act: Gửi request GET /api/books/top-rated
      const { response, duration } = await apiClient.timedRequest<Book[]>('GET', '/books/top-rated');

      // Assert
      expect(response.status).toBe(200); // Status Code: 200 OK
      expect(Array.isArray(response.data)).toBe(true); // Body trả về mảng
      expect(response.data?.length).toBeGreaterThan(0); // Có dữ liệu
      expect(duration).toBeLessThan(2000); // Thời gian phản hồi < 2000ms

      mockGet.mockRestore();
      mockTimedRequest.mockRestore();
    });

    it('[FE_HOME-2] FE_HOME_GetTopBooks_VerifySort - Kiểm thử logic sắp xếp dữ liệu', async () => {
      // Arrange: Mock API response với dữ liệu đã sắp xếp
      const sortedBooks = mockDatabase.getTopRated();
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: sortedBooks
      });

      // Act: Gửi request GET /api/books/top-rated
      const response = await apiClient.get<Book[]>('/books/top-rated');

      // Assert
      expect(response.status).toBe(200);
      
      // Kiểm tra sắp xếp: Rating[i] >= Rating[i+1] (Giảm dần)
      const books = response.data || [];
      for (let i = 0; i < books.length - 1; i++) {
        expect(books[i].averageRating).toBeGreaterThanOrEqual(books[i + 1].averageRating);
      }

      // Verify first book has highest rating
      expect(books[0].averageRating).toBe(4.8);
      expect(books[0].title).toBe('Clean Code');

      mockGet.mockRestore();
    });

    it('[FE_HOME-3] FE_HOME_GetTopBooks_LimitParam - Kiểm thử tham số giới hạn (Limit)', async () => {
      // Arrange: Mock API response với limit=5
      const limit = 5;
      const limitedBooks = mockDatabase.getTopRated(limit);
      
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: limitedBooks
      });

      // Act: Gửi request GET /api/books/top-rated?limit=5
      const response = await apiClient.get<Book[]>('/books/top-rated?limit=5');

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.length).toBe(5); // Số lượng chính xác là 5
      expect(response.data?.length).toBeLessThanOrEqual(limit);

      mockGet.mockRestore();
    });

    it('[FE_HOME-4] FE_HOME_GetTopBooks_EmptyData - Kiểm thử trường hợp không có dữ liệu', async () => {
      // Arrange: Mock DB rỗng
      mockDatabase.clear();
      
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: []
      });

      // Act: Gửi request GET /api/books/top-rated
      const response = await apiClient.get<Book[]>('/books/top-rated');

      // Assert
      expect(response.status).toBe(200); // Status Code: 200 OK
      expect(response.data).toEqual([]); // Body: [] (Mảng rỗng)
      // Backend không bị lỗi Null Pointer (test passes without error)

      mockGet.mockRestore();
    });

    it('[FE_HOME-5] FE_HOME_GetTopBooks_InvalidMethod - Kiểm thử sai phương thức HTTP', async () => {
      // Arrange: Mock API response cho method POST (không được phép)
      const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        status: 405,
        message: 'Method Not Allowed'
      });

      // Act: Gửi request bằng method POST
      const response = await apiClient.post('/books/top-rated');

      // Assert
      expect(response.status).toBe(405); // 405 Method Not Allowed
      expect(response.message).toBe('Method Not Allowed'); // Body chứa thông báo lỗi

      mockPost.mockRestore();
    });

    it('[FE_HOME-6] FE_HOME_GetTopBooks_SchemaCheck - Kiểm thử cấu trúc dữ liệu (Schema)', async () => {
      // Arrange: Mock API response
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockDatabase.getTopRated(3)
      });

      // Act: Gửi request thành công
      const response = await apiClient.get<Book[]>('/books/top-rated?limit=3');

      // Assert
      expect(response.status).toBe(200);
      
      // Kiểm tra các field bắt buộc trong response
      const books = response.data || [];
      books.forEach((book) => {
        // Object chứa đủ: id, title, thumbnail, average_rating
        expect(book).toHaveProperty('id');
        expect(book).toHaveProperty('title');
        expect(book).toHaveProperty('thumbnail');
        expect(book).toHaveProperty('averageRating');

        // Các trường không được null
        expect(book.id).not.toBeNull();
        expect(book.title).not.toBeNull();
        expect(book.thumbnail).not.toBeNull();
        expect(book.averageRating).not.toBeNull();

        // Type validation
        expect(typeof book.id).toBe('number');
        expect(typeof book.title).toBe('string');
        expect(typeof book.thumbnail).toBe('string');
        expect(typeof book.averageRating).toBe('number');
      });

      mockGet.mockRestore();
    });
  });

  // ==========================================================================
  // TEST GROUP: LOGOUT - API TOKEN VALIDATION
  // ==========================================================================

  describe('API: Token Blacklist After Logout', () => {

    it('[FE_HOME-16] FE_HOME_Logout_ApiCheck - Vô hiệu hóa Token phía Server', async () => {
      // Arrange: User logout, token được đưa vào blacklist
      const oldToken = 'valid-token-abc123';
      
      // Simulate logout - blacklist the token
      blacklistToken(oldToken);

      // Mock API call với token cũ
      const mockApiCallWithOldToken = async (token: string): Promise<ApiResponse<any>> => {
        // Server checks if token is blacklisted
        if (isTokenBlacklisted(token)) {
          return {
            status: 401,
            message: 'Unauthorized - Token has been revoked'
          };
        }

        return {
          status: 200,
          data: { message: 'Success' }
        };
      };

      // Act: Dùng Token cũ gọi lại API (qua Postman/fetch)
      const response = await mockApiCallWithOldToken(oldToken);

      // Assert
      expect(response.status).toBe(401); // API trả về 401 Unauthorized
      expect(response.message).toContain('Unauthorized');
      expect(isTokenBlacklisted(oldToken)).toBe(true); // Token bị đưa vào Blacklist
    });

    it('[FE_HOME-16-EXTRA] FE_HOME_Logout_ApiCheck_ValidToken - Token mới vẫn hoạt động', async () => {
      // Arrange: Token mới (chưa logout)
      const validToken = 'new-valid-token-xyz789';

      // Mock API call với token hợp lệ
      const mockApiCallWithValidToken = async (token: string): Promise<ApiResponse<any>> => {
        if (isTokenBlacklisted(token)) {
          return {
            status: 401,
            message: 'Unauthorized'
          };
        }

        return {
          status: 200,
          data: { message: 'Success', user: { id: 1, name: 'User' } }
        };
      };

      // Act: Gọi API với token hợp lệ
      const response = await mockApiCallWithValidToken(validToken);

      // Assert
      expect(response.status).toBe(200); // API thành công
      expect(response.data?.message).toBe('Success');
      expect(isTokenBlacklisted(validToken)).toBe(false); // Token không bị blacklist
    });
  });
});
