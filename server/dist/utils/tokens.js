"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default_access_secret_key';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key';
const signAccessToken = (userId, roles) => {
    const payload = {
        sub: userId,
        roles,
    };
    return jsonwebtoken_1.default.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = (userId, roles, jti) => {
    const payload = {
        sub: userId,
        roles,
        jti,
    };
    return jsonwebtoken_1.default.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
};
exports.signRefreshToken = signRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
