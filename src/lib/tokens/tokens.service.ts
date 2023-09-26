import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthenticatedUserInfo } from '../../modules/auth/auth.interface';
import { IConfig } from '../config/config.interface';

import { AccessTokenPayload, RefreshTokenPayload } from './tokens.interface';

@Injectable()
export class TokensService {
  private refreshTokenExpiresIn: string | number;
  private accessTokenExpiresIn: string | number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<IConfig>,
  ) {
    this.refreshTokenExpiresIn = this.configService.get('jwt.refreshExpire', { infer: true });
    this.accessTokenExpiresIn = this.configService.get('jwt.accessExpire', { infer: true });
  }

  /**
   * Generates a pair of tokens: an access token and a refresh token.
   *
   * @param user - An object containing the user's ID and role.
   * @returns A promise that resolves to an object containing the generated access token and refresh token.
   */
  public async generateTokenPair(user: AuthenticatedUserInfo) {
    const { id, ...jwtPayload } = user;
    const jwtid = this.jwtid();

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(id, jwtPayload, { jwtid }),
      this.generateRefreshToken(id, {}, { jwtid }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Verifies the authenticity and integrity of a token by decoding and verifying its signature.
   *
   * @param token - The token to be verified.
   * @returns The decoded payload of the token.
   * @throws {Error} If the token is invalid or the signature verification fails.
   */
  public async verify<T extends object>(token: string): Promise<T> {
    const payload = await this.jwtService.verifyAsync<T>(token);
    return payload;
  }

  /**
   * Generates an access token for the given subject and payload.
   */
  private async generateAccessToken(
    subject: string,
    payload?: AccessTokenPayload,
    options?: JwtSignOptions,
  ): Promise<string> {
    const jwtSignOptions: JwtSignOptions = {
      subject,
      expiresIn: this.accessTokenExpiresIn,
      jwtid: this.jwtid(),
      ...options,
    };

    return this.jwtService.signAsync(payload, jwtSignOptions);
  }

  /**
   * Generates an refresh token for the given subject and payload.
   */
  private async generateRefreshToken(
    subject: string,
    payload?: RefreshTokenPayload,
    options?: JwtSignOptions,
  ): Promise<string> {
    const jwtSignOptions: JwtSignOptions = {
      subject,
      expiresIn: this.refreshTokenExpiresIn,
      ...options,
    };

    return this.jwtService.sign(payload || {}, jwtSignOptions);
  }

  private jwtid(): string {
    return randomUUID();
  }
}
