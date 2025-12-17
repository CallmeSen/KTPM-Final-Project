import { Body, forwardRef, Inject, Injectable, InternalServerErrorException, Logger, Res, UnauthorizedException } from '@nestjs/common';


import { JwtService } from '@nestjs/jwt';
import { comparePassword, hashPassword } from 'src/helpers/util';
import { error } from 'console';
import { ConfigType } from '@nestjs/config';
import { hash, verify } from 'argon2';
import refreshjwtConfig from 'src/modules/auth/config/refreshjwt.config';
import jwtConfig from 'src/modules/auth/config/jwt.config';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { AuthPayload } from 'src/modules/auth/types/auth-jwtPayload';
import { UserService } from 'src/modules/users/users.service';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartService } from 'src/modules/cart/cart.service';
import { MailService } from 'src/mails/mail.service';
import { Blacklist } from 'src/modules/Blacklist/entities/blacklist.entity';
import type { CreateAuthDto } from 'src/modules/auth/dto/create-auth.dto';



@Injectable()
export class AuthService {

  private timeoutMap: Map<string, NodeJS.Timeout> = new Map();

  private postcodeMap: Map<string, string> = new Map();

  constructor(

    @Inject(forwardRef(() => MailService))
    private Mailservice: MailService,

    private readonly jwtService: JwtService,

    @InjectRepository(User) private userRepo: Repository<User>,

    @InjectRepository(Blacklist) private BlackListrepo: Repository<Blacklist>,

    @Inject(jwtConfig.KEY) private jwtConfigrulation: ConfigType<typeof jwtConfig>,

    @Inject(refreshjwtConfig.KEY) private refreshJwtConfig: ConfigType<typeof refreshjwtConfig>,

    private readonly cartService: CartService,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,

  ) { }

  async verifyUser(username: string, password: string): Promise<any> {

    try {

      const user = await this.userService.getUserByName(username)

      const isVailidPassword = await comparePassword(password, user.password)


      if (!isVailidPassword) throw new UnauthorizedException('Invalid password');

      return user != null ? user : null;

    }

    catch {
      Logger.error("Error in verifyUser:", error);

      throw new UnauthorizedException("error in Verify AuthService")

    }


  }

  async login(@Body() credentials: LoginDto) {

    const { email, password } = credentials;

    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) throw new UnauthorizedException("User not found");

    const { accessToken, refreshToken } = await this.generateToken(user.id);

    const hashedRefreshToken = await hash(refreshToken);

    await this.userService.updateHashedRefreshToken(user.id, hashedRefreshToken);

    if (!user.id) throw new Error("User ID không tồn tại");

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) throw new Error("Mật khẩu sai");


    return {
      user: {
        id: user.id,
        name: user.username || null,
        role: user.role
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };



  }

  async generateAccesstoken(userId: string) {

    const payload = { sub: userId };

    const accessToken = await this.jwtService.sign(payload, this.jwtConfigrulation);

    return accessToken;

  }


  async generateRefreshToken(userId: string) {

    const payload = { sub: userId };

    const refressToken = await this.jwtService.sign(payload, this.refreshJwtConfig);

    return refressToken;

  }
  async LogOut(accessToken: string) {
    const token = this.BlackListrepo.create({ accessToken: accessToken });
    return await this.BlackListrepo.save(token);
  }


  async changePassword(userId, oldPassword, newPassword) {

    console.log(userId)
    const user = await this.userRepo.findOne({ where: { id: userId } })
    console.log("currentuser", user)

    if (!user) {
      throw Error("User not found")
    }

    const passwrodMatch = await comparePassword(oldPassword, user.password)

    if (!passwrodMatch) throw Error("Wrong credentitals");

    const newHashPassword = await hashPassword(newPassword)

    if (!newHashPassword) throw new InternalServerErrorException("Hash password error");

    user.password = newHashPassword

    await this.userRepo.save(user)

    return { message: "Password updated successfully" };

  }

  async resetPassword(email, newPassword) {

    const user = await this.userRepo.findOne({ where: { email: email } })

    if (!user) {
      throw Error("User not found")
    }


    const newHashPassword = await hashPassword(newPassword)

    if (!newHashPassword) throw new InternalServerErrorException("Hash password error");

    user.password = newHashPassword

    await this.userRepo.save(user)

    return { message: "Password updated successfully" };
  }


  async Register(registerDto: CreateAuthDto) {

    const user = await this.userService.register(registerDto)


    return { message: "Register updated successfully" };

  }


  async validateJwtUser(userId: string) {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  async generateToken(userId: string) {

    const payload: AuthPayload = { sub: userId }

    const [accessToken, refreshToken] = await Promise.all([

      this.jwtService.signAsync(payload, this.jwtConfigrulation),

      this.jwtService.signAsync(payload, this.refreshJwtConfig),

    ]);

    return {

      accessToken,

      refreshToken

    }
  }


  async valiateGoogleLogin(profile: any) {

    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new Error('Email not found in Google profile');
    }

    let user = await this.userRepo.findOne({ where: { email } });

    if (user) {
      return user;
    }


    const { refreshToken } = await this.generateToken(profile.id);

    let password = await hashPassword(email)



    user = await this.userRepo.create({
      email,
      refreshTokens: refreshToken,
      username: profile.id,
      password: password,
    });

    await this.userRepo.save(user);

    await this.cartService.createCart(user.id);

    return user;

  }

  async validateRefreshToken(userId: string, refreshToken: string) {

    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) throw new UnauthorizedException("User not found");

    if (!user.refreshTokens) {
      throw new UnauthorizedException('No refresh token found for user');
    }

    const refreshTokenMatch = await verify(user.refreshTokens, refreshToken);

    if (!refreshTokenMatch) throw new UnauthorizedException('Invalid Refresh Token')


    const currentuser = { id: user.id, username: user.username };

    return currentuser;
  }

  async refreshToken(userId: string, username: string, role: string) {

    const { accessToken, refreshToken } = await this.generateToken(userId);

    return {
      id: userId,
      username,
      role:
        accessToken,
      refreshToken,
    }

  }

  async loginGoole(userId: string) {


    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) throw new UnauthorizedException("User not found");

    const { accessToken, refreshToken } = await this.generateToken(user.id)

    const hashedRefreshToken = await hash(refreshToken)

    await this.userService.updateHashedRefreshToken(user.id, hashedRefreshToken)

    if (!user?.id) throw new Error("User ID không tồn tại");

    return {
      user: {
        id: user.id,
        name: user.username || null,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async ResetPassword(email: string) {
    return await this.Mailservice.sendPasswordResetOtp(email)
  }

  async savePostcode(email: string, postcode: string) {
    if (this.timeoutMap.has(email)) {
      clearTimeout(this.timeoutMap.get(email));
    }


    this.postcodeMap.set(email, postcode);

    const timeout = setTimeout(() => {
      this.postcodeMap.delete(email);
      this.timeoutMap.delete(email);
      console.log(`Postcode for ${email} expired`);
    }, 5 * 60 * 1000);

    this.timeoutMap.set(email, timeout);

    console.log('Saved postcode in memory:', postcode);
    return { message: 'Postcode saved temporarily', postcode };
  }

  async checkPostcode(email: string, postcode: string) {
    const saved = this.postcodeMap.get(email);

    if (!saved) {
      throw new UnauthorizedException('No postcode found or it has expired');
    }

    if (saved !== postcode) {
      throw new UnauthorizedException('Invalid postcode');
    }


    this.postcodeMap.delete(email);
    if (this.timeoutMap.has(email)) {
      clearTimeout(this.timeoutMap.get(email));
      this.timeoutMap.delete(email);
    }

    return { message: 'Postcode verified successfully' };
  }

  async AdminLogin(credentials) {

    const { email, password } = credentials;

    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) throw new UnauthorizedException("User not found");

    const { accessToken, refreshToken } = await this.generateToken(user.id);

    const hashedRefreshToken = await hash(refreshToken);

    await this.userService.updateHashedRefreshToken(user.id, hashedRefreshToken);

    if (!user.id) throw new Error("User ID không tồn tại");

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) throw new Error("Mật khẩu sai");


    return {
      user: {
        id: user.id,
        name: user.username || null,
        role: user.role
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

}