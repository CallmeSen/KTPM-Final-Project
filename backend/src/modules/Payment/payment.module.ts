import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { HttpModule } from '@nestjs/axios';  
import { StripeModule } from 'src/modules/Payment/spripte.module';
import { Book } from 'src/modules/books/entities/book.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/modules/Payment/entity/payment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartService } from 'src/modules/cart/cart.service';
import { CartItem } from 'src/modules/cart/entities/cart.items';
import { NotificationService } from 'src/modules/notification/notification.service';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { Notification } from 'src/modules/notification/entities/notification.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { OrdersService } from 'src/modules/orders/orders.service';
@Module({
  imports: [
    HttpModule, 
    StripeModule,
    NotificationModule,
    TypeOrmModule.forFeature([Book,Payment,User,Cart,CartItem,Notification,Order])],  
  controllers: [PaymentController],
  providers: [PaymentService,CartService,NotificationService,OrdersService],
})
export class PaymentModule {}
