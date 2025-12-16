import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Repository } from 'typeorm';

describe('CommentService - Unit Test', () => {
    let service: CommentService;
    let commentRepo: Repository<Comment>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentService,
                {
                    provide: getRepositoryToken(Comment),
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
        commentRepo = module.get(getRepositoryToken(Comment));
    });

    afterEach(() => jest.clearAllMocks());

    // ===== [Other-9] =====
    it('getRepliesByParent() - no child', async () => {
        jest.spyOn(commentRepo, 'find').mockResolvedValue([]);

        const result = await service.getRepliesByParent('C_001');

        expect(result).toEqual([]);
    });

    // ===== [Other-10] =====
    it('getRepliesByParent() - direct children', async () => {
        const mockReplies: Comment[] = [
            { id: 'C_002' } as Comment,
            { id: 'C_003' } as Comment,
        ];

        jest.spyOn(commentRepo, 'find').mockResolvedValue(mockReplies);

        const result = await service.getRepliesByParent('C_001');

        expect(result.length).toBe(2);
    });

    // ===== [Other-12] =====
    it('update() - owner update', async () => {
        jest.spyOn(commentRepo, 'update').mockResolvedValue({
            affected: 1,
            raw: [],
            generatedMaps: [],
        });

        const result = await service.update('100', {
            id: '100',        // ✅ FIX: bắt buộc có id
            content: 'Mới',
        });

        expect(result).toBe(true);
    });

    // ===== [Other-14] =====
    it('remove() - comment not found', async () => {
        jest.spyOn(commentRepo, 'findOne').mockResolvedValue(null);

        await expect(service.remove('999999')).rejects.toThrow('Comment not found');
    });

    // ===== [Other-19] =====
    it('likeComment() - toggle ON', async () => {
        const comment: Comment = {
            id: 'Cmt_01',
            content: 'hello',
            likes: 0,
            likeUsers: [],
            createdAt: new Date(),
            book: {} as Book,
            user: {} as User,
        };

        jest.spyOn(commentRepo, 'findOneBy').mockResolvedValue(comment);
        jest.spyOn(commentRepo, 'save').mockResolvedValue(comment); // ✅ FIX

        const result = await service.likeComment('Cmt_01', 'user1');

        expect(result.likes).toBe(1);
        expect(result.likeUsers).toContain('user1');
    });


    // ===== [Other-20] =====
    // ===== [Other-20] =====
    it('likeComment() - toggle OFF', async () => {
        const comment: Comment = {
            id: 'Cmt_01',
            content: 'hello',
            likes: 1,
            likeUsers: ['user1'],
            createdAt: new Date(),
            book: {} as Book,
            user: {} as User,
        };

        jest.spyOn(commentRepo, 'findOneBy').mockResolvedValue(comment);
        jest.spyOn(commentRepo, 'save').mockResolvedValue(comment); // ✅ FIX QUAN TRỌNG

        const result = await service.likeComment('Cmt_01', 'user1');

        expect(result.likes).toBe(0);
        expect(result.likeUsers).not.toContain('user1');
    });

});
