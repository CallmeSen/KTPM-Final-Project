import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateNotificationInput {
  @Field({ nullable: true })
  userId?: string;

  @Field()
  title: string;  

  @Field()
  message: string;

  @Field({ nullable: true })
  image?: string;  
}

