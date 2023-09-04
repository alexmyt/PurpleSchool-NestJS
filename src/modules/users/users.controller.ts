import { Get, Post, Body, Patch, Delete, NotFoundException } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Action, UserRole } from '../../common/permission.enum';
import { CheckAbility } from '../../lib/casl/policies.decorator';
import { GenericController } from '../../common/decorators/controller.decorator';
import { MongoIdParam } from '../../common/decorators/mongo-id.decorator';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { USER_NOT_FOUND } from './users.constants';
import { UserModel } from './user.model';
import { UsersSubjectHook } from './users.subject-hook';
import { UserResponseDto } from './dto/user.response';

@GenericController('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ type: UserResponseDto })
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.create({ ...registerUserDto, role: UserRole.USER });
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user, for admins only' })
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get list of users. For admins only' })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  findAll(): Promise<UserModel[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @CheckAbility(UserModel, UsersSubjectHook, Action.READ)
  @ApiOperation({ summary: 'Get user' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: USER_NOT_FOUND })
  async findOneById(@MongoIdParam('id') id: string) {
    const result = await this.usersService.findOneById(id);

    if (!result) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return result;
  }

  @Patch(':id')
  @CheckAbility(UserModel, UsersSubjectHook, Action.UPDATE)
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: USER_NOT_FOUND })
  update(@MongoIdParam('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  @CheckAbility(UserModel, UsersSubjectHook, Action.UPDATE)
  @ApiOperation({ summary: 'Change password' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: USER_NOT_FOUND })
  updatePassword(@MongoIdParam('id') id: string, @Body() updateUserDto: UpdatePasswordDto) {
    return this.usersService.updatePassword(id, updateUserDto);
  }

  @Delete(':id')
  @CheckAbility(UserModel, UsersSubjectHook, Action.DELETE)
  @ApiOperation({ summary: 'Mark user as deleted' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: USER_NOT_FOUND })
  softRemove(@MongoIdParam('id') id: string) {
    return this.usersService.softRemove(id);
  }
}
