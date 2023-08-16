import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { isObjectIdOrHexString } from 'mongoose';

import { AbilitySubjectHook } from '../../lib/casl/casl.interface';

import { RoomModel } from './room.model';
import { RoomsService } from './rooms.service';
import { BAD_OBJECTID_TYPE } from './rooms.constants';

@Injectable()
export class RoomsSubjectHook implements AbilitySubjectHook<RoomModel> {
  constructor(private roomsService: RoomsService) {}

  async run(request: Request): Promise<RoomModel | null> {
    const { id } = request.params;

    if (!isObjectIdOrHexString(id)) {
      throw new BadRequestException(BAD_OBJECTID_TYPE);
    }

    return this.roomsService.findOneById(id);
  }
}
