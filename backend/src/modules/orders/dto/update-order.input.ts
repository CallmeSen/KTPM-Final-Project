import { CreateOrderInput } from './create-order.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateOrderInput extends PartialType(CreateOrderInput) {

  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true, description: 'Trạng thái của đơn hàng' })
  status?: string;
  
}
