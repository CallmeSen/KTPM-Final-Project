import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { PaginatedUsers } from 'src/interfaces/pagnition.interface';
import { CreateUserDto } from 'src/modules/users/dto/create-user.input';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.input';

import { User } from 'src/modules/users/entities/user.entity';
import { UserService } from 'src/modules/users/users.service';

@Resolver(() => User)
export class UsersResolver {

  constructor(private readonly usersService: UserService) {}


  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserDto) {
    return this.usersService.createUser(input);
  }

  @Query(() => User, { nullable: true })
  async getUserById(@Args('id', { type: () => ID }) id: string) {
    return await this.usersService.findOneById(id);
  }

  @Mutation(() => User)
  updateUser(@Args('input') input: UpdateUserDto) {
    return this.usersService.updateUser(input);
  }

  @Query(() => PaginatedUsers)
  async getAllUsers(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return await this.usersService.findAll(page, limit);
  }
  
}
