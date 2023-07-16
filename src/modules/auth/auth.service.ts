import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { HelperService } from '../../common/helper.service';
import { IConfig } from '../../lib/config/config.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<IConfig>,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await HelperService.verifyPassword(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const jwtSignOptions: JwtSignOptions = {
      expiresIn: this.configService.getOrThrow('jwt.accessExpire', { infer: true }),
      subject: user._id.toHexString(),
    };

    const accessToken = await this.jwtService.signAsync({ role: user.role }, jwtSignOptions);
    return { accessToken, user };
  }
}
