import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RoomsModule } from '../rooms/rooms.module';

import { ReservationsController } from './reservations.controller';
import { ReservationModel, ReservationModelSchema } from './reservation.model';
import { ReservationsService } from './reservations.service';
import { ReservationsSubjectHook } from './reservations.subject-hook';

@Module({
  imports: [
    RoomsModule,
    MongooseModule.forFeature([
      {
        name: ReservationModel.name,
        schema: ReservationModelSchema,
        collection: 'reservations',
      },
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsSubjectHook],
})
export class ReservationsModule {}
