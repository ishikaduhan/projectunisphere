import jwt from 'jsonwebtoken';

export interface JWTPayload {
  sub: string;
  roles: string[];
  jti?: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default_access_secret_key';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key';

export const signAccessToken = (userId: string, roles: string[]): string => {
  const payload: JWTPayload = {
    sub: userId,
    roles,
  };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
};

export const signRefreshToken = (userId: string, roles: string[], jti: string): string => {
  const payload: JWTPayload = {
    sub: userId,
    roles,
    jti,
  };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, REFRESH_SECRET) as JWTPayload;
};
