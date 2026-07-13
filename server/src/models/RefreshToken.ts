import { Schema, model, Document, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  tokenId: string;
  tokenHash: string;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByTokenId?: string;
  device?: {
    userAgent?: string;
    ip?: string;
    lastSeenAt?: Date;
  };
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tokenId: {
    type: String,
    required: true,
    unique: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  issuedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  revokedAt: {
    type: Date,
  },
  replacedByTokenId: {
    type: String,
  },
  device: {
    userAgent: String,
    ip: String,
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
});

// Indexes
RefreshTokenSchema.index({ userId: 1, expiresAt: 1 });
RefreshTokenSchema.index({ tokenId: 1 }, { unique: true });

// TTL Index to auto-expire tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
