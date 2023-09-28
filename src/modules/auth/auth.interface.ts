export interface AuthenticatedUserInfo {
  id: string;
  role: string;
}

export interface AuthResponse {
  user: AuthenticatedUserInfo;
  accessToken: string;
  refreshToken: string;
}
export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
  role?: string;
}
