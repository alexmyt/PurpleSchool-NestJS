import { Module } from '@nestjs/common';

import { RoomsModule } from './modules/rooms/rooms.module';
import { ConfigModule } from './lib/config/config.module';
import { OrmModule } from './lib/orm.module';
import { ReservationsModule } from './modules/reservations/reservations.module';

@Module({
  imports: [ConfigModule, OrmModule, RoomsModule, ReservationsModule],
})
export class AppModule {}
