import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { CartItem } from 'src/modules/cart/entities/cart.items';
import { Book } from 'src/modules/books/entities/book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart,User,CartItem,Book]),
  ],
  providers: [CartResolver, CartService],
  exports:[CartService]
})
export class CartModule {}
