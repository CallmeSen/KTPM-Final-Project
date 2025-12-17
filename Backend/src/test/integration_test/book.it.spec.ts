import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';
import { BooksService } from 'src/modules/books/books.service';
import { Book } from 'src/modules/books/entities/book.entity';


describe('BooksService Integration Flows', () => {
  let service: BooksService;
  let bookRepo: any;

  const dbBooks: Book[] = []; // DB giả in-memory

  beforeEach(async () => {
    dbBooks.length = 0;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),

            save: jest.fn().mockImplementation((book) => {
              const newBook = {
                id: crypto.randomUUID(),
                ...book,
              };
              dbBooks.push(newBook);
              return Promise.resolve(newBook);
            }),

            findOneBy: jest.fn().mockImplementation(({ id }) => {
              return Promise.resolve(dbBooks.find((b) => b.id === id) || null);
            }),

            findAndCount: jest.fn().mockImplementation(({ skip, take }) => {
              const items = dbBooks.slice(skip, skip + take);
              return Promise.resolve([items, dbBooks.length]);
            }),

            remove: jest.fn().mockImplementation((book) => {
              const index = dbBooks.findIndex((b) => b.id === book.id);
              if (index > -1) dbBooks.splice(index, 1);
              return Promise.resolve(book);
            }),

            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    bookRepo = module.get(getRepositoryToken(Book));
  });

  // ==========================================
  // FLOW 1: Create → FindOne
  // ==========================================
  it('Flow: create then findOne', async () => {
    const dto = {
      title: 'Integration Book',
      price: 100,
      quantity: 10,
    };

    const created = await service.create(dto as any);
    expect(created.id).toBeDefined();

    const found = await service.findOne(created.id);
    expect(found).toBeDefined();
    expect(found!.title).toBe('Integration Book');
  });

  // ==========================================
  // FLOW 2: findAll pagination
  // ==========================================
  it('Flow: pagination logic', async () => {
    // seed 25 books
    for (let i = 0; i < 25; i++) {
      await service.create({
        title: `Book ${i}`,
        price: 10,
        quantity: 1,
      } as any);
    }

    const result = await service.findAll({ page: 2, limit: 10 });

    expect(result.total).toBe(25);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.data.length).toBe(10);
  });

  // ==========================================
  // FLOW 3: remove book
  // ==========================================
  it('Flow: remove book', async () => {
    const book = await service.create({
      title: 'Delete me',
      price: 50,
      quantity: 1,
    } as any);

    const removed = await service.remove(book.id);
    expect(removed).toBeDefined();

    const found = await service.findOne(book.id);
    expect(found).toBeNull();
  });
});
