import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart.items';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { jest, expect, describe, beforeEach, afterEach, it } from '@jest/globals';

describe('CartService', () => {
  let service: CartService;

  const mockCartRepo: Partial<jest.Mocked<Repository<Cart>>> = {
    findOne: jest.fn(),
    
  };

  const mockCartItemRepo: Partial<jest.Mocked<Repository<CartItem>>> = {
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepo: Partial<jest.Mocked<Repository<User>>> = {
    findOne: jest.fn(),
  };

  const mockBookRepo: Partial<jest.Mocked<Repository<Book>>> = {
    findOne: jest.fn(),
  };

  const cart: Cart = {
    id: 1,
    items: [
      { id: 1, quantity: 2, book: { price: 10 } as Book, cart: {} as Cart } as CartItem,
    ],
    user: { id: 'user1' } as User,
    totalPrice: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: mockCartRepo },
        { provide: getRepositoryToken(CartItem), useValue: mockCartItemRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Book), useValue: mockBookRepo },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCartByUser', () => {
    it('should return cart if found', async () => {
      mockCartRepo.findOne!.mockResolvedValue(cart);
      const result = await service.getCartByUser('user1');
      expect(result).toEqual(cart);
    });

    it('should throw NotFoundException if cart not found', async () => {
      mockCartRepo.findOne!.mockResolvedValue(null);
      await expect(service.getCartByUser('user1')).rejects.toThrow(NotFoundException);
    });
  });


});
