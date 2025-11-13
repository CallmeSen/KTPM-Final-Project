import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart.items';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Book) private readonly bookRepo: Repository<Book>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) { }

  async getCartByUser(userId: string): Promise<Cart> {

    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.book'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }


  async removeCart(userId: string) {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    await this.cartRepo.remove(cart);

    return { message: 'Cart and items removed successfully' };
  }

  async updateCart(userId: string, bookId: string, quantity: number): Promise<Cart> {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.book'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    let cartItem = await this.cartItemRepo.findOne({
      where: { cart: { id: cart.id }, book: { id: bookId } },
      relations: ['cart', 'book'],
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    if (quantity <= 0) {
      await this.cartItemRepo.remove(cartItem);
    } else {
      cartItem.quantity = quantity;
      await this.cartItemRepo.save(cartItem);
    }

    const updatedCart = await this.cartRepo.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.book'],
    });

    if (!updatedCart) throw Error("not cart")

    updatedCart.totalPrice = updatedCart.items.reduce(
      (sum, item) => sum + item.quantity * item.book.price,
      0,
    );

    return await this.cartRepo.save(updatedCart);

  }

  async createCart(userId: string): Promise<Cart> {

    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cart = await this.cartRepo.create({
      user,
      totalPrice: 0,
    });

    return await this.cartRepo.save(cart);

  }



  async createCartItem(
    cartId: string,
    userId: string,
    bookId: string,
    quantity = 1,
  ) {


    let cart = await this.cartRepo.findOne({
      where: { id: Number(cartId) },
      relations: ['items', 'user'],
    });

    if (!cart) {
      cart = await this.createCart(userId);
    }


    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');


    let cartItem = await this.cartItemRepo.findOne({
      where: { cart: { id: cart.id }, book: { id: book.id } },
      relations: ['cart', 'book'],
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await this.cartItemRepo.save(cartItem);
    } else {

      cartItem = await this.cartItemRepo.create({ cart, book, quantity });
      await this.cartItemRepo.save(cartItem);

    }

    return cartItem;

  }

  async removeAllItems(cartId: string): Promise<void> {

    const cart = await this.cartRepo.findOne({
      where: { id: Number(cartId) },
    });

    if (!cart) throw new NotFoundException('Cart not found');

    await this.cartItemRepo.delete({ cart: { id: Number(cartId) } });

    cart.totalPrice = 0;

    await this.cartRepo.save(cart);

  }


  async countCartItems(userId: string): Promise<number> {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },  
      relations: ['items'],
    });

    if (!cart) return 1;
    return cart.items.length;
  }

  async clearCart(userId: string): Promise<void> {
  const cart = await this.cartRepo.findOne({
    where: { user: { id: userId } },
    relations: ['items'],
  });

  if (!cart) {
    throw new NotFoundException(`Cart not found for user ${userId}`);
  }

  if (cart.items.length > 0) {
    await this.cartItemRepo.remove(cart.items);
  }
 }

 // ...existing code...

async removeCartItem(cartItemId: number, userId: string): Promise<boolean> {
  // Tìm cart item và kiểm tra quyền sở hữu
  const cartItem = await this.cartItemRepo.findOne({
    where: { id: cartItemId },
    relations: ['cart', 'cart.user'],
  });

  if (!cartItem) {
    throw new NotFoundException('Cart item not found');
  }

  if (cartItem.cart.user.id !== userId) {
    throw new ForbiddenException('You do not own this cart item');
  }

  // Xóa item
  await this.cartItemRepo.remove(cartItem);
  return true;
}

// ...existing code... (không thay đổi gì khác)

}
