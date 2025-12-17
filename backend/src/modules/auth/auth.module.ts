import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import jwtConfig from 'src/modules/auth/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import refreshjwtConfig from 'src/modules/auth/config/refreshjwt.config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { BlacklistService } from 'src/modules/Blacklist/blacklist.service';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { GoogleStrategy } from 'src/modules/auth/stragegies/google.strategy';
import { JwtStrategy } from 'src/modules/auth/stragegies/jwt.strategy';
import googleOuth from 'src/modules/auth/config/google.outh';
import { UserModule } from 'src/modules/users/users.module';
import { BlacklistModule } from 'src/modules/Blacklist/blacklist.module';
import { Blacklist } from 'src/modules/Blacklist/entities/blacklist.entity';
import { RefreshToken } from 'src/modules/auth/entities/RefreshToken.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartItem } from 'src/modules/cart/entities/cart.items';
import { CartService } from 'src/modules/cart/cart.service';
import { CartModule } from 'src/modules/cart/cart.module';
import { Book } from 'src/modules/books/entities/book.entity';
import { MailModule } from 'src/mails/mail.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Blacklist, RefreshToken, Cart, CartItem, Book]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshjwtConfig),
    ConfigModule.forFeature(googleOuth),
    forwardRef(() => MailModule), 
    forwardRef(() => UserModule),
    forwardRef(() => BlacklistModule),
    forwardRef(() => CartModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    CartService,
    BlacklistService,
    AuthGuard,
    GoogleStrategy,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
