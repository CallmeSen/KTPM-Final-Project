import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchHistory } from 'src/entities/search-history';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(SearchHistory)
    private searchRepo: Repository<SearchHistory>,
  ) {}

  async saveSearch(userId: string, searchTerm: string) {
    const search = this.searchRepo.create({
      userId,
      searchTerm,
    });
    return await this.searchRepo.save(search);
  }
  
}
