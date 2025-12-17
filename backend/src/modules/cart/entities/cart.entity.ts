import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { CartItem } from 'src/modules/cart/entities/cart.items';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column, OneToMany, Index } from 'typeorm';

@ObjectType()   
@Entity()
export class Cart {
  @Field(() => Int) 
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Float) 
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Field(() => User) 
  @OneToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' })
  @JoinColumn()
  @Index() 
  user: User;


  @Field(() => [CartItem], { nullable: 'items' }) 
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];
}

