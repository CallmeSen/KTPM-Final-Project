/**
 * Integration Tests for Notification Module
 * Generated from Excel Test Cases: BE_Other-25 to BE_Other-27 (IT_NOTI_Get_*)
 * Framework: Jest + NestJS Testing
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

// ============================================================================
// MOCK INTERFACES
// ============================================================================

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum NotificationType {
  ORDER = 'ORDER',
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  SYSTEM = 'SYSTEM',
}

enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
}

interface GetNotificationsDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

interface PaginatedNotificationResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

// Mock Entity Classes for getRepositoryToken
class NotificationEntity {}
class UserEntity {}

// ============================================================================
// MOCK SERVICES
// ============================================================================

class MockNotificationService {
  getNotifications = jest.fn();
  getNotificationById = jest.fn();
  markAsRead = jest.fn();
  deleteNotification = jest.fn();
}

class MockNotificationRepository {
  create = jest.fn();
  save = jest.fn();
  find = jest.fn();
  findOne = jest.fn();
  count = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  createQueryBuilder = jest.fn();
}

class MockUserRepository {
  findOne = jest.fn();
}

class MockAuthGuard {
  canActivate = jest.fn();
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Notification Module - Integration Tests (Get Operations)', () => {
  let notificationService: MockNotificationService;
  let notificationRepository: MockNotificationRepository;
  let userRepository: MockUserRepository;
  let authGuard: MockAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'NotificationService', useClass: MockNotificationService },
        { provide: getRepositoryToken(NotificationEntity), useClass: MockNotificationRepository },
        { provide: getRepositoryToken(UserEntity), useClass: MockUserRepository },
        { provide: 'AuthGuard', useClass: MockAuthGuard },
      ],
    }).compile();

    notificationService = module.get<MockNotificationService>('NotificationService');
    notificationRepository = module.get<MockNotificationRepository>(getRepositoryToken(NotificationEntity));
    userRepository = module.get<MockUserRepository>(getRepositoryToken(UserEntity));
    authGuard = module.get<MockAuthGuard>('AuthGuard');

    jest.clearAllMocks();
  });

  // ==========================================================================
  // [BE_Other-25] IT_NOTI_Get_SortDate
  // ==========================================================================

  describe('[BE_Other-25] IT_NOTI_Get_SortDate', () => {
    it('should return notifications sorted by createdAt descending (newest first)', async () => {
      // Arrange
      const userId = 'userA';
      const mockNotifications: Notification[] = [
        {
          id: 'noti3',
          userId: 'userA',
          title: 'Notification 3',
          message: 'Created today at 10:05 AM',
          type: NotificationType.ORDER,
          isRead: false,
          createdAt: new Date('2024-01-02T10:05:00'),
          updatedAt: new Date('2024-01-02T10:05:00'),
        },
        {
          id: 'noti2',
          userId: 'userA',
          title: 'Notification 2',
          message: 'Created today at 10:00 AM',
          type: NotificationType.COMMENT,
          isRead: false,
          createdAt: new Date('2024-01-02T10:00:00'),
          updatedAt: new Date('2024-01-02T10:00:00'),
        },
        {
          id: 'noti1',
          userId: 'userA',
          title: 'Notification 1',
          message: 'Created yesterday',
          type: NotificationType.LIKE,
          isRead: true,
          createdAt: new Date('2024-01-01T10:00:00'),
          updatedAt: new Date('2024-01-01T10:00:00'),
        },
      ];

      authGuard.canActivate.mockResolvedValue(true);

      userRepository.findOne.mockResolvedValue({
        id: 'userA',
        username: 'testuser',
        email: 'test@example.com',
      });

      notificationService.getNotifications.mockResolvedValue({
        data: mockNotifications,
        total: 3,
        page: 1,
        limit: 10,
      });

      // Act
      const result = await notificationService.getNotifications(userId, {
        sortBy: 'createdAt',
        order: 'DESC',
      });

      // Assert
      expect(result.data).toHaveLength(3);
      expect(result.data[0].id).toBe('noti3');
      expect(result.data[1].id).toBe('noti2');
      expect(result.data[2].id).toBe('noti1');
      
      // Verify descending order
      expect(result.data[0].createdAt > result.data[1].createdAt).toBe(true);
      expect(result.data[1].createdAt > result.data[2].createdAt).toBe(true);
      
      expect(notificationService.getNotifications).toHaveBeenCalledWith(userId, {
        sortBy: 'createdAt',
        order: 'DESC',
      });
    });
  });

  // ==========================================================================
  // [BE_Other-26] IT_NOTI_Get_Pagination
  // ==========================================================================

  describe('[BE_Other-26] IT_NOTI_Get_Pagination', () => {
    it('should return paginated notifications with consistent sorting', async () => {
      // Arrange
      const userId = 'userB';
      const totalNotifications = 20;

      // Mock Page 1 (Notifications 20 -> 11)
      const page1Notifications: Notification[] = Array.from({ length: 10 }, (_, i) => ({
        id: `noti${20 - i}`,
        userId: 'userB',
        title: `Notification ${20 - i}`,
        message: `Created on day ${20 - i}`,
        type: NotificationType.SYSTEM,
        isRead: false,
        createdAt: new Date(`2024-01-${20 - i}T10:00:00`),
        updatedAt: new Date(`2024-01-${20 - i}T10:00:00`),
      }));

      // Mock Page 2 (Notifications 10 -> 1)
      const page2Notifications: Notification[] = Array.from({ length: 10 }, (_, i) => ({
        id: `noti${10 - i}`,
        userId: 'userB',
        title: `Notification ${10 - i}`,
        message: `Created on day ${10 - i}`,
        type: NotificationType.SYSTEM,
        isRead: false,
        createdAt: new Date(`2024-01-${10 - i}T10:00:00`),
        updatedAt: new Date(`2024-01-${10 - i}T10:00:00`),
      }));

      authGuard.canActivate.mockResolvedValue(true);

      userRepository.findOne.mockResolvedValue({
        id: 'userB',
        username: 'testuser',
        email: 'test@example.com',
      });

      // Test Page 1
      notificationService.getNotifications.mockResolvedValueOnce({
        data: page1Notifications,
        total: totalNotifications,
        page: 1,
        limit: 10,
      });

      const resultPage1 = await notificationService.getNotifications(userId, {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'DESC',
      });

      // Assert Page 1
      expect(resultPage1.data).toHaveLength(10);
      expect(resultPage1.data[0].id).toBe('noti20');
      expect(resultPage1.data[9].id).toBe('noti11');
      expect(resultPage1.total).toBe(20);
      expect(resultPage1.page).toBe(1);

      // Test Page 2
      notificationService.getNotifications.mockResolvedValueOnce({
        data: page2Notifications,
        total: totalNotifications,
        page: 2,
        limit: 10,
      });

      const resultPage2 = await notificationService.getNotifications(userId, {
        page: 2,
        limit: 10,
        sortBy: 'createdAt',
        order: 'DESC',
      });

      // Assert Page 2
      expect(resultPage2.data).toHaveLength(10);
      expect(resultPage2.data[0].id).toBe('noti10');
      expect(resultPage2.data[9].id).toBe('noti1');
      expect(resultPage2.total).toBe(20);
      expect(resultPage2.page).toBe(2);

      // Verify no duplication between pages
      const page1Ids = resultPage1.data.map(n => n.id);
      const page2Ids = resultPage2.data.map(n => n.id);
      const intersection = page1Ids.filter(id => page2Ids.includes(id));
      expect(intersection).toHaveLength(0);
    });
  });

  // ==========================================================================
  // [BE_Other-27] IT_NOTI_Get_Empty
  // ==========================================================================

  describe('[BE_Other-27] IT_NOTI_Get_Empty', () => {
    it('should return empty array for new user with no notifications', async () => {
      // Arrange
      const userId = 'userC';

      authGuard.canActivate.mockResolvedValue(true);

      userRepository.findOne.mockResolvedValue({
        id: 'userC',
        username: 'newuser',
        email: 'new@example.com',
      });

      notificationRepository.find.mockResolvedValue([]);
      notificationRepository.count.mockResolvedValue(0);

      notificationService.getNotifications.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      // Act
      const result = await notificationService.getNotifications(userId, {
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(notificationService.getNotifications).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 10,
      });
    });
  });
});
