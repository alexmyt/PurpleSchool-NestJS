import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { HelperService } from '../../common/helper.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserModel, UserModelDocument } from './user.model';
import * as UsersConstants from './users.constants';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(UserModel.name) private userModel: Model<UserModel>) {}

  async create(createUserDto: CreateUserDto): Promise<UserModelDocument> {
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException(UsersConstants.USER_ALREADY_REGISTERED);
    }

    const { password, ...restDto } = createUserDto;
    const hashedPassword = await HelperService.hashPassword(password);

    return this.userModel.create({ ...restDto, hashedPassword });
  }

  findAll(): Promise<UserModel[]> {
    return this.userModel
      .find({ $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] })
      .lean()
      .exec();
  }

  findOneByEmail(email: string): Promise<UserModelDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  findOneById(id: string): Promise<UserModelDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserModel> {
    const existingUser = await this.findOneById(id);
    if (!existingUser) {
      throw new NotFoundException(UsersConstants.USER_NOT_FOUND);
    }

    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { returnDocument: 'after' })
      .lean()
      .exec();
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<UserModel> {
    const existingUser = await this.findOneById(id);
    if (!existingUser) {
      throw new NotFoundException(UsersConstants.USER_NOT_FOUND);
    }

    const isOldPasswordRight = await HelperService.verifyPassword(
      updatePasswordDto.oldPassword,
      existingUser.hashedPassword,
    );
    if (!isOldPasswordRight) {
      throw new UnauthorizedException(UsersConstants.USER_LOGIN_FAILED);
    }

    const hashedPassword = await HelperService.hashPassword(updatePasswordDto.password);
    return this.userModel.findByIdAndUpdate(id, { hashedPassword }).lean().exec();
  }

  async softRemove(id: string): Promise<UserModel> {
    const result = await this.userModel
      .findByIdAndUpdate(id, { isDeleted: true }, { returnDocument: 'after' })
      .lean()
      .exec();

    if (!result) {
      throw new NotFoundException(UsersConstants.USER_NOT_FOUND);
    }

    return result;
  }

  remove(id: string): Promise<UserModel> {
    return this.userModel.findByIdAndDelete(id, { lean: true });
  }
}
