"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const mongoose_1 = require("mongoose");
const RefreshTokenSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.RefreshToken = (0, mongoose_1.model)('RefreshToken', RefreshTokenSchema);
