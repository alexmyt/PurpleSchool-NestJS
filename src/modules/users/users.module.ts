import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserModel, UserModelSchema } from './user.model';
import { UsersSubjectHook } from './users.subject-hook';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserModelSchema, collection: 'users' },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersSubjectHook],
  exports: [UsersService],
})
export class UsersModule {}
