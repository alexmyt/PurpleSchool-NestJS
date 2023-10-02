import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from '@songkeys/nestjs-redis';

import { JwtPayload } from './tokens.interface';

@Injectable()
export class TokensRepository {
  private readonly redis: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getClient();
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

  /**
   * Saves a refresh session in a Redis database.
   *
   * @param jwt - The JWT payload containing the subject (`sub`), JWT ID (`jti`), and expiration time (`exp`).
   * @param sessionData - An object containing additional session data. Default is an empty object.
   */
  public async saveRefreshSession(
    { sub, jti, exp }: Pick<JwtPayload, 'sub' | 'jti' | 'exp'>,
    sessionData: Record<string, unknown> = {},
  ): Promise<void> {
    const sessionKey = this.getRefreshSessionKey(sub, jti);
    await this.redis.set(sessionKey, JSON.stringify(sessionData), 'EXAT', exp);
  }

  /**
   * Retrieves the refresh session data from a Redis database based on the provided JWT payload.
   *
   * @param sub - The subject of the JWT payload.
   * @param jti - The JWT ID of the refresh session.
   * @returns The refresh session data as an object, or `null` if the session does not exist.
   */
  public async getRefreshSession(
    sub: string,
    jti: string,
  ): Promise<Record<string, unknown> | null> {
    const sessionKey = this.getRefreshSessionKey(sub, jti);
    const sessionData = await this.redis.get(sessionKey);

    return sessionData ? JSON.parse(sessionData) : null;
  }

  /**
   * Deletes a refresh session from a Redis database.
   *
   * @param sub - The subject of the refresh session.
   * @param jti - The JWT ID of the refresh session.
   * @returns A Promise that resolves to void.
   */
  public async deleteRefreshSession(sub: string, jti: string): Promise<void> {
    const sessionKey = this.getRefreshSessionKey(sub, jti);
    await this.redis.del(sessionKey);
  }

  private getBannedKey(jti: string): string {
    return `jwt.banned.${jti}`;
  }

  private getRefreshSessionKey(userId: string, jti: string): string {
    return `user:${userId}:jti:${jti}`;
  }
}
