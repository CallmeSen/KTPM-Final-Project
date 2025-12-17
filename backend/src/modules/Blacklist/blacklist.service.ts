import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blacklist } from './entities/blacklist.entity';
import { CreateBlacklistDto } from './dto/create-blacklist.dto';
import { UpdateBlacklistDto } from './dto/update-blacklist.dto';

@Injectable()
export class BlacklistService {
  constructor(
    @InjectRepository(Blacklist)
    private blacklistRepo: Repository<Blacklist>,
  ) {}

  async create(createBlacklistDto: CreateBlacklistDto) {
    const token = this.blacklistRepo.create(createBlacklistDto as Partial<Blacklist>);
    return await this.blacklistRepo.save(token);
  }

  async findAll() {
    return await this.blacklistRepo.find();
  }

  async findAccessToken(accessToken: string) {
    const token = await this.blacklistRepo.findOne({ where: { accessToken } });
    if (!token) throw new NotFoundException('AccessToken not found');
    return token;
  }

  async findOne(id: string) {
    const token = await this.blacklistRepo.findOne({ where: { id } });
    if (!token) throw new NotFoundException('Blacklist entry not found');
    return token;
  }

  async update(id: string, updateDto: UpdateBlacklistDto) {
    await this.blacklistRepo.update(id, updateDto as Partial<Blacklist>);
    return this.findOne(id);
  }

  async remove(id: string) {
    const token = await this.findOne(id);
    return await this.blacklistRepo.remove(token);
  }
}
