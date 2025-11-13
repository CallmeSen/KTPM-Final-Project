import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) { }

  async create(createBookInput: CreateBookInput): Promise<Book> {
    const book = this.bookRepository.create(createBookInput);
    return await this.bookRepository.save(book);
  }


  async findOne(id: string): Promise<Book | null> {
    let book = await this.bookRepository.findOneBy({ id });
    console.log(book)
    return book
  }

  async update(id: string, updateBookInput: UpdateBookInput): Promise<Book> {
    await this.bookRepository.update(id, updateBookInput);
    const updatedBook = await this.bookRepository.findOneBy({ id });
    if (!updatedBook) {
      throw new Error(`Book with id ${id} not found`);
    }
    return updatedBook;
  }

  async remove(id: string): Promise<Book | null> {
    const book = await this.bookRepository.findOneBy({ id });
    if (book) {
      await this.bookRepository.remove(book);
    }
    return book;
  }

  async findAll(pagination) {

    const { page, limit } = pagination;

    const [items, total] = await this.bookRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data :items,
      total,
      page,
      limit,
    };
  }

  async Partition({ category, skip, take }: { category: string; skip: number; take: number }) {
    return this.bookRepository.find({
      where: { categories: category },
      skip,
      take,
    });
  }

  async GetByCategory({
    categoryName,
    page,
    limit,
  }: {
    categoryName: string;
    page?: number;
    limit?: number;
  }) {
    const take = limit ?? 10;
    const skip = page && page > 0 ? (page - 1) * take : 0;

    const [books, total] = await this.bookRepository.findAndCount({
      where: { categories: categoryName },
      skip,
      take,
    });

    return {
      data: books,
      total,
      totalPages: Math.ceil(total / take),
      currentPage: page ?? 1,
    };
  }

  async searchByTitle({ searchTerm }: { searchTerm: string }): Promise<Book[]> {

    const query = this.bookRepository.createQueryBuilder('book');

    query.where('LOWER(book.title) LIKE :searchTerm', { searchTerm: `%${searchTerm.toLowerCase()}%` });

    return query.getMany();

  }

  async getTopRatedBooks({ limit }: { limit: number }): Promise<Book[]> {

    const query = this.bookRepository.createQueryBuilder('book');

    query.where('book.average_rating IS NOT NULL')
      .orderBy('book.average_rating', 'DESC')
      .take(limit);

    return query.getMany();

  }

  randomPrice(min = 10, max = 500) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  }

  

}

