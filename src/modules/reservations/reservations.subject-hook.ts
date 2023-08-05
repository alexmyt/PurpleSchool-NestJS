import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AbilitySubjectHook } from '../../lib/casl/casl.interface';

import { ReservationModel } from './reservation.model';
import { ReservationsService } from './reservations.service';

@Injectable()
export class ReservationsSubjectHook implements AbilitySubjectHook<ReservationModel> {
  constructor(private reservationsService: ReservationsService) {}

  async run(request: Request): Promise<ReservationModel | null> {
    const { id } = request.params;
    return this.reservationsService.findOneById(id);
  }
}
