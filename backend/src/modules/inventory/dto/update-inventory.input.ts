import { CreateInventoryInput } from './create-inventory.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateInventoryInput extends PartialType(CreateInventoryInput) {
  @Field(() => String)
  id: string;

  @Field(() => Int)
  quantity: number;
  
}
