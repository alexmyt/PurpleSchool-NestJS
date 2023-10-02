import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { PoliciesGuard } from '../../lib/casl/policies.guard';
import { TokensModule } from '../../lib/tokens/tokens.module';
import { TokensService } from '../../lib/tokens/tokens.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [UsersModule, PassportModule, TokensModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokensService,
    JwtAuthStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PoliciesGuard },
  ],
})
export class AuthModule {}
