import { Request } from 'express';
import { AnyClass } from '@casl/ability/dist/types/types';

import { UserModel } from '../../modules/users/user.model';
import { RoomModel } from '../../modules/rooms/room.model';
import { ReservationModel } from '../../modules/reservations/reservation.model';
import { Action } from '../../common/permission.enum';

export type AbilitySubjects = UserModel | RoomModel | ReservationModel;

export interface AbilityConfig {
  subjectClass: AnyClass<AbilitySubjects>;
  subjectHookClass: AnyClass<AbilitySubjectHook<AbilitySubjects>>;
  action: Action;
}

export interface AbilitySubjectHook<Subject = AbilitySubjects> {
  run: (request: Request) => Promise<Subject | null>;
}
