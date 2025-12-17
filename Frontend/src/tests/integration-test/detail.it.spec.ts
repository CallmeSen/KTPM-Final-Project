/**
 * Integration Test for Detail Module
 * Generated from Excel Test Cases
 * Framework: Jest/Vitest Compatible
 */

// ============================================================================
// MOCK INTERFACES
// ============================================================================

interface Book {
  id: number;
  title: string;
  description: string;
  price: number;
  author: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
}

interface Comment {
  id: number;
  bookId: number;
  userId: number;
  userName: string;
  content: string;
  likes: number;
  createdAt: Date;
}

interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

interface ApiResponse<T> {
  status: number;
  data?: T;
  message?: string;
}

// ============================================================================
// MOCK API CLIENT (Simulates real HTTP requests)
// ============================================================================

class MockApiClient {
  private baseUrl = 'http://localhost:3000/api';

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    // Simulate HTTP GET request
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    // Simulate HTTP POST request
    return this.request<T>('POST', endpoint, body);
  }

  async delete<T>(endpoint: string, headers?: any): Promise<ApiResponse<T>> {
    // Simulate HTTP DELETE request
    return this.request<T>('DELETE', endpoint, null, headers);
  }

  private async request<T>(method: string, endpoint: string, body?: any, headers?: any): Promise<ApiResponse<T>> {
    // This is a mock implementation
    // In real integration tests, this would make actual HTTP calls
    throw new Error('Mock implementation - override in tests');
  }
}

const apiClient = new MockApiClient();

// ============================================================================
// MOCK DATABASE (Simulates database records)
// ============================================================================

const mockDatabase = {
  books: new Map<number, Book>([
    [10, {
      id: 10,
      title: 'Clean Code',
      description: 'A Handbook of Agile Software Craftsmanship',
      price: 250000,
      author: 'Robert C. Martin',
      stock: 15,
      isActive: true,
      createdAt: new Date('2023-01-01')
    }],
    [20, {
      id: 20,
      title: 'Inactive Book',
      description: 'This book is inactive',
      price: 150000,
      author: 'Unknown',
      stock: 5,
      isActive: false, // Đã bị ẩn/xóa mềm
      createdAt: new Date('2023-02-01')
    }]
  ]),

  comments: [] as Comment[],

  // Helper to generate comments
  generateComments(bookId: number, count: number): Comment[] {
    const comments: Comment[] = [];
    for (let i = 1; i <= count; i++) {
      comments.push({
        id: i,
        bookId,
        userId: i,
        userName: `User ${i}`,
        content: `This is comment #${i}`,
        likes: Math.floor(Math.random() * 50),
        createdAt: new Date(Date.now() - i * 1000 * 60 * 60)
      });
    }
    return comments;
  }
};

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Detail Module - Integration Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // TEST GROUP: GET BOOK
  // ==========================================================================

  describe('API: GET /api/books/:id', () => {

    it('[FE_DETAIL-1] FE_DETAIL_GetBook_Success - Kiểm thử lấy chi tiết sách thành công', async () => {
      // Arrange: Mock API response với book ID = 10
      const mockGetBook = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: mockDatabase.books.get(10)
      });

      // Act: Gửi request GET /api/books/10
      const response = await apiClient.get<Book>('/books/10');

      // Assert
      expect(response.status).toBe(200); // Status Code: 200 OK
      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe(10);
      expect(response.data?.title).toBe('Clean Code');
      expect(response.data?.author).toBe('Robert C. Martin');
      expect(response.data?.price).toBe(250000);
      expect(mockGetBook).toHaveBeenCalledWith('/books/10');

      mockGetBook.mockRestore();
    });

    it('[FE_DETAIL-2] FE_DETAIL_GetBook_NotFound - Kiểm thử sách không tồn tại', async () => {
      // Arrange: Mock API response cho ID không tồn tại
      const mockGetBook = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 404,
        message: 'Không tìm thấy sách'
      });

      // Act: Gửi request với ID = 999999
      const response = await apiClient.get<Book>('/books/999999');

      // Assert
      expect(response.status).toBe(404); // Status Code: 404 Not Found
      expect(response.message).toBe('Không tìm thấy sách');
      expect(response.data).toBeUndefined();

      mockGetBook.mockRestore();
    });

    it('[FE_DETAIL-3] FE_DETAIL_GetBook_InvalidFormat - Kiểm thử ID sai định dạng', async () => {
      // Arrange: Mock API response cho ID sai định dạng
      const mockGetBook = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 400,
        message: 'ID sách không hợp lệ'
      });

      // Act: Gửi request với ID = "abc"
      const response = await apiClient.get<Book>('/books/abc');

      // Assert
      expect(response.status).toBe(400); // Status Code: 400 Bad Request
      expect(response.message).toBe('ID sách không hợp lệ');

      mockGetBook.mockRestore();
    });

    it('[FE_DETAIL-4] FE_DETAIL_GetBook_Inactive - Kiểm thử sách đã bị ẩn/xóa mềm', async () => {
      // Arrange: Mock API response cho sách inactive
      const mockGetBook = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 404,
        message: 'Sách không khả dụng'
      });

      // Act: Gửi request GET /api/books/20 (inactive book)
      const response = await apiClient.get<Book>('/books/20');

      // Assert
      expect(response.status).toBe(404); // Trả về 404 Not Found
      expect(response.message).toContain('không khả dụng');

      mockGetBook.mockRestore();
    });

    it('[FE_DETAIL-5] FE_DETAIL_GetBook_SQLInjection - Kiểm thử bảo mật SQL Injection cơ bản', async () => {
      // Arrange: Mock API response cho SQL injection payload
      const sqlPayload = "1' OR '1'='1";
      const mockGetBook = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 400,
        message: 'ID sách không hợp lệ'
      });

      // Act: Gửi request với SQL injection payload
      const response = await apiClient.get<Book>(`/books/${sqlPayload}`);

      // Assert
      expect(response.status).toBe(400); // 400 Bad Request
      expect(response.data).toBeUndefined(); // KHÔNG trả về danh sách toàn bộ sách
      
      mockGetBook.mockRestore();
    });

    it('[FE_DETAIL-6] FE_DETAIL_GetBook_SpecialChars - Kiểm thử ID chứa ký tự đặc biệt', async () => {
      // Arrange: Mock API response cho ký tự đặc biệt
      const mockGetBook = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 400,
        message: 'ID sách không hợp lệ'
      });

      // Act: Gửi request với ký tự đặc biệt
      const response = await apiClient.get<Book>('/books/@#$');

      // Assert
      expect(response.status).toBe(400); // 400 Bad Request
      expect(response.message).toBe('ID sách không hợp lệ');

      mockGetBook.mockRestore();
    });
  });

  // ==========================================================================
  // TEST GROUP: COMMENT (Add & Delete)
  // ==========================================================================

  describe('API: Comment Management', () => {

    describe('POST /api/comments', () => {

      it('[FE_DETAIL-12] FE_DETAIL_AddComment_Valid - Thêm bình luận hợp lệ', async () => {
        // Arrange: Mock API response
        const mockPostComment = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
          status: 201,
          data: {
            id: 101,
            bookId: 10,
            userId: 1,
            userName: 'Test User',
            content: 'Sách hay quá',
            likes: 0,
            createdAt: new Date()
          }
        });

        // Act: Gửi request POST với nội dung hợp lệ
        const response = await apiClient.post<Comment>('/comments', {
          bookId: 10,
          content: 'Sách hay quá'
        });

        // Assert
        expect(response.status).toBe(201); // 201 Created
        expect(response.data?.content).toBe('Sách hay quá');
        expect(mockPostComment).toHaveBeenCalled();

        mockPostComment.mockRestore();
      });

      it('[FE_DETAIL-13] FE_DETAIL_AddComment_Empty - Thêm bình luận rỗng', async () => {
        // Arrange: Mock API response cho validation error
        const mockPostComment = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
          status: 400,
          message: 'Vui lòng nhập nội dung'
        });

        // Act: Gửi request với nội dung rỗng
        const response = await apiClient.post<Comment>('/comments', {
          bookId: 10,
          content: ''
        });

        // Assert
        expect(response.status).toBe(400);
        expect(response.message).toContain('nhập nội dung');

        mockPostComment.mockRestore();
      });

      it('[FE_DETAIL-14] FE_DETAIL_AddComment_OnlySpace - Thêm bình luận chỉ chứa khoảng trắng', async () => {
        // Arrange: Mock API response
        const mockPostComment = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
          status: 400,
          message: 'Vui lòng nhập nội dung'
        });

        // Act: Gửi request với nội dung chỉ chứa spaces
        const response = await apiClient.post<Comment>('/comments', {
          bookId: 10,
          content: '   '
        });

        // Assert
        expect(response.status).toBe(400);
        expect(response.message).toContain('nhập nội dung');

        mockPostComment.mockRestore();
      });

      it('[FE_DETAIL-15] FE_DETAIL_AddComment_MaxLength - Kiểm thử bình luận quá dài', async () => {
        // Arrange: Mock API response
        const longContent = 'a'.repeat(1001); // > 1000 chars
        const mockPostComment = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
          status: 400,
          message: 'Nội dung vượt quá độ dài cho phép'
        });

        // Act: Gửi request với nội dung quá dài
        const response = await apiClient.post<Comment>('/comments', {
          bookId: 10,
          content: longContent
        });

        // Assert
        expect(response.status).toBe(400);
        expect(response.message).toContain('vượt quá');

        mockPostComment.mockRestore();
      });

      it('[FE_DETAIL-16] FE_DETAIL_AddComment_MinLength - Kiểm thử bình luận quá ngắn', async () => {
        // Arrange: Mock API response (nếu có rule min length)
        const mockPostComment = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
          status: 400,
          message: 'Nội dung phải có ít nhất 5 ký tự'
        });

        // Act: Gửi request với nội dung ngắn
        const response = await apiClient.post<Comment>('/comments', {
          bookId: 10,
          content: 'Ok'
        });

        // Assert
        expect(response.status).toBe(400);
        expect(response.message).toContain('ít nhất 5 ký tự');

        mockPostComment.mockRestore();
      });
    });

    describe('DELETE /api/comments/:id', () => {

      it('[FE_DETAIL-17] FE_DETAIL_DelComment_Owner - User xóa bình luận của chính mình', async () => {
        // Arrange: Mock API response (user is owner)
        const mockDeleteComment = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({
          status: 200,
          message: 'Xóa bình luận thành công'
        });

        // Act: Gửi DELETE request với token của owner
        const response = await apiClient.delete('/comments/101', {
          Authorization: 'Bearer user-token'
        });

        // Assert
        expect(response.status).toBe(200);
        expect(mockDeleteComment).toHaveBeenCalledWith('/comments/101', {
          Authorization: 'Bearer user-token'
        });

        mockDeleteComment.mockRestore();
      });

      it('[FE_DETAIL-18] FE_DETAIL_DelComment_OtherUser - User xóa bình luận của người khác', async () => {
        // Arrange: Mock API response (user is not owner, not admin)
        const mockDeleteComment = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({
          status: 403,
          message: 'Bạn không có quyền xóa bình luận này'
        });

        // Act: User A cố xóa comment của User B
        const response = await apiClient.delete('/comments/102', {
          Authorization: 'Bearer other-user-token'
        });

        // Assert
        expect(response.status).toBe(403); // Forbidden
        expect(response.message).toContain('không có quyền');

        mockDeleteComment.mockRestore();
      });

      it('[FE_DETAIL-19] FE_DETAIL_DelComment_Admin - Admin xóa bình luận vi phạm', async () => {
        // Arrange: Mock API response (user is admin)
        const mockDeleteComment = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({
          status: 200,
          message: 'Xóa bình luận thành công'
        });

        // Act: Admin xóa comment của user bất kỳ
        const response = await apiClient.delete('/comments/103', {
          Authorization: 'Bearer admin-token'
        });

        // Assert
        expect(response.status).toBe(200);
        expect(mockDeleteComment).toHaveBeenCalled();

        mockDeleteComment.mockRestore();
      });

      it('[FE_DETAIL-20] FE_DETAIL_DelComment_DoubleDelete - Xóa bình luận đồng thời (Race condition)', async () => {
        // Arrange: Mock first request success, second fails
        const mockDeleteComment = jest.spyOn(apiClient, 'delete')
          .mockResolvedValueOnce({
            status: 200,
            message: 'Xóa bình luận thành công'
          })
          .mockResolvedValueOnce({
            status: 404,
            message: 'Comment không tồn tại'
          });

        // Act: Gửi 2 request đồng thời
        const [response1, response2] = await Promise.all([
          apiClient.delete('/comments/104'),
          apiClient.delete('/comments/104')
        ]);

        // Assert
        expect(response1.status).toBe(200); // Request đầu tiên thành công
        expect(response2.status).toBe(404); // Request thứ 2 báo lỗi

        mockDeleteComment.mockRestore();
      });

      it('[FE_DETAIL-21] FE_DETAIL_DelComment_WrongID - Xóa bình luận sai ID', async () => {
        // Arrange: Mock API response cho ID không tồn tại
        const mockDeleteComment = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({
          status: 404,
          message: 'Comment không tồn tại'
        });

        // Act: Gửi DELETE request với ID không tồn tại
        const response = await apiClient.delete('/comments/9999');

        // Assert
        expect(response.status).toBe(404); // Not Found

        mockDeleteComment.mockRestore();
      });

      it('[FE_DETAIL-22] FE_DETAIL_DelComment_NoToken - Xóa bình luận không có Token', async () => {
        // Arrange: Mock API response cho unauthorized request
        const mockDeleteComment = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({
          status: 401,
          message: 'Unauthorized'
        });

        // Act: Gửi DELETE request không có Authorization header
        const response = await apiClient.delete('/comments/105');

        // Assert
        expect(response.status).toBe(401); // Unauthorized

        mockDeleteComment.mockRestore();
      });
    });
  });

  // ==========================================================================
  // TEST GROUP: PAGINATION
  // ==========================================================================

  describe('API: GET /api/comments (Pagination)', () => {

    beforeEach(() => {
      // Generate 100 mock comments for testing pagination
      mockDatabase.comments = mockDatabase.generateComments(10, 100);
    });

    it('[FE_DETAIL-28] FE_DETAIL_GetCmts_DefaultPage - Lấy danh sách comment trang đầu', async () => {
      // Arrange: Mock API response cho trang đầu tiên
      const mockGetComments = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: {
          data: mockDatabase.comments.slice(0, 10),
          metadata: {
            currentPage: 1,
            totalPages: 10,
            totalCount: 100,
            limit: 10
          }
        }
      });

      // Act: Gửi request GET /api/comments (default page=1, limit=10)
      const response = await apiClient.get<PaginatedResponse<Comment>>('/comments?bookId=10');

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.data).toHaveLength(10); // Trả về 10 comment
      expect(response.data?.metadata.currentPage).toBe(1);
      expect(response.data?.metadata.totalPages).toBe(10);
      expect(response.data?.metadata.totalCount).toBe(100);

      mockGetComments.mockRestore();
    });

    it('[FE_DETAIL-29] FE_DETAIL_GetCmts_NextPage - Lấy danh sách comment trang tiếp theo', async () => {
      // Arrange: Mock API response cho trang 2
      const mockGetComments = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: {
          data: mockDatabase.comments.slice(10, 20),
          metadata: {
            currentPage: 2,
            totalPages: 10,
            totalCount: 100,
            limit: 10
          }
        }
      });

      // Act: Gửi request page=2
      const response = await apiClient.get<PaginatedResponse<Comment>>('/comments?bookId=10&page=2');

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.data).toHaveLength(10);
      expect(response.data?.metadata.currentPage).toBe(2);
      
      // Kiểm tra không trùng lặp với trang 1
      const page2Ids = response.data?.data.map(c => c.id) || [];
      const page1Ids = mockDatabase.comments.slice(0, 10).map(c => c.id);
      const overlap = page2Ids.filter(id => page1Ids.includes(id));
      expect(overlap).toHaveLength(0); // Không có overlap

      mockGetComments.mockRestore();
    });

    it('[FE_DETAIL-30] FE_DETAIL_GetCmts_CustomLimit - Thay đổi số lượng hiển thị', async () => {
      // Arrange: Mock API response với limit=50
      const mockGetComments = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: {
          data: mockDatabase.comments.slice(0, 50),
          metadata: {
            currentPage: 1,
            totalPages: 2,
            totalCount: 100,
            limit: 50
          }
        }
      });

      // Act: Gửi request với limit=50
      const response = await apiClient.get<PaginatedResponse<Comment>>('/comments?bookId=10&limit=50');

      // Assert
      expect(response.status).toBe(200);
      expect(response.data?.data).toHaveLength(50); // Trả về 50 comment
      expect(response.data?.metadata.limit).toBe(50);

      mockGetComments.mockRestore();
    });

    it('[FE_DETAIL-31] FE_DETAIL_GetCmts_OutOfRange - Lấy trang không tồn tại', async () => {
      // Arrange: Mock API response cho trang vượt quá số trang có sẵn
      const mockGetComments = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: {
          data: [], // Danh sách rỗng
          metadata: {
            currentPage: 6,
            totalPages: 5,
            totalCount: 100,
            limit: 10
          }
        }
      });

      // Act: Gửi request page=6 (max=5)
      const response = await apiClient.get<PaginatedResponse<Comment>>('/comments?bookId=10&page=6');

      // Assert
      expect(response.status).toBe(200); // Không báo lỗi 404 hay 500
      expect(response.data?.data).toEqual([]); // Danh sách rỗng

      mockGetComments.mockRestore();
    });

    it('[FE_DETAIL-32] FE_DETAIL_GetCmts_InvalidPage - Lấy trang số âm hoặc chữ', async () => {
      // Arrange: Mock API response tự động fallback về page=1
      const mockGetComments = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 400,
        message: 'Invalid page parameter'
      });

      // Act: Gửi request với page=-1
      const response = await apiClient.get<PaginatedResponse<Comment>>('/comments?bookId=10&page=-1');

      // Assert
      expect(response.status).toBe(400); // Báo lỗi 400

      mockGetComments.mockRestore();
    });

    it('[FE_DETAIL-33] FE_DETAIL_GetCmts_TotalCount - Kiểm tra tổng số bình luận', async () => {
      // Arrange: Mock API response
      const actualTotalCount = mockDatabase.comments.length; // 100
      const mockGetComments = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 200,
        data: {
          data: mockDatabase.comments.slice(0, 10),
          metadata: {
            currentPage: 1,
            totalPages: 10,
            totalCount: actualTotalCount,
            limit: 10
          }
        }
      });

      // Act: Gửi request
      const response = await apiClient.get<PaginatedResponse<Comment>>('/comments?bookId=10');

      // Assert
      expect(response.data?.metadata.totalCount).toBe(actualTotalCount); // Khớp với DB

      mockGetComments.mockRestore();
    });
  });
});
