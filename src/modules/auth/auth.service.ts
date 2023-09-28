import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HelperService } from '../../common/helper.service';
import { IConfig } from '../../lib/config/config.interface';
import { UserModelDocument } from '../users/user.model';
import { UsersService } from '../users/users.service';
import { TokensService } from '../../lib/tokens/tokens.service';

import { AuthResponse, AuthenticatedUserInfo, JwtPayload } from './auth.interface';
import { ERROR_INVALID_TOKEN, ERROR_LOGIN_FAILED } from './auth.constants';

@Injectable()
export class AuthService {
  private readonly refreshTokenExpiresIn: string | number;
  private readonly accessTokenExpiresIn: string | number;

  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService<IConfig>,
  ) {
    this.refreshTokenExpiresIn = this.configService.get('jwt.refreshExpire', { infer: true });
    this.accessTokenExpiresIn = this.configService.get('jwt.accessExpire', { infer: true });
  }

  /**
   * Authenticates a user by checking their email and password.
   *
   * @param email - The email of the user trying to login.
   * @param password - The password of the user trying to login.
   * @returns A promise that resolves to an AuthResponse object containing the access token, refresh token, and user information.
   * @throws UnauthorizedException if the user is not found or the password is invalid.
   */
  public async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException(ERROR_LOGIN_FAILED);
    }

    const isPasswordValid = await HelperService.verifyPassword(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_LOGIN_FAILED);
    }

    const authUserInfo = this.getAuthUserInfo(user);

    const { accessToken, refreshToken } = await this.tokensService.generateTokenPair(authUserInfo);

    return { accessToken, refreshToken, user: authUserInfo };
  }

  /**
   * Refreshes the access and refresh tokens for an authenticated user.
   *
   * @param incomingRefreshToken - The refresh token used to generate new access and refresh tokens.
   * @returns A promise that resolves to an object containing the new access token, new refresh token, and the user information.
   */
  public async refreshTokens(incomingRefreshToken: string): Promise<AuthResponse> {
    const { jti, exp, sub } = await this.tokensService.verify<JwtPayload>(incomingRefreshToken);

    const tokenIsBanned = await this.tokensService.isTokenBanned(jti);
    if (tokenIsBanned) {
      throw new ForbiddenException(ERROR_INVALID_TOKEN);
    }

    await this.tokensService.banToken(jti, exp);

    const userFromToken = await this.usersService.findOneById(sub);
    if (!userFromToken) {
      throw new UnauthorizedException(ERROR_LOGIN_FAILED);
    }

    const authUserInfo = this.getAuthUserInfo(userFromToken);

    const { accessToken, refreshToken } = await this.tokensService.generateTokenPair(authUserInfo);

    return { accessToken, refreshToken, user: authUserInfo };
  }

  private getAuthUserInfo(user: UserModelDocument): AuthenticatedUserInfo {
    return {
      id: user._id.toHexString(),
      role: user.role,
    };
  }
}
