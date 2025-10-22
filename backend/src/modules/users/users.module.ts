import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { BlacklistModule } from 'src/modules/Blacklist/blacklist.module';
import { MailModule } from 'src/mails/mail.module';
import { CartModule } from 'src/modules/cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => BlacklistModule),
    forwardRef(() => MailModule),
    forwardRef(() => CartModule),
  ],
  providers: [
    UsersResolver,
    UserService,
  ],
  exports: [UserService], 
})
export class UserModule {}

