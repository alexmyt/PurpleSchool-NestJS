import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { RoomsModule } from '../rooms/rooms.module';
import { UsersModule } from '../users/users.module';

import { ReservationsController } from './reservations.controller';
import { ReservationModel, ReservationModelSchema } from './reservation.model';
import { ReservationsService } from './reservations.service';
import { ReservationsSubjectHook } from './reservations.subject-hook';
import { ReservationCreatedListener } from './listeners/reservation-created.listener';
import { ReservationCanceledListener } from './listeners/reservation-canceled.listener';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    RoomsModule,
    UsersModule,
    MongooseModule.forFeature([
      {
        name: ReservationModel.name,
        schema: ReservationModelSchema,
        collection: 'reservations',
      },
    ]),
  ],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    ReservationsSubjectHook,
    ReservationCreatedListener,
    ReservationCanceledListener,
  ],
})
export class ReservationsModule {}
