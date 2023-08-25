import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { isObjectIdOrHexString } from 'mongoose';

import { AbilitySubjectHook } from '../../lib/casl/casl.interface';

import { UserModel } from './user.model';
import { UsersService } from './users.service';
import { BAD_OBJECTID_TYPE } from './users.constants';

@Injectable()
export class UsersSubjectHook implements AbilitySubjectHook<UserModel> {
  constructor(private usersService: UsersService) {}

  async run(request: Request): Promise<UserModel | null> {
    const { id } = request.params;

    if (!isObjectIdOrHexString(id)) {
      throw new BadRequestException(BAD_OBJECTID_TYPE);
    }

    return this.usersService.findOneById(id);
  }
}
