import { resolve } from 'path';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigService } from '@nestjs/config';

import { BullMQModule } from './lib/bullmq.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { ConfigModule } from './lib/config/config.module';
import { OrmModule } from './lib/orm.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CaslModule } from './lib/casl/casl.module';
import { IConfig } from './lib/config/config.interface';
import { PinoLoggerModule } from './lib/pino.module';
import { NotificationsModule } from './lib/notifications/notifications.module';

@Module({
  imports: [
    BullMQModule,
    ConfigModule,
    PinoLoggerModule,
    OrmModule,
    AuthModule,
    UsersModule,
    NotificationsModule,
    RoomsModule,
    ReservationsModule,
    CaslModule,
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IConfig>) => {
        const uploadDir = configService.getOrThrow('storage.local.uploadDir', { infer: true });
        return [{ rootPath: resolve(uploadDir) }];
      },
    }),
  ],
  providers: [],
})
export class AppModule {}
