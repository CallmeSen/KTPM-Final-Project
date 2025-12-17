import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UseInterceptors,
} from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/modules/users/entities/user.entity";
import { CreateAuthDto } from "../auth/dto/create-auth.dto";
import { MailService } from "src/mails/mail.service";
import { CreateUserDto } from "src/modules/users/dto/create-user.input";
import { UpdateUserDto } from "src/modules/users/dto/update-user.input";
import { hashPassword } from "src/helpers/util";
import { CartService } from "src/modules/cart/cart.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private mailService: MailService,
    private readonly cartService: CartService,
  ) { }

  async checkEmailExist(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });
    return !!user;
  }

  async createUser(createUserDto: CreateUserDto) {
    if (await this.checkEmailExist(createUserDto.email)) {
      throw new BadRequestException(
        `Email already exists: ${createUserDto.email}`,
      );
    }

    const user = this.userRepo.create({
      ...createUserDto,
      password: await hashPassword(createUserDto.password),
    });

    const savedUser = await this.userRepo.save(user);


    return { id: savedUser.id, username: savedUser.username };
  }

  @UseInterceptors(CacheInterceptor)
  async getUsers(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async getUserById(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }



  async getUserByName(username: string) {
    const user = await this.userRepo.findOne({ where: { username: username } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }


  async updateHashedRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    user.refreshTokens = refreshToken ?? "";

    return this.userRepo.save(user);

  }

  async updateUser(input: UpdateUserDto): Promise<User> {

    const user = await this.userRepo.findOne({ where: { id: input.id } });

    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, input);

    return await this.userRepo.save(user);

  }

  async findByEmail(username: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async deleteUser(userId: string) {

    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) throw new NotFoundException("User not found");

    await this.userRepo.remove(user);

    return { message: "User deleted successfully" };

  }

  async register(registerDto: CreateAuthDto) {

    if (await this.checkEmailExist(registerDto.email)) {

      throw new BadRequestException(

        `Email already exists: ${registerDto.email}`,

      );

    }

    const hashedPassword = await hashPassword(registerDto.password);

    const user = this.userRepo.create({

      username: registerDto.username,

      email: registerDto.email,

      role: registerDto.role,

      password: hashedPassword,

    });


    const createdUser = await this.userRepo.save(user);

    await this.cartService.createCart(createdUser.id);

    return user;

  }

  async updateProfile(

    userId: string,

    updateUser: UpdateUserDto,

  ): Promise<User> {

    const user = await this.userRepo.preload({
      ...updateUser,
    });

    if (!user) throw new NotFoundException("User not found");

    return this.userRepo.save(user);

  }

  async findAll(page: number, limit: number) {

    const [users, total] = await this.userRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users,
      total,
      page,
      limit,
    };

  }

  async findOneById(id: string): Promise<User | null> {
    return await this.userRepo.findOne({ where: { id } });
  }

}


