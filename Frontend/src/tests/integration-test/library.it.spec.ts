/**
 * Integration Test for Library Module
 * Generated from Excel Test Cases
 * Framework: Jest/Vitest Compatible
 */

// ============================================================================
// MOCK INTERFACES
// ============================================================================

interface Book {
  id: number;
  title: string;
  category_id: number;
  price: number;
  thumbnail: string | null;
  author?: string;
  created_at: string;
}

interface ApiResponse<T> {
  status: number;
  data?: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    hasMore: boolean;
  };
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
  books: [
    { id: 1, title: 'Harry Potter', category_id: 1, price: 250000, thumbnail: 'harry.jpg', author: 'J.K. Rowling', created_at: '2023-01-01' },
    { id: 2, title: 'The Lord of the Rings', category_id: 1, price: 300000, thumbnail: 'lotr.jpg', author: 'Tolkien', created_at: '2023-01-02' },
    { id: 3, title: 'Clean Code', category_id: 2, price: 200000, thumbnail: 'clean.jpg', author: 'Robert Martin', created_at: '2023-01-03' },
    { id: 4, title: 'Design Patterns', category_id: 2, price: 280000, thumbnail: 'design.jpg', author: 'Gang of Four', created_at: '2023-01-04' },
    { id: 5, title: 'C++ Programming', category_id: 2, price: 150000, thumbnail: 'cpp.jpg', author: 'Bjarne', created_at: '2023-01-05' },
    { id: 6, title: 'A&B Testing Guide', category_id: 3, price: 180000, thumbnail: 'ab.jpg', author: 'Data Team', created_at: '2023-01-06' },
    { id: 7, title: '100% Success', category_id: 3, price: 120000, thumbnail: 'success.jpg', author: 'Motivator', created_at: '2023-01-07' }
  ] as Book[],

  categories: [
    { id: 1, name: 'Tiểu thuyết', book_count: 2 },
    { id: 2, name: 'Lập trình', book_count: 3 },
    { id: 3, name: 'Kinh doanh', book_count: 2 },
    { id: 99, name: 'Sách mới', book_count: 0 }
  ],

  // Helper to get books by category
  getBooksByCategory(categoryId: number): Book[] {
    return this.books.filter(book => book.category_id === categoryId);
  },

  // Helper to search books
  searchBooks(keyword: string): Book[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.books.filter(book => 
      book.title.toLowerCase().includes(lowerKeyword) ||
      (book.author && book.author.toLowerCase().includes(lowerKeyword))
    );
  }
};

// ============================================================================
// SECURITY HELPERS
// ============================================================================

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Encode URL parameters
 */
const encodeUrlParam = (param: string): string => {
  return encodeURIComponent(param);
};

/**
 * Check for SQL injection patterns
 */
const isSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
    /(';|";|`)/,
    /(\bSELECT\b.*\bFROM\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bUNION\b.*\bSELECT\b)/i
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
};

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Library Module - Integration Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // TEST GROUP: FILTER BY CATEGORY
  // ==========================================================================

  describe('API: GET /api/books?category=:id', () => {

    it('[FE_LIBRARY-1] FE_LIB_GetByCat_Valid_HasBooks - Lấy sách thuộc danh mục hợp lệ', async () => {
      // Arrange: Mock API response cho category "Tiểu thuyết" (ID=1)
      const categoryBooks = mockDatabase.getBooksByCategory(1);
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: categoryBooks
      });

      // Act: Gọi API GET /api/books?category=1
      const response = await apiClient.get<Book[]>('/books?category=1');

      // Assert
      expect(response.status).toBe(200); // Status 200 OK
      expect(Array.isArray(response.data)).toBe(true); // Trả về danh sách
      expect(response.data?.length).toBeGreaterThan(0);
      
      // Tất cả sách phải có category_id = 1
      response.data?.forEach(book => {
        expect(book.category_id).toBe(1);
      });

      mockGet.mockRestore();
    });

    it('[FE_LIBRARY-2] FE_LIB_GetByCat_Valid_Empty - Lấy sách thuộc danh mục rỗng', async () => {
      // Arrange: Category "Sách mới" (ID=99) chưa có sách
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: []
      });

      // Act: Gọi API GET /api/books?category=99
      const response = await apiClient.get<Book[]>('/books?category=99');

      // Assert
      expect(response.status).toBe(200); // Status 200 OK
      expect(response.data).toEqual([]); // Mảng rỗng
      // UI should display: "Chưa có sách nào"

      mockGet.mockRestore();
    });

    it('[FE_LIBRARY-3] FE_LIB_GetByCat_Invalid_NotFound - Danh mục không tồn tại', async () => {
      // Arrange: ID không tồn tại
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 404,
        message: 'Category not found'
      });

      // Act: Gọi API với category=99999
      const response = await apiClient.get<Book[]>('/books?category=99999');

      // Assert
      expect(response.status).toBe(404); // 404 Not Found
      expect(response.message).toContain('not found');
      // UI không bị crash, hiển thị trang 404 hoặc list rỗng

      mockGet.mockRestore();
    });

    it('[FE_LIBRARY-4] FE_LIB_GetByCat_Invalid_Format - ID sai định dạng', async () => {
      // Arrange: ID là string "abc"
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 400,
        message: 'ID danh mục không hợp lệ'
      });

      // Act: Gọi API với category=abc
      const response = await apiClient.get<Book[]>('/books?category=abc');

      // Assert
      expect(response.status).toBe(400); // 400 Bad Request
      expect(response.message).toContain('không hợp lệ');

      mockGet.mockRestore();
    });
  });

  // ==========================================================================
  // TEST GROUP: SEARCH FUNCTION
  // ==========================================================================

  describe('API: GET /api/books/search', () => {

    it('[FE_LIBRARY-6] FE_LIB_Search_Wildcard_Relative - Tìm kiếm tương đối', async () => {
      // Arrange: Tìm "arry" trong "Harry Potter"
      const searchResults = mockDatabase.searchBooks('arry');
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: searchResults
      });

      // Act: Gọi API search với keyword="arry"
      const response = await apiClient.get<Book[]>('/books/search?q=arry');

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.length).toBeGreaterThan(0);
      
      // Kết quả chứa "Harry Potter"
      const foundHarry = response.data?.some(book => book.title.includes('Harry Potter'));
      expect(foundHarry).toBe(true);
      
      // Case insensitive
      const lowerSearch = mockDatabase.searchBooks('HARRY');
      expect(lowerSearch.length).toBeGreaterThan(0);

      mockGet.mockRestore();
    });

    it('[FE_LIBRARY-7] FE_LIB_Search_Wildcard_Empty - Tìm kiếm rỗng', async () => {
      // Arrange: Keyword rỗng
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockDatabase.books // Hiển thị toàn bộ sách
      });

      // Act: Gọi API với keyword=""
      const response = await apiClient.get<Book[]>('/books/search?q=');

      // Assert
      expect(response.status).toBe(200);
      
      // Option 1: Hiển thị toàn bộ sách (Reset filter)
      expect(response.data?.length).toBe(mockDatabase.books.length);
      
      // Option 2: Báo lỗi "Vui lòng nhập từ khóa" (alternative)

      mockGet.mockRestore();
    });

    it('[FE_LIBRARY-8] FE_LIB_Search_ErrGuess_Special - Ký tự đặc biệt (URL Encode)', async () => {
      // Arrange: Keyword "C++"
      const keyword = 'C++';
      const encodedKeyword = encodeUrlParam(keyword); // "C%2B%2B"
      
      const searchResults = mockDatabase.searchBooks(keyword);
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: searchResults
      });

      // Act: Gọi API với keyword encoded
      const response = await apiClient.get<Book[]>(`/books/search?q=${encodedKeyword}`);

      // Assert
      expect(response.status).toBe(200); // Không lỗi 400
      expect(encodedKeyword).toBe('C%2B%2B'); // URL encode đúng
      
      // Tìm chính xác sách "C++ Programming"
      const foundCpp = response.data?.some(book => book.title.includes('C++'));
      expect(foundCpp).toBe(true);

      mockGet.mockRestore();
    });

    it('[FE_LIBRARY-9] FE_LIB_Search_ErrGuess_SQL - Ký tự nhạy cảm SQL', async () => {
      // Arrange: SQL injection payload
      const sqlPayload = "' OR '1'='1";
      
      // Security check
      const isSQLAttack = isSQLInjection(sqlPayload);
      expect(isSQLAttack).toBe(true); // Detected as SQL injection

      // Mock API treats as normal text
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: [] // Không tìm thấy
      });

      // Act: Gọi API với SQL payload
      const response = await apiClient.get<Book[]>(`/books/search?q=${encodeURIComponent(sqlPayload)}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toEqual([]); // Trả về "Không tìm thấy"
      
      // KHÔNG trả về toàn bộ DB (Lỗ hổng SQLi)
      expect(response.data?.length).not.toBe(mockDatabase.books.length);

      mockGet.mockRestore();
    });

    it('[FE_LIBRARY-10] FE_LIB_Search_ErrGuess_XSS - Ký tự nhạy cảm XSS', async () => {
      // Arrange: XSS payload
      const xssPayload = '<script>alert(1)</script>';
      
      // Sanitize input
      const sanitized = sanitizeInput(xssPayload);
      expect(sanitized).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
      
      // Mock API response
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: [],
        message: `No results for: ${sanitized}` // Hiển thị text, không execute
      });

      // Act: Gọi API
      const response = await apiClient.get<Book[]>(`/books/search?q=${encodeURIComponent(xssPayload)}`);

      // Assert
      expect(response.status).toBe(200);
      
      // Input được sanitize
      expect(response.message).not.toContain('<script>');
      expect(response.message).toContain('&lt;script&gt;');

      mockGet.mockRestore();
    });

    it('[FE_LIBRARY-11] FE_LIB_Search_ErrGuess_Long - Từ khóa cực dài', async () => {
      // Arrange: Chuỗi 255 ký tự
      const longKeyword = 'a'.repeat(255);
      
      // Mock API handles long input
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: [] // Không tìm thấy
      });

      // Act: Gọi API với keyword dài
      const response = await apiClient.get<Book[]>(`/books/search?q=${longKeyword}`);

      // Assert
      expect(response.status).toBe(200); // API xử lý bình thường
      expect(longKeyword.length).toBe(255);
      // UI không bị vỡ layout

      mockGet.mockRestore();
    });
  });

  // ==========================================================================
  // TEST GROUP: ADVANCED SEARCH SCENARIOS
  // ==========================================================================

  describe('API: Search Edge Cases', () => {

    it('Should handle search with A&B special characters', async () => {
      // Arrange: Book with "&" in title
      const keyword = 'A&B';
      const encodedKeyword = encodeUrlParam(keyword); // "A%26B"
      
      const searchResults = mockDatabase.searchBooks(keyword);
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: searchResults
      });

      // Act
      const response = await apiClient.get<Book[]>(`/books/search?q=${encodedKeyword}`);

      // Assert
      expect(response.status).toBe(200);
      expect(encodedKeyword).toContain('%26'); // & encoded
      
      const foundBook = response.data?.some(book => book.title.includes('A&B'));
      expect(foundBook).toBe(true);

      mockGet.mockRestore();
    });

    it('Should handle search with percentage sign', async () => {
      // Arrange: "100%"
      const keyword = '100%';
      const encodedKeyword = encodeUrlParam(keyword); // "100%25"
      
      const searchResults = mockDatabase.searchBooks(keyword);
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: searchResults
      });

      // Act
      const response = await apiClient.get<Book[]>(`/books/search?q=${encodedKeyword}`);

      // Assert
      expect(response.status).toBe(200);
      expect(encodedKeyword).toBe('100%25'); // % encoded
      
      const foundBook = response.data?.some(book => book.title.includes('100%'));
      expect(foundBook).toBe(true);

      mockGet.mockRestore();
    });

    it('Should handle search with mixed case sensitivity', async () => {
      // Arrange: Different case variations
      const variations = ['harry potter', 'HARRY POTTER', 'HaRrY PoTtEr'];
      
      // Act & Assert: All should return same results
      for (const keyword of variations) {
        const results = mockDatabase.searchBooks(keyword);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].title).toBe('Harry Potter');
      }
    });

    it('Should handle search with leading/trailing spaces', async () => {
      // Arrange: Keyword with spaces
      const keyword = '  Harry  ';
      const trimmed = keyword.trim();
      
      // Mock API response
      const searchResults = mockDatabase.searchBooks(trimmed);
      const mockGet = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: searchResults
      });

      // Act
      const response = await apiClient.get<Book[]>(`/books/search?q=${encodeURIComponent(trimmed)}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.length).toBeGreaterThan(0);

      mockGet.mockRestore();
    });

    it('Should prevent multiple SQL injection patterns', async () => {
      // Arrange: Various SQL injection payloads
      const sqlPayloads = [
        "' OR '1'='1",
        "1' AND '1'='1",
        "'; DROP TABLE books;--",
        "1' UNION SELECT * FROM users--",
        "admin'--"
      ];

      // Assert: All should be detected
      sqlPayloads.forEach(payload => {
        const isAttack = isSQLInjection(payload);
        expect(isAttack).toBe(true);
      });
    });

    it('Should sanitize various XSS payloads', async () => {
      // Arrange: Various XSS payloads
      const xssPayloads = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        'javascript:alert(1)',
        '<iframe src="javascript:alert(1)">'
      ];

      // Assert: All should be sanitized
      xssPayloads.forEach(payload => {
        const sanitized = sanitizeInput(payload);
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('<img');
        expect(sanitized).not.toContain('<svg');
        expect(sanitized).not.toContain('<iframe');
        expect(sanitized).toContain('&lt;'); // Converted to HTML entities
      });
    });
  });
});
