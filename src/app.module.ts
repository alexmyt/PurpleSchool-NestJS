import { Module } from '@nestjs/common';

import { RoomsModule } from './modules/rooms/rooms.module';
import { ConfigModule } from './lib/config/config.module';
import { OrmModule } from './lib/orm.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CaslModule } from './lib/casl/casl.module';

@Module({
  imports: [
    ConfigModule,
    OrmModule,
    AuthModule,
    UsersModule,
    RoomsModule,
    ReservationsModule,
    CaslModule,
  ],
  providers: [],
})
export class AppModule {}
