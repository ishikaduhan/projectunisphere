"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashQrToken = exports.verifyQrToken = exports.generateQrToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const QR_SECRET = process.env.QR_SECRET || 'default_qr_secret_unisphere';
const QR_TOKEN_EXPIRATION = '7d';
const generateQrToken = (registrationId, eventId, userId, version) => {
    const payload = {
        registrationId,
        eventId,
        userId,
        version,
    };
    return jsonwebtoken_1.default.sign(payload, QR_SECRET, {
        expiresIn: QR_TOKEN_EXPIRATION,
    });
};
exports.generateQrToken = generateQrToken;
const verifyQrToken = (token) => {
    return jsonwebtoken_1.default.verify(token, QR_SECRET);
};
exports.verifyQrToken = verifyQrToken;
const hashQrToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashQrToken = hashQrToken;
