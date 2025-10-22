import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Book } from "src/modules/books/entities/book.entity";
import { Cart } from "src/modules/cart/entities/cart.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@ObjectType() 
@Entity('cart_items')
@Unique(['cart', 'book'])   
export class CartItem {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Cart)
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @Field(() => Book)
  @ManyToOne(() => Book, (book) => book.cartItems, { eager: true, onDelete: 'CASCADE' })
  book: Book;

  @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Field(() => Int)
  get cartId(): number {
    return this.cart?.id;
  }

  @Field(() => Int)
  get bookId(): string {
    return this.book?.id;
  }
}
