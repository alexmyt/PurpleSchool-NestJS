import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AbilitySubjectHook } from '../../lib/casl/casl.interface';

import { UserModel } from './user.model';
import { UsersService } from './users.service';

@Injectable()
export class UsersSubjectHook implements AbilitySubjectHook<UserModel> {
  constructor(private usersService: UsersService) {}

  async run(request: Request): Promise<UserModel | null> {
    const { id } = request.params;
    return this.usersService.findOneById(id);
  }
}
