import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class UpdateInventoryInput  {
  @Field()
  productId: string;

  @Field(() => Int)
  quantity: number;
}
