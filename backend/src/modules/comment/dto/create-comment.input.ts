import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  
  @Field()
  userId?: string;

  @Field()
  bookId: string;

  @Field()
  content: string;

   @Field({ nullable: true })
  parentId?: string; 
}
