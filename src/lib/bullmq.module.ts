import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RedisService } from '@songkeys/nestjs-redis';

import NestRedisModule from './redis.module';

@Module({
  imports: [
    NestRedisModule,
    BullModule.forRootAsync({
      useFactory: (redisService: RedisService) => ({
        connection: redisService.getClient(),
        sharedConnection: true,
      }),
      inject: [RedisService],
    }),
  ],
  exports: [BullMQModule],
})
export class BullMQModule {}
