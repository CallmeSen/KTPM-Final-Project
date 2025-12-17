import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateOrderInput {

  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  orderStatus?: string;

  @Field(() => String, { nullable: true })
  refundReason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}
