import { Test, TestingModule } from '@nestjs/testing';
import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart.items';
import { jest, expect, describe, beforeEach, afterEach } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { it } from 'node:test';

describe('CartResolver', () => {
  let resolver: CartResolver;
  let cartService: CartService;

  const mockCartService: Partial<Record<keyof CartService, jest.MockedFunction<any>>> = {
  createCart: jest.fn(),
  getCartByUser: jest.fn(),
  createCartItem: jest.fn(),
  countCartItems: jest.fn(),
  clearCart: jest.fn(),
};


 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      CartResolver,
      { provide: CartService, useValue: {
        createCart: jest.fn(),
        getCartByUser: jest.fn(),
        createCartItem: jest.fn(),
        countCartItems: jest.fn(),
        clearCart: jest.fn(),
      } },
    ],
  }).compile();

  resolver = module.get<CartResolver>(CartResolver);
  cartService = module.get(CartService) as jest.Mocked<CartService>;
});
  describe('createCart', () => {
    it('should call CartService.createCart and return a cart', async () => {
      const mockCart = { id: 1 } as Cart;
      mockCartService.createCart?.mockResolvedValue(mockCart);

      const result = await resolver.createCart('user1');

      expect(result).toEqual(mockCart);
      expect(cartService.createCart).toHaveBeenCalledWith('user1');
    });
  });

  describe('getCartByUser', () => {
    it('should return a cart for the given user', async () => {
      const mockCart = { id: 1 } as Cart;
      mockCartService.getCartByUser?.mockResolvedValue(mockCart);

      const result = await resolver.getCartByUser('user1');

      expect(result).toEqual(mockCart);
      expect(cartService.getCartByUser).toHaveBeenCalledWith('user1');
    });

    it('should throw NotFoundException if CartService throws', async () => {
      mockCartService.getCartByUser?.mockRejectedValue(new NotFoundException());

      await expect(resolver.getCartByUser('user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addCartItem', () => {
    it('should call CartService.createCartItem and return the item', async () => {
      const mockItem = { id: 1 } as CartItem;
      mockCartService.createCartItem?.mockResolvedValue(mockItem);

      const result = await resolver.addCartItem('1', 'user1', 'book1', 2);

      expect(result).toEqual(mockItem);
      expect(cartService.createCartItem).toHaveBeenCalledWith('1', 'user1', 'book1', 2);
    });

    it('should throw NotFoundException if CartService throws', async () => {
      mockCartService.createCartItem?.mockRejectedValue(new NotFoundException());

      await expect(resolver.addCartItem('1', 'user1', 'book1', 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('countCartItems', () => {
    it('should return the count of items', async () => {
      mockCartService.countCartItems?.mockResolvedValue(3);

      const result = await resolver.countCartItems('user1');

      expect(result).toBe(3);
      expect(cartService.countCartItems).toHaveBeenCalledWith('user1');
    });
  });

  describe('clearCart', () => {
    it('should call CartService.clearCart and return true', async () => {
      mockCartService.clearCart?.mockResolvedValue(undefined);

      const result = await resolver.clearCart('user1');

      expect(result).toBe(true);
      expect(cartService.clearCart).toHaveBeenCalledWith('user1');
    });

    it('should throw NotFoundException if CartService throws', async () => {
      mockCartService.clearCart?.mockRejectedValue(new NotFoundException());

      await expect(resolver.clearCart('user1')).rejects.toThrow(NotFoundException);
    });
  });
});
