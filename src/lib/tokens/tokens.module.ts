import { Module } from '@nestjs/common';

import { NestJwtModule } from '../jwt.module';

import { TokensService } from './tokens.service';
import { TokensRepository } from './tokens.repository';

@Module({
  imports: [NestJwtModule],
  providers: [TokensService, TokensRepository],
  exports: [TokensService, TokensRepository, NestJwtModule],
})
export class TokensModule {}
