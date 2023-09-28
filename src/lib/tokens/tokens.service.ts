import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { RedisService } from '@songkeys/nestjs-redis';

import { AuthenticatedUserInfo } from '../../modules/auth/auth.interface';
import { IConfig } from '../config/config.interface';

import { AccessTokenPayload, RefreshTokenPayload } from './tokens.interface';

@Injectable()
export class TokensService {
  private refreshTokenExpiresIn: string | number;
  private accessTokenExpiresIn: string | number;
  private redis: Redis;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<IConfig>,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();
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
   * Checks if a token with a specific identifier (jti) has been banned.
   *
   * @param jti - The identifier of the token to check if it has been banned.
   * @returns A Promise that resolves to a boolean value indicating if the token has been banned (true) or not (false).
   */
  public async isTokenBanned(jti: string): Promise<boolean> {
    const bannedKey = this.getBannedKey(jti);
    const isBanned = await this.redis.exists(bannedKey);
    return isBanned > 0;
  }

  /**
   * Bans a token by storing it in a Redis database with an expiration time.
   *
   * @param jti - The identifier of the token to be banned.
   * @param expiresAt - The expiration time of the banned token in seconds since the Unix epoch.
   * @returns None.
   */
  public async banToken(jti: string, expiresAtSeconds: number): Promise<void> {
    const bannedKey = this.getBannedKey(jti);
    await this.redis.set(bannedKey, 'banned', 'EXAT', expiresAtSeconds);
  }

  private getBannedKey(jti: string): string {
    return `jwt.banned.${jti}`;
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
