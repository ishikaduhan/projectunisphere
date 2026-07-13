import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';

const QR_SECRET = process.env.QR_SECRET || 'default_qr_secret_unisphere';
const QR_TOKEN_EXPIRATION = '7d';

export interface IQrPayload extends JwtPayload {
  registrationId: string;
  eventId: string;
  userId: string;
  version: number;
}

export const generateQrToken = (
  registrationId: string,
  eventId: string,
  userId: string,
  version: number
): string => {
  const payload: IQrPayload = {
    registrationId,
    eventId,
    userId,
    version,
  };

  return jwt.sign(payload, QR_SECRET, {
    expiresIn: QR_TOKEN_EXPIRATION,
  });
};

export const verifyQrToken = (token: string): IQrPayload => {
  return jwt.verify(token, QR_SECRET) as IQrPayload;
};

export const hashQrToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
