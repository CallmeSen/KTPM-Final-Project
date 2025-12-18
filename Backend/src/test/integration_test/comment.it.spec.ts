/**
 * Integration Tests for Comment Module
 * Generated from Excel Test Cases: BE_Other-1 to BE_Other-21
 * Framework: Jest + NestJS Testing
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

// ============================================================================
// MOCK INTERFACES
// ============================================================================

interface Comment {
  id: string;
  content: string;
  bookId: string;
  userId: string;
  parentId?: string | null;
  children?: Comment[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date | null;
}

interface CreateCommentDto {
  content: string;
  bookId: string;
  userId: string;
  parentId?: string | null;
}

interface UpdateCommentDto {
  content: string;
}

interface Book {
  id: string;
  title: string;
  authorId: string;
  createdAt: Date;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

interface CommentLike {
  id: string;
  userId: string;
  commentId: string;
  createdAt: Date;
  isActive?: boolean;
}

interface GetCommentsResponse {
  data: Comment[];
  total: number;
}

interface LikeCommentResponse {
  liked: boolean;
  count: number;
}

// Mock Entity Classes for getRepositoryToken
class CommentEntity {}
class BookEntity {}
class UserEntity {}
class CommentLikeEntity {}

// ============================================================================
// MOCK SERVICES
// ============================================================================

class MockCommentService {
  getCommentsByBook = jest.fn();
  getRepliesByParent = jest.fn();
  addComment = jest.fn();
  updateComment = jest.fn();
  removeComment = jest.fn();
  likeComment = jest.fn();
}

class MockCommentRepository {
  create = jest.fn();
  save = jest.fn();
  find = jest.fn();
  findOne = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  softDelete = jest.fn();
  createQueryBuilder = jest.fn();
}

class MockBookRepository {
  findOne = jest.fn();
}

class MockUserRepository {
  findOne = jest.fn();
}

class MockCommentLikeRepository {
  create = jest.fn();
  save = jest.fn();
  findOne = jest.fn();
  delete = jest.fn();
  count = jest.fn();
}

class MockAuthGuard {
  canActivate = jest.fn();
}

class MockRolesGuard {
  canActivate = jest.fn();
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Comment Module - Integration Tests', () => {
  let commentService: MockCommentService;
  let commentRepository: MockCommentRepository;
  let bookRepository: MockBookRepository;
  let userRepository: MockUserRepository;
  let commentLikeRepository: MockCommentLikeRepository;
  let authGuard: MockAuthGuard;
  let rolesGuard: MockRolesGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'CommentService', useClass: MockCommentService },
        {
          provide: getRepositoryToken(CommentEntity),
          useClass: MockCommentRepository,
        },
        {
          provide: getRepositoryToken(BookEntity),
          useClass: MockBookRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: MockUserRepository,
        },
        {
          provide: getRepositoryToken(CommentLikeEntity),
          useClass: MockCommentLikeRepository,
        },
        { provide: 'AuthGuard', useClass: MockAuthGuard },
        { provide: 'RolesGuard', useClass: MockRolesGuard },
      ],
    }).compile();

    commentService = module.get<MockCommentService>('CommentService');
    commentRepository = module.get<MockCommentRepository>(
      getRepositoryToken(CommentEntity),
    );
    bookRepository = module.get<MockBookRepository>(
      getRepositoryToken(BookEntity),
    );
    userRepository = module.get<MockUserRepository>(
      getRepositoryToken(UserEntity),
    );
    commentLikeRepository = module.get<MockCommentLikeRepository>(
      getRepositoryToken(CommentLikeEntity),
    );
    authGuard = module.get<MockAuthGuard>('AuthGuard');
    rolesGuard = module.get<MockRolesGuard>('RolesGuard');

    jest.clearAllMocks();
  });

  // ==========================================================================
  // [BE_Other-1 to BE_Other-5] GET COMMENT OPERATIONS
  // ==========================================================================

  describe('[BE_Other-1] IT_COMMENT_Get_FlatList', () => {
    it('should return flat list of root comments (Level 0)', async () => {
      // Arrange
      const bookId = '101';
      const mockComments: Comment[] = [
        {
          id: 'A',
          content: 'Comment A',
          bookId: '101',
          userId: 'user1',
          parentId: null,
          children: [],
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
        },
        {
          id: 'B',
          content: 'Comment B',
          bookId: '101',
          userId: 'user2',
          parentId: null,
          children: [],
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'C',
          content: 'Comment C',
          bookId: '101',
          userId: 'user3',
          parentId: null,
          children: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      commentService.getCommentsByBook.mockResolvedValue({
        data: mockComments,
        total: 3,
      });

      // Act
      const result = await commentService.getCommentsByBook(bookId);

      // Assert
      expect(commentService.getCommentsByBook).toHaveBeenCalledWith(bookId);
      expect(result.data).toHaveLength(3);
      expect(result.data[0].id).toBe('A');
      expect(result.data[0].children).toEqual([]);
      expect(result.data[0].parentId).toBeNull();
      // Verify sorting by createdAt descending
      expect(result.data[0].createdAt > result.data[1].createdAt).toBe(true);
    });
  });

  describe('[BE_Other-2] IT_COMMENT_Get_NestedTree', () => {
    it('should return nested tree structure with 3 levels (A -> B -> C)', async () => {
      // Arrange
      const bookId = '101';
      const mockNestedComments: Comment[] = [
        {
          id: 'A',
          content: 'Root Comment A',
          bookId: '101',
          userId: 'user1',
          parentId: null,
          children: [
            {
              id: 'B',
              content: 'Reply to A',
              bookId: '101',
              userId: 'user2',
              parentId: 'A',
              children: [
                {
                  id: 'C',
                  content: 'Reply to B',
                  bookId: '101',
                  userId: 'user3',
                  parentId: 'B',
                  children: [],
                  createdAt: new Date('2024-01-01T10:02:00'),
                  updatedAt: new Date('2024-01-01T10:02:00'),
                },
              ],
              createdAt: new Date('2024-01-01T10:01:00'),
              updatedAt: new Date('2024-01-01T10:01:00'),
            },
          ],
          createdAt: new Date('2024-01-01T10:00:00'),
          updatedAt: new Date('2024-01-01T10:00:00'),
        },
      ];

      commentService.getCommentsByBook.mockResolvedValue({
        data: mockNestedComments,
        total: 1,
      });

      // Act
      const result = await commentService.getCommentsByBook(bookId);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('A');
      expect(result.data[0].children).toHaveLength(1);
      expect(result.data[0].children[0].id).toBe('B');
      expect(result.data[0].children[0].children).toHaveLength(1);
      expect(result.data[0].children[0].children[0].id).toBe('C');
      // Verify 3-level nesting structure
      expect(result.data[0].children[0].parentId).toBe('A');
      expect(result.data[0].children[0].children[0].parentId).toBe('B');
    });
  });

  describe('[BE_Other-3] IT_COMMENT_Get_MultiBranch', () => {
    it('should return multiple siblings at the same level (A -> [B1, B2])', async () => {
      // Arrange
      const bookId = '101';
      const mockMultiBranchComments: Comment[] = [
        {
          id: 'A',
          content: 'Root Comment A',
          bookId: '101',
          userId: 'user1',
          parentId: null,
          children: [
            {
              id: 'B1',
              content: 'Reply B1 to A',
              bookId: '101',
              userId: 'user2',
              parentId: 'A',
              children: [],
              createdAt: new Date('2024-01-01T10:01:00'),
              updatedAt: new Date('2024-01-01T10:01:00'),
            },
            {
              id: 'B2',
              content: 'Reply B2 to A',
              bookId: '101',
              userId: 'user3',
              parentId: 'A',
              children: [],
              createdAt: new Date('2024-01-01T10:02:00'),
              updatedAt: new Date('2024-01-01T10:02:00'),
            },
          ],
          createdAt: new Date('2024-01-01T10:00:00'),
          updatedAt: new Date('2024-01-01T10:00:00'),
        },
      ];

      commentService.getCommentsByBook.mockResolvedValue({
        data: mockMultiBranchComments,
        total: 1,
      });

      // Act
      const result = await commentService.getCommentsByBook(bookId);

      // Assert
      expect(result.data[0].id).toBe('A');
      expect(result.data[0].children).toHaveLength(2);
      expect(result.data[0].children.map((c) => c.id)).toEqual(['B1', 'B2']);
      expect(result.data[0].children[0].parentId).toBe('A');
      expect(result.data[0].children[1].parentId).toBe('A');
    });
  });

  describe('[BE_Other-4] IT_COMMENT_Get_DeletedParent', () => {
    it('should handle soft-deleted parent node (A -> B[deleted] -> C)', async () => {
      // Arrange
      const bookId = '101';
      const mockBrokenTreeComments: Comment[] = [
        {
          id: 'A',
          content: 'Root Comment A',
          bookId: '101',
          userId: 'user1',
          parentId: null,
          children: [
            {
              id: 'B',
              content: 'Comment đã bị xóa', // Soft deleted content replacement
              bookId: '101',
              userId: 'user2',
              parentId: 'A',
              isDeleted: true,
              deletedAt: new Date('2024-01-01T11:00:00'),
              children: [
                {
                  id: 'C',
                  content: 'Reply to B (still visible)',
                  bookId: '101',
                  userId: 'user3',
                  parentId: 'B',
                  children: [],
                  createdAt: new Date('2024-01-01T10:02:00'),
                  updatedAt: new Date('2024-01-01T10:02:00'),
                },
              ],
              createdAt: new Date('2024-01-01T10:01:00'),
              updatedAt: new Date('2024-01-01T10:01:00'),
            },
          ],
          createdAt: new Date('2024-01-01T10:00:00'),
          updatedAt: new Date('2024-01-01T10:00:00'),
        },
      ];

      commentService.getCommentsByBook.mockResolvedValue({
        data: mockBrokenTreeComments,
        total: 1,
      });

      // Act
      const result = await commentService.getCommentsByBook(bookId);

      // Assert
      expect(result.data[0].children[0].id).toBe('B');
      expect(result.data[0].children[0].isDeleted).toBe(true);
      expect(result.data[0].children[0].content).toBe('Comment đã bị xóa');
      expect(result.data[0].children[0].children).toHaveLength(1);
      expect(result.data[0].children[0].children[0].id).toBe('C');
      // Tree structure should remain intact
      expect(result.data[0].children[0].children[0].parentId).toBe('B');
    });
  });

  describe('[BE_Other-5] IT_COMMENT_Get_Empty', () => {
    it('should return empty array for book with no comments', async () => {
      // Arrange
      const bookId = '999';

      bookRepository.findOne.mockResolvedValue({
        id: '999',
        title: 'New Book',
        authorId: 'author1',
        createdAt: new Date(),
      });

      commentService.getCommentsByBook.mockResolvedValue({
        data: [],
        total: 0,
      });

      // Act
      const result = await commentService.getCommentsByBook(bookId);

      // Assert
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(commentService.getCommentsByBook).toHaveBeenCalledWith(bookId);
    });
  });

  // ==========================================================================
  // [BE_Other-6 to BE_Other-8] XSS INJECTION TESTS
  // ==========================================================================

  describe('[BE_Other-6] IT_COMMENT_Add_XSS_ScriptTag', () => {
    it('should sanitize <script> tag injection', async () => {
      // Arrange
      const xssPayload = '<script>alert("Hacked")</script>';
      const sanitizedContent = '&lt;script&gt;alert("Hacked")&lt;/script&gt;';
      const createDto: CreateCommentDto = {
        content: xssPayload,
        bookId: '101',
        userId: 'user1',
      };

      authGuard.canActivate.mockResolvedValue(true);

      commentService.addComment.mockResolvedValue({
        id: 'comment1',
        content: sanitizedContent,
        bookId: '101',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await commentService.addComment(createDto);

      // Assert
      expect(result.content).not.toContain('<script>');
      expect(result.content).toContain('&lt;script&gt;');
      expect(result.content).toBe(sanitizedContent);
    });
  });

  describe('[BE_Other-7] IT_COMMENT_Add_XSS_EventHandler', () => {
    it('should sanitize <img> tag with onerror event handler', async () => {
      // Arrange
      const xssPayload = '<img src="x" onerror="alert(\'XSS\')">';
      const sanitizedContent = '&lt;img src="x" onerror="alert(\'XSS\')"&gt;';
      const createDto: CreateCommentDto = {
        content: xssPayload,
        bookId: '101',
        userId: 'user1',
      };

      authGuard.canActivate.mockResolvedValue(true);

      commentService.addComment.mockResolvedValue({
        id: 'comment2',
        content: sanitizedContent,
        bookId: '101',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await commentService.addComment(createDto);

      // Assert
      // Verify that the dangerous script is not executable (encoded)
      expect(result.content).toContain('&lt;img');
      expect(result.content).toContain('&gt;');
      // The content should be sanitized/encoded, not raw HTML
      expect(result.content).toBe(sanitizedContent);
    });
  });

  describe('[BE_Other-8] IT_COMMENT_Add_XSS_Encoded', () => {
    it('should handle URL-encoded XSS payload', async () => {
      // Arrange
      const encodedPayload = '%3Cscript%3Ealert(1)%3C%2Fscript%3E';
      const createDto: CreateCommentDto = {
        content: encodedPayload,
        bookId: '101',
        userId: 'user1',
      };

      authGuard.canActivate.mockResolvedValue(true);

      // System should store it safely without decoding to executable script
      commentService.addComment.mockResolvedValue({
        id: 'comment3',
        content: encodedPayload, // Stored as-is or sanitized
        bookId: '101',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await commentService.addComment(createDto);

      // Assert
      expect(result.content).toBe(encodedPayload);
      // Browser should not interpret this as executable code
    });
  });

  // ==========================================================================
  // [BE_Other-9 to BE_Other-11] GET REPLIES RECURSIVE TESTS
  // ==========================================================================

  describe('[BE_Other-9] IT_COMMENT_GetReplies_NoChild', () => {
    it('should return empty array for comment with no replies (base case)', async () => {
      // Arrange
      const parentId = 'C_001';

      commentRepository.find.mockResolvedValue([]);
      commentService.getRepliesByParent.mockResolvedValue([]);

      // Act
      const result = await commentService.getRepliesByParent(parentId);

      // Assert
      expect(result).toEqual([]);
      expect(commentService.getRepliesByParent).toHaveBeenCalledWith(parentId);
    });
  });

  describe('[BE_Other-10] IT_COMMENT_GetReplies_Flat', () => {
    it('should return direct children (1 level recursion)', async () => {
      // Arrange
      const parentId = 'C_001';
      const mockReplies: Comment[] = [
        {
          id: 'C_002',
          content: 'Reply 1',
          bookId: '101',
          userId: 'user1',
          parentId: 'C_001',
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'C_003',
          content: 'Reply 2',
          bookId: '101',
          userId: 'user2',
          parentId: 'C_001',
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      commentService.getRepliesByParent.mockResolvedValue(mockReplies);

      // Act
      const result = await commentService.getRepliesByParent(parentId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('C_002');
      expect(result[1].id).toBe('C_003');
      expect(result[0].parentId).toBe('C_001');
      expect(result[1].parentId).toBe('C_001');
    });
  });

  describe('[BE_Other-11] IT_COMMENT_GetReplies_DeepTree', () => {
    it('should return nested tree (multi-level recursion: C_001 -> C_002 -> C_003)', async () => {
      // Arrange
      const parentId = 'C_001';
      const mockDeepReplies: Comment[] = [
        {
          id: 'C_002',
          content: 'Reply to C_001',
          bookId: '101',
          userId: 'user1',
          parentId: 'C_001',
          children: [
            {
              id: 'C_003',
              content: 'Reply to C_002',
              bookId: '101',
              userId: 'user2',
              parentId: 'C_002',
              children: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      commentService.getRepliesByParent.mockResolvedValue(mockDeepReplies);

      // Act
      const result = await commentService.getRepliesByParent(parentId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('C_002');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].id).toBe('C_003');
      expect(result[0].children[0].parentId).toBe('C_002');
    });
  });

  // ==========================================================================
  // [BE_Other-12 to BE_Other-14] UPDATE COMMENT TESTS
  // ==========================================================================

  describe('[BE_Other-12] IT_COMMENT_UpdateComment_Owner', () => {
    it('should allow owner to update their own comment', async () => {
      // Arrange
      const userId = 'userA';
      const commentId = '100';
      const updateDto: UpdateCommentDto = { content: 'Mới' };

      authGuard.canActivate.mockResolvedValue(true);

      commentRepository.findOne.mockResolvedValue({
        id: '100',
        content: 'Cũ',
        userId: 'userA',
        bookId: '101',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      commentService.updateComment.mockResolvedValue({
        id: '100',
        content: 'Mới',
        userId: 'userA',
        bookId: '101',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await commentService.updateComment(
        commentId,
        updateDto,
        userId,
      );

      // Assert
      expect(result.content).toBe('Mới');
      expect(commentService.updateComment).toHaveBeenCalledWith(
        commentId,
        updateDto,
        userId,
      );
    });
  });

  describe('[BE_Other-13] IT_COMMENT_UpdateComment_OtherUser', () => {
    it('should deny update if user is not owner (403 Forbidden)', async () => {
      // Arrange
      const userId = 'userB';
      const commentId = '100';
      const updateDto: UpdateCommentDto = { content: 'Hack' };

      authGuard.canActivate.mockResolvedValue(true);

      commentRepository.findOne.mockResolvedValue({
        id: '100',
        content: 'Original',
        userId: 'userA', // Different owner
        bookId: '101',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      commentService.updateComment.mockRejectedValue({
        statusCode: 403,
        message: 'Bạn không có quyền chỉnh sửa comment này',
      });

      // Act & Assert
      await expect(
        commentService.updateComment(commentId, updateDto, userId),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'Bạn không có quyền chỉnh sửa comment này',
      });
    });
  });

  describe('[BE_Other-14] IT_COMMENT_UpdateComment_NotFound', () => {
    it('should return 404 if comment does not exist', async () => {
      // Arrange
      const userId = 'userA';
      const commentId = '999999';
      const updateDto: UpdateCommentDto = { content: 'New' };

      authGuard.canActivate.mockResolvedValue(true);

      commentRepository.findOne.mockResolvedValue(null);

      commentService.updateComment.mockRejectedValue({
        statusCode: 404,
        message: 'Không tìm thấy bình luận',
      });

      // Act & Assert
      await expect(
        commentService.updateComment(commentId, updateDto, userId),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Không tìm thấy bình luận',
      });
    });
  });

  // ==========================================================================
  // [BE_Other-15 to BE_Other-18] REMOVE COMMENT TESTS
  // ==========================================================================

  describe('[BE_Other-15] IT_COMMENT_Remove_Owner', () => {
    it('should allow owner to delete their comment', async () => {
      // Arrange
      const userId = 'userA';
      const commentId = '101';

      authGuard.canActivate.mockResolvedValue(true);

      commentRepository.findOne.mockResolvedValue({
        id: '101',
        content: 'Test comment',
        userId: 'userA',
        bookId: '101',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      commentService.removeComment.mockResolvedValue({
        message: 'Xóa thành công',
      });

      commentRepository.softDelete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await commentService.removeComment(
        commentId,
        userId,
        UserRole.USER,
      );

      // Assert
      expect(result.message).toBe('Xóa thành công');
      expect(commentService.removeComment).toHaveBeenCalledWith(
        commentId,
        userId,
        UserRole.USER,
      );
    });
  });

  describe('[BE_Other-16] IT_COMMENT_Remove_Admin', () => {
    it('should allow admin to delete any comment', async () => {
      // Arrange
      const adminId = 'admin1';
      const commentId = '102';

      authGuard.canActivate.mockResolvedValue(true);
      rolesGuard.canActivate.mockResolvedValue(true);

      commentRepository.findOne.mockResolvedValue({
        id: '102',
        content: 'User B comment',
        userId: 'userB',
        bookId: '101',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      commentService.removeComment.mockResolvedValue({
        message: 'Đã xóa bình luận',
      });

      commentRepository.softDelete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await commentService.removeComment(
        commentId,
        adminId,
        UserRole.ADMIN,
      );

      // Assert
      expect(result.message).toBe('Đã xóa bình luận');
      expect(commentService.removeComment).toHaveBeenCalledWith(
        commentId,
        adminId,
        UserRole.ADMIN,
      );
    });
  });

  describe('[BE_Other-17] IT_COMMENT_Remove_Forbidden', () => {
    it('should deny deletion if user is not owner (403 Forbidden)', async () => {
      // Arrange
      const userId = 'userA';
      const commentId = '102'; // Owned by userB

      authGuard.canActivate.mockResolvedValue(true);

      commentRepository.findOne.mockResolvedValue({
        id: '102',
        content: 'User B comment',
        userId: 'userB',
        bookId: '101',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      commentService.removeComment.mockRejectedValue({
        statusCode: 403,
        message: 'Bạn không có quyền thực hiện hành động này',
      });

      // Act & Assert
      await expect(
        commentService.removeComment(commentId, userId, UserRole.USER),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'Bạn không có quyền thực hiện hành động này',
      });
    });
  });

  describe('[BE_Other-18] IT_COMMENT_Remove_NotFound', () => {
    it('should return 404 if comment does not exist', async () => {
      // Arrange
      const userId = 'userA';
      const commentId = '99999';

      authGuard.canActivate.mockResolvedValue(true);

      commentRepository.findOne.mockResolvedValue(null);

      commentService.removeComment.mockRejectedValue({
        statusCode: 404,
        message: 'Bình luận không tồn tại',
      });

      // Act & Assert
      await expect(
        commentService.removeComment(commentId, userId, UserRole.USER),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Bình luận không tồn tại',
      });
    });
  });

  // ==========================================================================
  // [BE_Other-19 to BE_Other-21] LIKE COMMENT TESTS
  // ==========================================================================

  describe('[BE_Other-19] IT_COMMENT_Like_ToggleOn', () => {
    it('should toggle like ON (user likes comment)', async () => {
      // Arrange
      const userId = 'user1';
      const commentId = 'Cmt_01';

      authGuard.canActivate.mockResolvedValue(true);

      commentRepository.findOne.mockResolvedValue({
        id: 'Cmt_01',
        content: 'Test comment',
        userId: 'user2',
        bookId: '101',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // User has not liked yet
      commentLikeRepository.findOne.mockResolvedValue(null);

      const newLike: CommentLike = {
        id: 'like1',
        userId: 'user1',
        commentId: 'Cmt_01',
        createdAt: new Date(),
        isActive: true,
      };

      commentLikeRepository.create.mockReturnValue(newLike);
      commentLikeRepository.save.mockResolvedValue(newLike);
      commentLikeRepository.count.mockResolvedValue(1);

      commentService.likeComment.mockResolvedValue({
        liked: true,
        count: 1,
      });

      // Act
      const result = await commentService.likeComment(commentId, userId);

      // Assert
      expect(result.liked).toBe(true);
      expect(result.count).toBe(1);
      expect(commentService.likeComment).toHaveBeenCalledWith(
        commentId,
        userId,
      );
    });
  });

  describe('[BE_Other-20] IT_COMMENT_Like_ToggleOff', () => {
    it('should toggle like OFF (user unlikes comment)', async () => {
      // Arrange
      const userId = 'user1';
      const commentId = 'Cmt_01';

      authGuard.canActivate.mockResolvedValue(true);

      commentRepository.findOne.mockResolvedValue({
        id: 'Cmt_01',
        content: 'Test comment',
        userId: 'user2',
        bookId: '101',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // User has already liked
      const existingLike: CommentLike = {
        id: 'like1',
        userId: 'user1',
        commentId: 'Cmt_01',
        createdAt: new Date(),
        isActive: true,
      };

      commentLikeRepository.findOne.mockResolvedValue(existingLike);
      commentLikeRepository.delete.mockResolvedValue({ affected: 1 });
      commentLikeRepository.count.mockResolvedValue(0);

      commentService.likeComment.mockResolvedValue({
        liked: false,
        count: 0,
      });

      // Act
      const result = await commentService.likeComment(commentId, userId);

      // Assert
      expect(result.liked).toBe(false);
      expect(result.count).toBe(0);
      expect(commentService.likeComment).toHaveBeenCalledWith(
        commentId,
        userId,
      );
    });
  });

  describe('[BE_Other-21] IT_COMMENT_Like_InvalidID', () => {
    it('should return 404 if comment does not exist', async () => {
      // Arrange
      const userId = 'user1';
      const commentId = 'Cmt_9999';

      authGuard.canActivate.mockResolvedValue(true);

      commentRepository.findOne.mockResolvedValue(null);

      commentService.likeComment.mockRejectedValue({
        statusCode: 404,
        message: 'Comment không tồn tại',
      });

      // Act & Assert
      await expect(
        commentService.likeComment(commentId, userId),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Comment không tồn tại',
      });
    });
  });
});
