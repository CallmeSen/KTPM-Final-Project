import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart.items';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Test, TestingModule } from '@nestjs/testing';

describe('CartService', () => {
  let service: CartService;
  const mockRepo = () => ({
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    delete: vi.fn(),
  });

  let cartRepo: ReturnType<typeof mockRepo>;
  let cartItemRepo: ReturnType<typeof mockRepo>;
  let bookRepo: ReturnType<typeof mockRepo>;
  let userRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useFactory: mockRepo },
        { provide: getRepositoryToken(CartItem), useFactory: mockRepo },
        { provide: getRepositoryToken(Book), useFactory: mockRepo },
        { provide: getRepositoryToken(User), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepo = module.get(getRepositoryToken(Cart));
    cartItemRepo = module.get(getRepositoryToken(CartItem));
    bookRepo = module.get(getRepositoryToken(Book));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should return a cart if found', async () => {
    const mockCart = { id: 1, user: { id: 'u1' }, items: [] };
    cartRepo.findOne.mockResolvedValue(mockCart);

    const result = await service.getCartByUser('u1');
    expect(result).toEqual(mockCart);
  });
});
