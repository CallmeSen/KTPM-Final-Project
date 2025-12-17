import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from '../../modules/books/books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from '../../modules/books/entities/book.entity';
import { Repository } from 'typeorm';

describe('BooksService Unit Tests', () => {
    let service: BooksService;
    let bookRepo: jest.Mocked<Repository<Book>>;

    const mockBook: Book = {
        id: 'uuid-1',
        title: 'NestJS Basics',
        price: 100,
        quantity: 10,
    } as Book;

    const mockBookRepo = {
        create: jest.fn(),
        save: jest.fn(),
        findOneBy: jest.fn(),
        findAndCount: jest.fn(),
        remove: jest.fn(),
        update: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BooksService,
                {
                    provide: getRepositoryToken(Book),
                    useValue: mockBookRepo,
                },
            ],
        }).compile();

        service = module.get<BooksService>(BooksService);
        bookRepo = module.get(getRepositoryToken(Book));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // CREATE
    // ==========================================
    describe('create', () => {
        it('should create a book successfully', async () => {
            const dto = {
                title: 'New Book',
                price: 50,
                quantity: 5,
            };

            mockBookRepo.create.mockReturnValue(dto as any);
            mockBookRepo.save.mockResolvedValue(mockBook);

            const result = await service.create(dto as any);

            expect(bookRepo.create).toHaveBeenCalledWith(dto);
            expect(bookRepo.save).toHaveBeenCalled();
            expect(result).toEqual(mockBook);
        });
    });

    // ==========================================
    // FIND ONE
    // ==========================================
    describe('findOne', () => {
        it('should return book if exists', async () => {
            mockBookRepo.findOneBy.mockResolvedValue(mockBook);

            const result = await service.findOne('uuid-1');

            expect(bookRepo.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' });
            expect(result).toEqual(mockBook);
        });

        it('should return null if book not found', async () => {
            mockBookRepo.findOneBy.mockResolvedValue(null);

            const result = await service.findOne('uuid-404');

            expect(result).toBeNull();
        });
    });

    // ==========================================
    // FIND ALL (Pagination)
    // ==========================================
    describe('findAll', () => {
        it('should return paginated result', async () => {
            mockBookRepo.findAndCount.mockResolvedValue([[mockBook], 1]);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(bookRepo.findAndCount).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
            });

            expect(result).toEqual({
                data: [mockBook],
                total: 1,
                page: 1,
                limit: 10,
            });
        });
    });

    // ==========================================
    // UPDATE
    // ==========================================
    describe('update', () => {
        it('should update and return book', async () => {
            mockBookRepo.findOneBy.mockResolvedValue(mockBook);
            mockBookRepo.update.mockResolvedValue(undefined);
            mockBookRepo.findOneBy.mockResolvedValueOnce(mockBook)
                .mockResolvedValueOnce({ ...mockBook, title: 'Updated' });

            const result = await service.update('uuid-1', {
                title: 'Updated Title',
                isbn10: '1234567890',
            });


            expect(bookRepo.update).toHaveBeenCalledWith('uuid-1', { title: 'Updated' });
            expect(result.title).toBe('Updated');
        });

        it('should throw error if book not found after update', async () => {
            mockBookRepo.findOneBy.mockResolvedValue(null);

            await expect(
                service.update('uuid-1', {
                    title: 'Updated Title',
                    isbn10: '1234567890',
                })
            ).rejects.toThrow();
        });
    });

    // ==========================================
    // REMOVE
    // ==========================================
    describe('remove', () => {
        it('should remove and return book', async () => {
            mockBookRepo.findOneBy.mockResolvedValue(mockBook);
            mockBookRepo.remove.mockResolvedValue(mockBook);

            const result = await service.remove('uuid-1');

            expect(bookRepo.remove).toHaveBeenCalledWith(mockBook);
            expect(result).toEqual(mockBook);
        });

        it('should return null if book not found', async () => {
            mockBookRepo.findOneBy.mockResolvedValue(null);

            const result = await service.remove('uuid-404');

            expect(result).toBeNull();
        });
    });
});
