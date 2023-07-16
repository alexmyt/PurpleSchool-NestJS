import { Injectable } from '@nestjs/common';
import { InferSubjects, MongoAbility, AbilityBuilder, createMongoAbility } from '@casl/ability';

import { Action, UserRole } from '../../common/permission.enum';
import { UserModel, UserModelDocument } from '../../modules/users/user.model';
import { RoomModel } from '../../modules/rooms/room.model';
import { ReservationModel } from '../../modules/reservations/reservation.model';
import { AuthenticatedUserInfo } from '../../modules/auth/auth.interface';

type AbilitySubject =
  | InferSubjects<typeof UserModel | typeof RoomModel | typeof ReservationModel>
  | 'UserModel'
  | 'RoomModel'
  | 'ReservationModel'
  | 'all';
export type AppAbility = MongoAbility<[Action, AbilitySubject]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthenticatedUserInfo) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.role === UserRole.ADMIN) {
      can(Action.MANAGE, 'all');
    } else {
      can(Action.READ, 'all');

      // User can edit yourself, but not delete
      can<UserModelDocument>(Action.UPDATE, 'UserModel', { _id: user.id });
      cannot(Action.DELETE, 'UserModel');

      // User can edit his rooms
      // TODO: deletion should be more complexity than a simple 'soft deletion' (if the room has an active or paid reservation)
      can<RoomModel>([Action.UPDATE, Action.DELETE], 'RoomModel', { userId: user.id });

      // User cannot edit his reservations
      // TODO: user needs the ability to cancel his reservation only, not to update other props
      can(Action.CREATE, 'ReservationModel');
      can(Action.UPDATE, 'ReservationModel', { userId: user.id });
    }

    return build();
  }
}
