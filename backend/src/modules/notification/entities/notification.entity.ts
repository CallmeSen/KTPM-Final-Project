import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@ObjectType() 
@Entity('notifications')
export class Notification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })      
  @Column({ nullable: true ,default: null})      
  userId?: string;

  @Field()
  @Column()
  title: string; 

  @Field({ nullable: true })
  @Column({ nullable: true })
  image?: string;

  @Field()
  @Column()
  message: string;

  @Field()
  @Column({ default: false })
  isRead: boolean;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;
}
