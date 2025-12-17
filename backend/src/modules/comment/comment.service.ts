import { Injectable } from '@nestjs/common';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Book } from 'src/modules/books/entities/book.entity';
import axios from 'axios';

@Injectable()
export class CommentService {

  constructor(

    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,

    @InjectRepository(User)
    private readonly userRepo: Repository<Comment>,

    @InjectRepository(Book)
    private readonly bookRepo: Repository<Comment>,

  ) { }


  async create(createCommentInput: CreateCommentInput) {

    const { bookId, userId, parentId, content } = createCommentInput;


    const user = await this.userRepo.findOne({ where: { id: userId } });

    const book = await this.bookRepo.findOne({ where: { id: bookId } });

    if (!user) throw new Error('User not found');

    if (!book) throw new Error('Book not found');


    let parent: Comment | undefined;

    if (parentId) {
      const foundParent = await this.commentRepo.findOne({ where: { id: parentId } });
      if (!foundParent) throw new Error('Parent comment not found');
      parent = foundParent;
    }

    let prediction = null;
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        comment: content,
        model_type: 'bow',
      });


      prediction = response.data.prediction;
    } catch (err) {
      console.error('Failed to call prediction API:', err.message);
    }



    const comment = this.commentRepo.create({
      content,
      user,
      book,
      parent,
      sentiment: prediction == 1 ? "positive" : "negative",
    });

    await this.commentRepo.save(comment);

    return comment;

  }



  async getRepplyComment(parentId: string) {

    return await this.commentRepo.find({
      where: { parentId },
    });

  }

  async update(id: string, updateCommentInput: UpdateCommentInput) {

    await this.commentRepo.update(id, updateCommentInput);

    return true;

  }

  async remove(id: string) {

    const comment = await this.commentRepo.findOne({ where: { id } });

    if (!comment) {
      throw new Error('Comment not found');
    }


    await this.commentRepo.delete(id);


    return comment;

  }
  async getRepliesByParent(parentId: string): Promise<Comment[]> {

    return await this.commentRepo.find({

      where: { parent: { id: parentId } },

      relations: ['parent', 'replies'],

    });

  }

  async getCommentsByBook(bookId: string, skip = 0, take = 4) {

    return await this.commentRepo.find({

      where: { parentId: IsNull(), book: { id: bookId } },

      relations: ['user', 'replies', 'replies.user'],

      order: { createdAt: 'DESC' },

      skip,

      take,

    });

  }

  async likeComment(commentId: string, userId: string) {

    const comment = await this.commentRepo.findOneBy({ id: commentId });

    if (!comment) throw new Error('Comment not found');

    console.log(comment.likeUsers)

    const index = comment.likeUsers.findIndex(id => id === userId);

    const count = comment.likeUsers.filter(id => id == userId).length;

    if (count > 0) {

      comment.likes = Math.max(0, comment.likes - 1);

      comment.likeUsers.splice(index, 1);


      await this.commentRepo.save(comment);

      return comment;

    }

    else {

      comment.likes = comment.likes + 1;

      comment.likeUsers.push(userId);

      await this.commentRepo.save(comment);

      return comment;
    }

  }

}
