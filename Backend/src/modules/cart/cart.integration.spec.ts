import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart.items';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';

describe('CartService Integration Flow', () => {
  let service: CartService;
  let cartRepo: any;
  let cartItemRepo: any;
  let bookRepo: any;
  let userRepo: any;

  const userId = 'user1';
  const cartId = '1';
  const bookId = '101';

  const mockUser = { id: userId } as User;
  const mockBook = { id: bookId, price: 10 } as Book;

  const mockCart = {
    id: Number(cartId),
    user: mockUser,
    items: [],
    totalPrice: 0,
  } as Cart;

  beforeEach(async () => {
    cartRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    cartItemRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),
    };

    bookRepo = {
      findOne: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: cartRepo },
        { provide: getRepositoryToken(CartItem), useValue: cartItemRepo },
        { provide: getRepositoryToken(Book), useValue: bookRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // Flow: createCartItem
  // ==========================================
  describe('Flow: createCartItem', () => {
    it('[Cart-8] create NEW cart item if not exists', async () => {
      cartRepo.findOne.mockResolvedValue(mockCart);
      bookRepo.findOne.mockResolvedValue(mockBook);
      cartItemRepo.findOne.mockResolvedValue(null);
      cartItemRepo.create.mockImplementation(v => v);
      cartItemRepo.save.mockResolvedValue({ id: 1 });

      const result = await service.createCartItem(
        cartId,
        userId,
        bookId,
        2,
      );

      expect(cartItemRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 2,
          book: mockBook,
          cart: mockCart,
        }),
      );

      expect(cartItemRepo.save).toHaveBeenCalled();
      expect(result.quantity).toBe(2);
    });

    it('[Cart-9] accumulate quantity if item exists', async () => {
      const existingItem = {
        id: 5,
        quantity: 2,
        cart: mockCart,
        book: mockBook,
      } as CartItem;

      cartRepo.findOne.mockResolvedValue(mockCart);
      bookRepo.findOne.mockResolvedValue(mockBook);
      cartItemRepo.findOne.mockResolvedValue(existingItem);
      cartItemRepo.save.mockResolvedValue(existingItem);

      await service.createCartItem(cartId, userId, bookId, 3);

      expect(existingItem.quantity).toBe(5);
      expect(cartItemRepo.save).toHaveBeenCalledWith(existingItem);
    });

    it('[Cart-10] throw if book not found', async () => {
      cartRepo.findOne.mockResolvedValue(mockCart);
      bookRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createCartItem(cartId, userId, bookId, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================
  // Flow: clearCart
  // ==========================================
  describe('Flow: clearCart', () => {
    it('[Cart-17] remove all cart items by user', async () => {
      const items = [{ id: 1 }, { id: 2 }] as CartItem[];

      cartRepo.findOne.mockResolvedValue({
        ...mockCart,
        items,
      });

      await service.clearCart(userId);

      expect(cartItemRepo.remove).toHaveBeenCalledWith(items);
    });

    it('[Cart-18] throw if cart not found', async () => {
      cartRepo.findOne.mockResolvedValue(null);

      await expect(service.clearCart(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
