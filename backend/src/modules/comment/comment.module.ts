import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Book } from 'src/modules/books/entities/book.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Comment,User,Book]),
   ],
  providers: [CommentResolver, CommentService],
})
export class CommentModule {}
