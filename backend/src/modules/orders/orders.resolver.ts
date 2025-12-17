import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { PaginatedOrders } from 'src/interfaces/pagnition.interface';

@Resolver(() => Order)
export class OrdersResolver {

  constructor(private readonly ordersService: OrdersService) { }

  @Mutation(() => Order)
  async createOrder(
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
  ) {
    const { user_email,totalAmount, stripePaymentId } = createOrderInput;
    return this.ordersService.createOrder(user_email,totalAmount, stripePaymentId);
  }


  @Query(() => [Order], { name: 'orders' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Query(() => PaginatedOrders)
    async getAllOrders(
      @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
      @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    ) {
      return await this.ordersService.findAll(page, limit);
    }

  @Query(() => Order, { name: 'order' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.ordersService.findOne(id);
  }

  @Mutation(() => Order)
  async updateOrder(@Args('updateOrderInput') updateOrderInput: UpdateOrderInput) {
    return await this.ordersService.update(updateOrderInput.id, updateOrderInput);
  }

  @Mutation(() => Order)
  removeOrder(@Args('id', { type: () => Int }) id: number) {
    return this.ordersService.remove(id);
  }
  
}
