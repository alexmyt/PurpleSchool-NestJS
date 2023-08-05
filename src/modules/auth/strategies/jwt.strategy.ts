import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IConfig } from '../../../lib/config/config.interface';
import { AuthenticatedUserInfo, JwtPayload } from '../auth.interface';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService<IConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('jwt.secret', { infer: true }),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUserInfo> {
    return {
      id: payload.sub,
      role: payload.role,
    };
  }
}
