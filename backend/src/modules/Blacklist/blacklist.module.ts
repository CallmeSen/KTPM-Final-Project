import { Module } from '@nestjs/common';
import { BlacklistService } from './blacklist.service';
import { BlacklistController } from './blacklist.controller';
import { Blacklist } from 'src/modules/Blacklist/entities/blacklist.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [
    TypeOrmModule.forFeature([Blacklist]),
  ],
  controllers: [BlacklistController],
  providers: [BlacklistService],
  exports: [BlacklistService]
})
export class BlacklistModule { }
