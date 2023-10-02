import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { IConfig } from './config/config.interface';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<IConfig>) => ({
        uri: configService.getOrThrow<string>('mongodb.uri', { infer: true }),
        dbName: configService.get('mongodb.dbName', { infer: true }),
        user: configService.get('mongodb.user', { infer: true }),
        pass: configService.get('mongodb.pass', { infer: true }),
        lazyConnection: true,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class OrmModule {}
