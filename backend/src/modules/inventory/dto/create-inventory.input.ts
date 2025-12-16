import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateInventoryInput {
  @Field()
  productId: string;

  @Field(() => Int)
  quantity: number;
}
