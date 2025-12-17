import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommentService } from 'src/modules/comment/comment.service';
import { Comment as CommentEntity } from 'src/modules/comment/entities/comment.entity'; // ✅ Alias entity
import { User } from 'src/modules/users/entities/user.entity';
import { Book } from 'src/modules/books/entities/book.entity';

describe('CommentService - Unit Test', () => {
  let service: CommentService;
  let commentRepo: Repository<CommentEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(CommentEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(Book), useClass: Repository },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    commentRepo = module.get(getRepositoryToken(CommentEntity));
  });

  afterEach(() => jest.clearAllMocks());

  // ===== getRepliesByParent() - no child =====
  it('getRepliesByParent() - no child', async () => {
    jest.spyOn(commentRepo, 'find').mockResolvedValue([]);

    const result = await service.getRepliesByParent('C_001');

    expect(result).toEqual([]);
  });

  // ===== getRepliesByParent() - direct children =====
  it('getRepliesByParent() - direct children', async () => {
    const mockReplies: CommentEntity[] = [
      { id: 'C_002' } as CommentEntity,
      { id: 'C_003' } as CommentEntity,
    ];

    jest.spyOn(commentRepo, 'find').mockResolvedValue(mockReplies);

    const result = await service.getRepliesByParent('C_001');

    expect(result.length).toBe(2);
  });

  // ===== update() - owner update =====
  it('update() - owner update', async () => {
    jest.spyOn(commentRepo, 'update').mockResolvedValue({
      affected: 1,
      raw: [],
      generatedMaps: [],
    });

    const result = await service.update('100', {
      id: '100', // ✅ bắt buộc có id
      content: 'Mới',
    } as CommentEntity);

    expect(result).toBe(true);
  });

  // ===== remove() - comment not found =====
  it('remove() - comment not found', async () => {
    jest.spyOn(commentRepo, 'findOne').mockResolvedValue(null);

    await expect(service.remove('999999')).rejects.toThrow('Comment not found');
  });

  // ===== likeComment() - toggle ON =====
  it('likeComment() - toggle ON', async () => {
    const comment: CommentEntity = {
      id: 'Cmt_01',
      content: 'hello',
      likes: 0,
      likeUsers: [],
      createdAt: new Date(),
      book: {} as Book,
      user: {} as User,
    };

    jest.spyOn(commentRepo, 'findOneBy').mockResolvedValue(comment);
    jest.spyOn(commentRepo, 'save').mockResolvedValue(comment);

    const result = await service.likeComment('Cmt_01', 'user1');

    expect(result.likes).toBe(1);
    expect(result.likeUsers).toContain('user1');
  });

  // ===== likeComment() - toggle OFF =====
  it('likeComment() - toggle OFF', async () => {
    const comment: CommentEntity = {
      id: 'Cmt_01',
      content: 'hello',
      likes: 1,
      likeUsers: ['user1'],
      createdAt: new Date(),
      book: {} as Book,
      user: {} as User,
    };

    jest.spyOn(commentRepo, 'findOneBy').mockResolvedValue(comment);
    jest.spyOn(commentRepo, 'save').mockResolvedValue(comment);

    const result = await service.likeComment('Cmt_01', 'user1');

    expect(result.likes).toBe(0);
    expect(result.likeUsers).not.toContain('user1');
  });
});
