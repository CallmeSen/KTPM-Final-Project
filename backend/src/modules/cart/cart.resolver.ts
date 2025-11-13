import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from 'src/modules/cart/entities/cart.items';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) { }

  @Mutation(() => Cart)
  async createCart(
    @Args('createCartInput') createCartInput: string,
  ): Promise<Cart> {
    return await this.cartService.createCart(createCartInput);
  }

  @Query(() => Cart)
  async getCartByUser(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<Cart> {
    return await this.cartService.getCartByUser(userId);
  }

  @Mutation(() => CartItem, { name: 'addCartItem' })
  async addCartItem(
    @Args('cartId', { type: () => ID, nullable: true }) cartId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('bookId', { type: () => ID }) bookId: string,
    @Args('quantity', { type: () => Int, defaultValue: 1 }) quantity: number,
  ) {
    return await this.cartService.createCartItem(cartId, userId, bookId, quantity);
  }

  // ...existing code...

@Mutation(() => Boolean, { name: 'removeCartItem' })
async removeCartItem(
  @Args('cartItemId', { type: () => ID }) cartItemId: number,
  @Args('userId', { type: () => ID }) userId: string,
): Promise<boolean> {
  return await this.cartService.removeCartItem(cartItemId, userId);
}

// ...existing code... (không thay đổi gì khác)

  @Query(() => Int)
  async countCartItems(
    @Args('userId') userId: string,
  ): Promise<number> {
    return await this.cartService.countCartItems(userId);
  }

  @Mutation(() => Boolean, { name: 'clearCart' })
  async clearCart(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<boolean> {
    await this.cartService.clearCart(userId);
    return true;
  }

  
}
