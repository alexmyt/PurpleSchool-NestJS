import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { IConfig } from '../config/config.interface';

import { AccessTokenPayload, JwtPayload, RefreshTokenPayload } from './tokens.interface';
import { TokensRepository } from './tokens.repository';

@Injectable()
export class TokensService {
  private refreshTokenExpiresIn: string | number;
  private accessTokenExpiresIn: string | number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<IConfig>,
    private readonly tokensRepository: TokensRepository,
  ) {
    this.refreshTokenExpiresIn = this.configService.get('jwt.refreshExpire', { infer: true });
    this.accessTokenExpiresIn = this.configService.get('jwt.accessExpire', { infer: true });
  }

  /**
   * Checks if a refresh session exists for a given payload.
   *
   * @param sub - The subject of the JWT payload.
   * @param jti - The JWT ID of the refresh session.
   * @returns A boolean indicating whether a refresh session exists for the given payload.
   */
  public async isRefreshSessionExists(sub: string, jti: string): Promise<boolean> {
    const sessionData = await this.tokensRepository.getRefreshSession(sub, jti);

    return !!sessionData;
  }

  /**
   * Delete a refresh session.
   *
   * @param sub - The subject of the JWT payload.
   * @param jti - The JWT ID of the refresh session.
   */
  public async deleteRefreshSession(sub: string, jti: string): Promise<void> {
    await this.tokensRepository.deleteRefreshSession(sub, jti);
  }

  /**
   * Save a refresh session by decoding the refresh token, extracting the payload, and then calling the `saveRefreshSession` method of the `TokensRepository` class.
   *
   * @param refreshToken The refresh token to be saved.
   */
  public async saveRefreshSession(refreshToken: string): Promise<void> {
    const { sub, jti, exp } = this.jwtService.decode(refreshToken, { json: true }) as JwtPayload;
    await this.tokensRepository.saveRefreshSession({ sub, jti, exp });
  }

  /**
   * Delete old refresh session and generate new access and refresh tokens pair
   *
   * @param sub - The subject of the JWT payload.
   * @param oldJti - The JWT ID of the previous refresh session.
   * @param payload - An object containing the token payload
   * @returns A promise that resolves to an object containing the generated access token and refresh token.
   */
  public async refreshTokenPair(sub: string, oldJti: string, payload: AccessTokenPayload) {
    await this.deleteRefreshSession(sub, oldJti);
    return await this.generateTokenPair(sub, payload);
  }

  /**
   * Generates a pair of tokens: an access token and a refresh token.
   *
   * @param sub - The subject of the JWT payload.
   * @param payload - An object containing the token payload
   * @returns A promise that resolves to an object containing the generated access token and refresh token.
   */
  public async generateTokenPair(sub: string, payload: AccessTokenPayload) {
    const jwtid = this.generateJwtId();

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(sub, payload, { jwtid }),
      this.generateRefreshToken(sub, {}, { jwtid }),
    ]);

    await this.saveRefreshSession(refreshToken);

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

  private generateJwtId(): string {
    return randomUUID();
  }
}
