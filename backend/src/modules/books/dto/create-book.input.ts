import { InputType, Int, Field, Float } from '@nestjs/graphql';
import { Column } from 'typeorm';

@InputType()
export class CreateBookInput {
  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  subtitle?: string;

  @Field(() => String, { nullable: true })
  authors?: string;

  @Field(() => String, { nullable: true })
  categories?: string;

  @Field(() => String, { nullable: true })
  thumbnail?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  published_year?: number;

  @Field(() => Float, { nullable: true })


  @Field(() => Int, { nullable: true })
  num_pages?: number;

  @Field(() => Int, { nullable: true })


  @Field(() => Float, { nullable: true })
  price?: number;

}
