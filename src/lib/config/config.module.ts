import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';

import { app, storage, jwt, mongodb, telegram, redis, mail } from './configs';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [`${process.cwd()}/.${process.env.NODE_ENV}.env`, '.env'],
      isGlobal: true,
      expandVariables: true,
      load: [app, storage, jwt, mongodb, telegram, mail, redis],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
