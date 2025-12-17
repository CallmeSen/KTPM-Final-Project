import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { Payment } from 'src/modules/Payment/entity/payment.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';


export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'The status of a user',
});

@ObjectType()
@Entity()
export class User {

  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Field({ nullable: true })
  @Column({ default: 'Unknown' })
  address: string;


  @Field()
  @Column({ unique: true })
  email: string;

  @Field(() => UserStatus)
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Field()
  @Column({ default: 'user' })
  role: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  refreshTokens: string;

  @OneToOne(() => Cart, (cart) => cart.user, { cascade: true })
  cart: Cart;

  @OneToMany(() => Payment, payment => payment.user)
  payments: Payment[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments?: Comment[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  dateOfBirth?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  gender?: string;

}
