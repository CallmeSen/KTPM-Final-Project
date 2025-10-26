import { Injectable } from '@nestjs/common';
import { UpdateOrderInput } from './dto/update-order.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersService {

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) { }

  async createOrder(
    user_email: string,
    totalAmount: number,
    stripePaymentId: string,
  ) {

    try {
      const order = this.orderRepository.create({
        user_email,
        totalAmount,
        stripePaymentId,
        status: 'PENDING',
        createdAt: new Date(),
      });

      return await this.orderRepository.save(order);
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [orders, total] = await this.orderRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      orders,
      total,
      page,
      limit,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  async update(id: string, updateOrderInput: UpdateOrderInput) {

    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }

    Object.assign(order, updateOrderInput);


    return await this.orderRepository.save(order);
  }

  async updateStatusByPaymentIntent(paymentIntentId: string, status: string) {

    const order = await this.orderRepository.findOne({
      where: { stripePaymentId: paymentIntentId },
    });

    if (!order) {
      throw new Error('Order not found for this payment intent');
    }

    order.status = status;
    
    return await this.orderRepository.save(order);

  }



  remove(id: number) {
    return `This action removes a #${id} order`;
  }

}
