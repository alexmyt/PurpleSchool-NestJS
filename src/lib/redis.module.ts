import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '@songkeys/nestjs-redis';

import { IConfig } from './config/config.interface';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: async (configService: ConfigService<IConfig>) => ({
        config: {
          host: configService.get('redis.host', { infer: true }),
          port: configService.get('redis.port', { infer: true }),
          maxRetriesPerRequest: null,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export default class NestRedisModule {}
