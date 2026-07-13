"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const User_1 = require("../models/User");
const RefreshToken_1 = require("../models/RefreshToken");
const validate_1 = require("../middlewares/validate");
const tokens_1 = require("../utils/tokens");
const router = (0, express_1.Router)();
// Zod schemas for input validation
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.object({
            first: zod_1.z.string().min(1, 'First name is required'),
            last: zod_1.z.string().min(1, 'Last name is required'),
        }),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
        universityId: zod_1.z.string().min(1, 'University ID is required'),
        role: zod_1.z.enum(['student', 'faculty', 'organizer', 'admin']).optional(),
        profile: zod_1.z.object({
            department: zod_1.z.string().min(1, 'Department is required'),
            year: zod_1.z.number().int().positive().optional(),
            interests: zod_1.z.array(zod_1.z.string()).optional(),
        }),
    }),
});
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
const refreshSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().optional(),
    }),
});
const logoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().optional(),
    }),
});
// Helpers to cookie token
const setRefreshCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};
const clearRefreshCookie = (res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
};
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
// 1.1 Register
router.post('/register', (0, validate_1.validate)(registerSchema), async (req, res, next) => {
    try {
        const { name, email, password, universityId, role, profile } = req.body;
        // Check if email already exists
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            const err = new Error('Email already exists');
            err.statusCode = 409;
            err.code = 'CONFLICT';
            return next(err);
        }
        // Check if universityId already exists
        const existingUni = await User_1.User.findOne({ universityId });
        if (existingUni) {
            const err = new Error('University ID already registered');
            err.statusCode = 409;
            err.code = 'CONFLICT';
            return next(err);
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const newUser = new User_1.User({
            universityId,
            name,
            email: email.toLowerCase(),
            passwordHash,
            roles: role ? [role] : ['student'],
            profile: {
                department: profile.department,
                year: profile.year,
                interests: profile.interests || [],
            },
        });
        await newUser.save();
        res.status(201).json({
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                roles: newUser.roles,
                status: newUser.status,
                createdAt: newUser.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// 1.2 Login
router.post('/login', (0, validate_1.validate)(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user || user.status === 'deleted') {
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        if (user.status === 'suspended') {
            const err = new Error('Your account has been suspended');
            err.statusCode = 403;
            err.code = 'FORBIDDEN';
            return next(err);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        // Issue tokens
        const accessToken = (0, tokens_1.signAccessToken)(user._id.toString(), user.roles);
        const jti = crypto_1.default.randomUUID();
        const rawRefreshToken = (0, tokens_1.signRefreshToken)(user._id.toString(), user.roles, jti);
        const refreshTokenHash = hashToken(rawRefreshToken);
        // Save refresh token record
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const ip = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const tokenRecord = new RefreshToken_1.RefreshToken({
            userId: user._id,
            tokenId: jti,
            tokenHash: refreshTokenHash,
            expiresAt,
            device: {
                ip,
                userAgent,
            },
        });
        await tokenRecord.save();
        setRefreshCookie(res, rawRefreshToken);
        res.status(200).json({
            accessToken,
            refreshToken: rawRefreshToken,
            expiresIn: 900, // 15 minutes (in seconds)
            user: {
                id: user._id,
                roles: user.roles,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// 1.3 Refresh Token
router.post('/refresh', (0, validate_1.validate)(refreshSchema), async (req, res, next) => {
    try {
        const tokenFromCookie = req.cookies?.refreshToken;
        const tokenFromBody = req.body.refreshToken;
        const rawToken = tokenFromCookie || tokenFromBody;
        if (!rawToken) {
            const err = new Error('Refresh token is required');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            return next(err);
        }
        let decoded;
        try {
            decoded = (0, tokens_1.verifyRefreshToken)(rawToken);
        }
        catch (e) {
            const err = new Error('Invalid refresh token');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const tokenHash = hashToken(rawToken);
        const tokenRecord = await RefreshToken_1.RefreshToken.findOne({ tokenId: decoded.jti });
        if (!tokenRecord || tokenRecord.tokenHash !== tokenHash) {
            const err = new Error('Refresh token not found or invalid');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        // Check if token was previously revoked (Refresh Token Reuse Detection)
        if (tokenRecord.revokedAt) {
            console.warn(`[WARNING] Revoked refresh token reuse detected for user: ${decoded.sub}. Revoking all sessions.`);
            // Revoke all tokens for this user as a security measure
            await RefreshToken_1.RefreshToken.updateMany({ userId: tokenRecord.userId }, { revokedAt: new Date() });
            clearRefreshCookie(res);
            const err = new Error('Session compromised. Please login again.');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        if (new Date() > tokenRecord.expiresAt) {
            const err = new Error('Refresh token has expired');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        // Refresh Token Rotation (RTR)
        const newJti = crypto_1.default.randomUUID();
        const newAccessToken = (0, tokens_1.signAccessToken)(decoded.sub, decoded.roles);
        const newRawRefreshToken = (0, tokens_1.signRefreshToken)(decoded.sub, decoded.roles, newJti);
        const newRefreshTokenHash = hashToken(newRawRefreshToken);
        // Revoke old token
        tokenRecord.revokedAt = new Date();
        tokenRecord.replacedByTokenId = newJti;
        await tokenRecord.save();
        // Save new token
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 7);
        const ip = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const newTokenRecord = new RefreshToken_1.RefreshToken({
            userId: tokenRecord.userId,
            tokenId: newJti,
            tokenHash: newRefreshTokenHash,
            expiresAt: newExpiresAt,
            device: {
                ip,
                userAgent,
            },
        });
        await newTokenRecord.save();
        setRefreshCookie(res, newRawRefreshToken);
        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRawRefreshToken,
            expiresIn: 900,
        });
    }
    catch (error) {
        next(error);
    }
});
// 1.4 Logout
router.post('/logout', (0, validate_1.validate)(logoutSchema), async (req, res, next) => {
    try {
        const tokenFromCookie = req.cookies?.refreshToken;
        const tokenFromBody = req.body.refreshToken;
        const rawToken = tokenFromCookie || tokenFromBody;
        if (rawToken) {
            let decoded;
            try {
                decoded = (0, tokens_1.verifyRefreshToken)(rawToken);
                const tokenHash = hashToken(rawToken);
                await RefreshToken_1.RefreshToken.findOneAndUpdate({ tokenId: decoded.jti, tokenHash }, { revokedAt: new Date() });
            }
            catch (e) {
                // Skip token error, just clear cookie
            }
        }
        clearRefreshCookie(res);
        res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
