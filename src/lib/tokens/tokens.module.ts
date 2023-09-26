import { Module } from '@nestjs/common';

import { NestJwtModule } from '../jwt.module';

import { TokensService } from './tokens.service';

@Module({
  imports: [NestJwtModule],
  providers: [TokensService],
  exports: [TokensService, NestJwtModule],
})
export class TokensModule {}
