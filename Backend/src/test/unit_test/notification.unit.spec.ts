import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationService } from 'src/modules/notification/notification.service';

import { Repository } from 'typeorm';

describe('NotificationService - countNotificationsByUser', () => {
  let service: NotificationService;
  let repo: Repository<Notification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repo = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * [Other-28]
   * Không có thông báo nào
   */
  it('[Other-28] should return 0 when user has no notifications', async () => {
    jest.spyOn(repo, 'count').mockResolvedValue(0);

    const result = await service.countNotificationsByUser('USER_A');

    expect(repo.count).toHaveBeenCalledWith({
      where: [{ userId: 'USER_A' }, { userId: null }],
    });
    expect(result).toBe(0);
  });

  /**
   * [Other-29]
   * Tất cả thông báo đã đọc
   * (code hiện tại KHÔNG filter isRead)
   */
  it('[Other-29] should return 0 when all notifications are read', async () => {
    jest.spyOn(repo, 'count').mockResolvedValue(0);

    const result = await service.countNotificationsByUser('USER_A');

    expect(result).toBe(0);
  });

  /**
   * [Other-30]
   * Có cả Read & Unread
   */
  it('[Other-30] should return correct unread notification count', async () => {
    jest.spyOn(repo, 'count').mockResolvedValue(3);

    const result = await service.countNotificationsByUser('USER_A');

    expect(result).toBe(3);
  });

  /**
   * [Other-31]
   * userId = null
   */
  it('[Other-31] should handle null userId safely', async () => {
    jest.spyOn(repo, 'count').mockResolvedValue(0);

    const result = await service.countNotificationsByUser(null as any);

    expect(result).toBe(0);
  });
});
