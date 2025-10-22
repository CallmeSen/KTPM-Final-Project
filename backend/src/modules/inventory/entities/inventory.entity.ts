import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Book } from 'src/modules/books/entities/book.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('inventories')
export class Inventory {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

 

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Field(() => String)
  @Column()
  location: string;
}
