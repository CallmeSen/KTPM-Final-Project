import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Book } from 'src/modules/books/entities/book.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartItem } from 'src/modules/cart/entities/cart.items';
import { Payment } from 'src/modules/Payment/entity/payment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Notification } from 'src/modules/notification/entities/notification.entity';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';

dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Cart, Book,CartItem,Payment,Notification,Inventory,Comment],
  autoLoadEntities: true,
  synchronize: true,
};
