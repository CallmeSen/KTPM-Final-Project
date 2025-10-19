import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Throttle } from '@nestjs/throttler';



@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) { }


  @Query(() => [Comment])
  async getCommentsByBook(
    @Args('bookId') bookId: string,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 4 }) take: number,
  ) {
    return this.commentService.getCommentsByBook(bookId, skip, take);
  }

  @Throttle({ default: { limit: 3, ttl: 60 } })
  @Mutation(() => Comment)
  async AddComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ) {
    return await this.commentService.create(createCommentInput);
  }

  @Query(() => [Comment], { name: 'replies' })
  async getRepliesByParent(
    @Args('commentId', { type: () => String }) commentId: string,
  ) {
    return await this.commentService.getRepliesByParent(commentId);
  }


  @Mutation(() => Boolean)
  async updateComment(
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
  ) {
    return await this.commentService.update(updateCommentInput.id, updateCommentInput);
  }

  @Mutation(() => Comment)
  async removeComment(@Args('id', { type: () => String }) id: string) {
    return await this.commentService.remove(id);
  }

  @Mutation(() => Comment)
  async likeComment(
    @Args('commentId', { type: () => String }) commentId: string,
    @Args('userId', { type: () => String }) userId: string,
  ) {
    return await this.commentService.likeComment(commentId, userId);

  }

}
