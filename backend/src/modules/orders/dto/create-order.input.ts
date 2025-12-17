import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateOrderInput {

  @Field(() => String)
  user_email: string;


  @Field(() => Float)
  totalAmount: number;

  @Field(() => String)
  stripePaymentId: string;

}
