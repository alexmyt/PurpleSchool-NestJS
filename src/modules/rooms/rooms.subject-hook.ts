import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AbilitySubjectHook } from '../../lib/casl/casl.interface';

import { RoomModel } from './room.model';
import { RoomsService } from './rooms.service';

@Injectable()
export class RoomsSubjectHook implements AbilitySubjectHook<RoomModel> {
  constructor(private roomsService: RoomsService) {}

  async run(request: Request): Promise<RoomModel | null> {
    const { id } = request.params;
    return this.roomsService.findOneById(id);
  }
}
