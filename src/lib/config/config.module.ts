import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';

import { app, storage, jwt, mongodb } from './configs';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [`${process.cwd()}/.${process.env.NODE_ENV}.env`, '.env'],
      isGlobal: true,
      expandVariables: true,
      load: [app, storage, jwt, mongodb],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
