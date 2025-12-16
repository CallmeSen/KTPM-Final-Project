import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart.items';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';

/* ===== HELPER MOCK REPO ===== */
const mockRepo = <T>() => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
});


describe('CartService', () => {
  let service: CartService;

  let cartRepo: jest.Mocked<Repository<Cart>>;
  let cartItemRepo: jest.Mocked<Repository<CartItem>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let bookRepo: jest.Mocked<Repository<Book>>;

  const mockUser: User = { id: 'user1' } as User;

  const mockCart: Cart = {
    id: 1,
    user: mockUser,
    items: [],
    totalPrice: 0,
  } as Cart;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: mockRepo<Cart>() },
        { provide: getRepositoryToken(CartItem), useValue: mockRepo<CartItem>() },
        { provide: getRepositoryToken(User), useValue: mockRepo<User>() },
        { provide: getRepositoryToken(Book), useValue: mockRepo<Book>() },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepo = module.get(getRepositoryToken(Cart));
    cartItemRepo = module.get(getRepositoryToken(CartItem));
    userRepo = module.get(getRepositoryToken(User));
    bookRepo = module.get(getRepositoryToken(Book));
  });


  /* ================= createCart ================= */
  describe('createCart', () => {
    it('should create cart successfully', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      cartRepo.create.mockReturnValue(mockCart);
      cartRepo.save.mockResolvedValue(mockCart);

      const result = await service.createCart('user1');

      expect(result).toEqual(mockCart);
      expect(cartRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.createCart('x')).rejects.toThrow(NotFoundException);
    });
  });

  /* ================= getCartByUser ================= */
  describe('getCartByUser', () => {
    it('should return cart', async () => {
      cartRepo.findOne.mockResolvedValue(mockCart);

      const result = await service.getCartByUser('user1');
      expect(result).toEqual(mockCart);
    });

    it('should throw NotFoundException if cart not found', async () => {
      cartRepo.findOne.mockResolvedValue(null);

      await expect(service.getCartByUser('x')).rejects.toThrow(NotFoundException);
    });
  });

  /* ================= countCartItems ================= */
  describe('countCartItems', () => {
    it('should return number of items', async () => {
      cartRepo.findOne.mockResolvedValue({
        ...mockCart,
        items: [{}, {}, {}] as CartItem[],
      });

      const result = await service.countCartItems('user1');
      expect(result).toBe(3);
    });

    it('should return 1 if cart not found', async () => {
      cartRepo.findOne.mockResolvedValue(null);

      const result = await service.countCartItems('x');
      expect(result).toBe(1);
    });
  });

  /* ================= clearCart ================= */
  describe('clearCart', () => {
    it('should remove all cart items', async () => {
      cartRepo.findOne.mockResolvedValue({
        ...mockCart,
        items: [{ id: 1 } as CartItem],
      });

      await service.clearCart('user1');

      expect(cartItemRepo.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if cart not found', async () => {
      cartRepo.findOne.mockResolvedValue(null);

      await expect(service.clearCart('x')).rejects.toThrow(NotFoundException);
    });
  });

  /* ================= removeCartItem ================= */
  describe('removeCartItem', () => {
    it('should remove cart item if owner', async () => {
      cartItemRepo.findOne.mockResolvedValue({
        id: 1,
        cart: { user: { id: 'user1' } },
      } as any);

      const result = await service.removeCartItem(1, 'user1');

      expect(result).toBe(true);
      expect(cartItemRepo.remove).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not owner', async () => {
      cartItemRepo.findOne.mockResolvedValue({
        cart: { user: { id: 'other' } },
      } as any);

      await expect(
        service.removeCartItem(1, 'user1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
