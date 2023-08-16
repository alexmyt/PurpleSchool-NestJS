import { resolve } from 'path';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigService } from '@nestjs/config';

import { RoomsModule } from './modules/rooms/rooms.module';
import { ConfigModule } from './lib/config/config.module';
import { OrmModule } from './lib/orm.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CaslModule } from './lib/casl/casl.module';
import { IConfig } from './lib/config/config.interface';
import { PinoLoggerModule } from './lib/pino.module';

@Module({
  imports: [
    ConfigModule,
    PinoLoggerModule,
    OrmModule,
    AuthModule,
    UsersModule,
    RoomsModule,
    ReservationsModule,
    CaslModule,
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IConfig>) => {
        const uploadDir = configService.getOrThrow('storage.local.uploadDir', { infer: true });
        const serveRoot = configService.get('storage.local.serveRoot', { infer: true });
        return [{ rootPath: resolve(uploadDir), serveRoot }];
      },
    }),
  ],
  providers: [],
})
export class AppModule {}
