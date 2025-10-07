import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock dữ liệu
const mockBook = {
  id: '1',
  title: 'Test Book',
  authors: 'John Doe',
  categories: 'Science',
  description: 'A test book description',
  published_year: 2024,
  average_rating: 4.5,
  num_pages: 200,
  price: 100,
};

// Mock repository (không dùng jest)
const createMockRepo = () => ({
  create: (dto: any) => dto,
  save: async () => mockBook,
  findOneBy: async () => mockBook,
  update: async () => ({ affected: 1 }),
  remove: async () => mockBook,
  findAndCount: async () => [[mockBook], 1],
  createQueryBuilder: () => ({
    where() {
      return this;
    },
    orderBy() {
      return this;
    },
    take() {
      return this;
    },
    getMany: async () => [mockBook],
  }),
});

describe('BooksService (no Jest)', () => {
  let service: BooksService;
  let repo: Repository<Book>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: createMockRepo(),
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repo = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  it('should be defined', () => {
    assert.ok(service);
  });

  it('should create a book', async () => {
    const result = await service.create(mockBook);
    assert.deepEqual(result, mockBook);
  });

  it('should find one book by id', async () => {
    const result = await service.findOne('1');
    assert.deepEqual(result, mockBook);
  });

  it('should update a book', async () => {
    const result = await service.update('1', { title: 'Updated Title', isbn10: '1234567890' });
    assert.deepEqual(result, mockBook);
  });

  it('should remove a book', async () => {
    const result = await service.remove('1');
    assert.deepEqual(result, mockBook);
  });

  it('should find all books with pagination', async () => {
    const result = await service.findAll({ page: 1, limit: 10 });
    assert.equal(result.data.length, 1);
    assert.equal(result.total, 1);
  });

  it('should get top rated books', async () => {
    const result = await service.getTopRatedBooks({ limit: 5 });
    assert.equal(result.length, 1);
    assert.equal(result[0].title, 'Test Book');
  });
});
