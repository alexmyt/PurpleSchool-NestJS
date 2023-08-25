import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { isObjectIdOrHexString } from 'mongoose';

import { AbilitySubjectHook } from '../../lib/casl/casl.interface';

import { ReservationModel } from './reservation.model';
import { ReservationsService } from './reservations.service';

const BAD_OBJECTID_TYPE = 'Parameter :id must be a string of 24 hex characters';

@Injectable()
export class ReservationsSubjectHook implements AbilitySubjectHook<ReservationModel> {
  constructor(private reservationsService: ReservationsService) {}

  async run(request: Request): Promise<ReservationModel | null> {
    const { id } = request.params;

    if (!isObjectIdOrHexString(id)) {
      throw new BadRequestException(BAD_OBJECTID_TYPE);
    }

    return this.reservationsService.findOneById(id);
  }
}
