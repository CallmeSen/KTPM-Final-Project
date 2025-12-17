  import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
  import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

  @ObjectType()
  @Entity('orders')
  export class Order {

    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field(() => String)
    @Column()
    user_email: string;


    @Field(() => Float)
    @Column('float')
    totalAmount: number;

    @Field(() => String)
    @Column()
    stripePaymentId: string;

    @Field(() => String)
    @Column({ default: 'paid' })
    status: string;

    @Field(() => String)
    @Column({ default: 'processing' })
    orderStatus: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    paymentIntentId?: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    refundReason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';

    @Field(() => Date)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => Date)
    @UpdateDateColumn()
    updatedAt: Date;
    
  }
