import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateUserDto {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  firstName?: string;


  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  dateOfBirth?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  email?: string;


}
