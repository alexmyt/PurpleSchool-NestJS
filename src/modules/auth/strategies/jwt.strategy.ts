import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokensService } from '../../../lib/tokens/tokens.service';
import { IConfig } from '../../../lib/config/config.interface';
import { AuthenticatedUserInfo, JwtPayload } from '../auth.interface';
import { ERROR_INVALID_TOKEN } from '../auth.constants';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<IConfig>,
    private readonly tokensService: TokensService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('jwt.secret', { infer: true }),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUserInfo> {
    const { jti, sub, role } = payload;

    const isBanned = await this.tokensService.isTokenBanned(jti);
    if (isBanned) {
      throw new ForbiddenException(ERROR_INVALID_TOKEN);
    }

    return {
      id: sub,
      role,
    };
  }
}
