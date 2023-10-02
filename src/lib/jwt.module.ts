import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { IConfig } from './config/config.interface';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IConfig>) => ({
        secret: configService.getOrThrow('jwt.secret', { infer: true }),
        signOptions: { expiresIn: configService.getOrThrow('jwt.accessExpire', { infer: true }) },
      }),
    }),
  ],
  exports: [JwtModule],
})
export class NestJwtModule {}
