import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';
import { CartItem } from 'src/modules/cart/entities/cart.items';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne } from 'typeorm';
import { Comment } from 'src/modules/comment/entities/comment.entity';
@ObjectType()
@Entity('books')
export class Book {

  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'text' })
  title: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  subtitle?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true})
  authors?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  categories?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  thumbnail?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'longtext', nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  published_year?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  num_pages?: number | null;


  @Field(() => Float, { nullable: false })
  @Column({ type: 'float', nullable: true })
  price: number;

  @OneToMany(() => CartItem, (cartItem) => cartItem.book)
  cartItems: CartItem[];

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  id_stripe?: string;

  @Field(() => [Comment], { nullable: true })
  @OneToMany(() => Comment, (comment) => comment.book, { cascade: true })
  comments?: Comment[];

   @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  quantity: number;
  
}
