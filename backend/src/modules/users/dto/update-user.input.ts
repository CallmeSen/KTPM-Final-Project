import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateUserDto } from './create-user.input';

@InputType()
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @Field(() => ID)
  id: string;
}
