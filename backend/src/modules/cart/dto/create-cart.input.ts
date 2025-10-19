<<<<<<< Updated upstream
import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCartInput {
  @Field(() => String) 
  userId: string;
}
=======
import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCartInput {
  @Field(() => String) 
  userId: string;
}
>>>>>>> Stashed changes
