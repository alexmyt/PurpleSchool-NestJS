import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Action, UserRole } from '../../common/permission.enum';
import { CheckAbility } from '../../lib/casl/policies.decorator';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { GetUserDto } from './dto/get-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { USER_NOT_FOUND } from './users.constants';
import { UserModel } from './user.model';
import { UsersSubjectHook } from './users.subject-hook';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.create({ ...registerUserDto, role: UserRole.USER });
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @CheckAbility(UserModel, UsersSubjectHook, Action.READ)
  async findOneById(@Param() { id }: GetUserDto) {
    const result = await this.usersService.findOneById(id);

    if (!result) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return result;
  }

  @Patch(':id')
  @CheckAbility(UserModel, UsersSubjectHook, Action.UPDATE)
  update(@Param() { id }: GetUserDto, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  @CheckAbility(UserModel, UsersSubjectHook, Action.UPDATE)
  updatePassword(@Param() { id }: GetUserDto, @Body() updateUserDto: UpdatePasswordDto) {
    return this.usersService.updatePassword(id, updateUserDto);
  }

  @Delete(':id')
  @CheckAbility(UserModel, UsersSubjectHook, Action.DELETE)
  softRemove(@Param() { id }: GetUserDto) {
    return this.usersService.softRemove(id);
  }
}
