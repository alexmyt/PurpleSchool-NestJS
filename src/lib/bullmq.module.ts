import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { IConfig } from './config/config.interface';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService<IConfig, true>) => ({
        connection: {
          host: configService.get('redis.host', { infer: true }),
          port: configService.get('redis.port', { infer: true }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [BullMQModule],
})
export class BullMQModule {}
