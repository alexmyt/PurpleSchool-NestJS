export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface AccessTokenPayload {
  role: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RefreshTokenPayload {}
