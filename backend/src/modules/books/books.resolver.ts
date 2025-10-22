import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { FilterBooksArgs } from 'src/modules/books/dto/fiterbook';

import { GetPaginatedBooks, PaginatedBooks, PaginationInput } from 'src/interfaces/pagnition.interface';

@Resolver(() => Book)
export class BooksResolver {
  constructor(private readonly booksService: BooksService) { }

  @Mutation(() => Book)
  async createBook(@Args('createBookInput') createBookInput: CreateBookInput) {
    return await this.booksService.create(createBookInput);
  }


  @Query(() => Book, { name: 'book', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    if (!id) {
      throw new Error('Book ID is required');
    }
    return await this.booksService.findOne(id);
  }

  @Query(()=>GetPaginatedBooks )
  async books(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination: { page: 1, limit: 10 },
  ) {
    return await this.booksService.findAll(pagination);
  }


  @Mutation(() => Book)
  async updateBook(@Args('updateBookInput') updateBookInput: UpdateBookInput) {
    return await this.booksService.update(updateBookInput.isbn10, updateBookInput);
  }

  @Query(() => [Book], { name: 'searchBooksByTitle' })
  async searchBooksByTitle(@Args('searchTerm', { type: () => String }) searchTerm: string) {
    return await this.booksService.searchByTitle({ searchTerm });
  }

  @Mutation(() => Book)
  removeBook(@Args('isbn10') isbn10: string) {
    return this.booksService.remove(isbn10);
  }

  @Query(() => [Book], { name: 'booksByCategoryName' })
  async findByCategory(
    @Args('categoryName', { type: () => String }) categoryName: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return await this.booksService.GetByCategory({ categoryName, limit });
  }

  @Query(() => [Book], { name: 'getTopRatedBooks' })
  async getTopRatedBooks(
    @Args('limit', { type: () => Int, defaultValue: 15 }) limit: number = 15,
  ) {
    return await this.booksService.getTopRatedBooks({ limit });
  }


  @Query(() => [Book], { name: 'booksByCategory' })
  async Patrition(@Args() filter: FilterBooksArgs) {
    return await this.booksService.Partition({
      category: filter.categoryName,
      skip: filter.skip,
      take: filter.take,
    });
  }

  @Query(() => PaginatedBooks, { name: 'booksByCategory' })
  async booksByCategory(
    @Args('categoryName', { type: () => String }) categoryName: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return await this.booksService.GetByCategory({ categoryName, page, limit });
  }


}
