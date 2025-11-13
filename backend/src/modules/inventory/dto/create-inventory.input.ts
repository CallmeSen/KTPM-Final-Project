import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateInventoryInput {
  @Field()
  id: string;

  @Field(() => Int)
  quantity: number;
}
