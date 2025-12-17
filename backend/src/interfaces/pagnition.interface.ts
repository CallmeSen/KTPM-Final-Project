import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';
import { Book } from 'src/modules/books/entities/book.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { User } from 'src/modules/users/entities/user.entity';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 10 })
  limit: number;
}



@ObjectType()
export class PaginatedBooks {
  @Field(() => [Book])
  data: Book[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}

@ObjectType()
export class GetPaginatedBooks {
  @Field(() => [Book])
  data: Book[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}

@ObjectType()
export class PaginatedUsers {
  @Field(() => [User])
  users: User[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}


@ObjectType()
export class PaginatedOrders {
  @Field(() => [Order])
  orders: Order[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
