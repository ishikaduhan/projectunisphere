import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { User, IUser } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { validate } from '../middlewares/validate';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens';
import { AppError } from '../middlewares/errorHandler';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// Zod schemas for input validation
const registerSchema = z.object({
  body: z.object({
    name: z.object({
      first: z.string().min(1, 'First name is required'),
      last: z.string().min(1, 'Last name is required'),
    }),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    universityId: z.string().min(1, 'University ID is required'),
    role: z.enum(['student', 'faculty', 'organizer', 'admin']).optional(),
    profile: z.object({
      department: z.string().min(1, 'Department is required'),
      year: z.number().int().positive().optional(),
      interests: z.array(z.string()).optional(),
    }),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

// Helpers to cookie token
const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// 1.1 Register
router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, universityId, role, profile } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const err: AppError = new Error('Email already exists');
      err.statusCode = 409;
      err.code = 'CONFLICT';
      return next(err);
    }

    // Check if universityId already exists
    const existingUni = await User.findOne({ universityId });
    if (existingUni) {
      const err: AppError = new Error('University ID already registered');
      err.statusCode = 409;
      err.code = 'CONFLICT';
      return next(err);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
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
  } catch (error) {
    next(error);
  }
});

// 1.2 Login
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.status === 'deleted') {
      const err: AppError = new Error('Invalid credentials');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    if (user.status === 'suspended') {
      const err: AppError = new Error('Your account has been suspended');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      return next(err);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const err: AppError = new Error('Invalid credentials');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    // Issue tokens
    const accessToken = signAccessToken(user._id.toString(), user.roles);
    const jti = crypto.randomUUID();
    const rawRefreshToken = signRefreshToken(user._id.toString(), user.roles, jti);
    const refreshTokenHash = hashToken(rawRefreshToken);

    // Save refresh token record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const tokenRecord = new RefreshToken({
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
  } catch (error) {
    next(error);
  }
});

// 1.3 Refresh Token
router.post('/refresh', validate(refreshSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenFromCookie = req.cookies?.refreshToken;
    const tokenFromBody = req.body.refreshToken;
    const rawToken = tokenFromCookie || tokenFromBody;

    if (!rawToken) {
      const err: AppError = new Error('Refresh token is required');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawToken);
    } catch (e) {
      const err: AppError = new Error('Invalid refresh token');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const tokenHash = hashToken(rawToken);
    const tokenRecord = await RefreshToken.findOne({ tokenId: decoded.jti });

    if (!tokenRecord || tokenRecord.tokenHash !== tokenHash) {
      const err: AppError = new Error('Refresh token not found or invalid');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    // Check if token was previously revoked (Refresh Token Reuse Detection)
    if (tokenRecord.revokedAt) {
      console.warn(`[WARNING] Revoked refresh token reuse detected for user: ${decoded.sub}. Revoking all sessions.`);
      // Revoke all tokens for this user as a security measure
      await RefreshToken.updateMany({ userId: tokenRecord.userId }, { revokedAt: new Date() });
      clearRefreshCookie(res);
      const err: AppError = new Error('Session compromised. Please login again.');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    if (new Date() > tokenRecord.expiresAt) {
      const err: AppError = new Error('Refresh token has expired');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    // Refresh Token Rotation (RTR)
    const newJti = crypto.randomUUID();
    const newAccessToken = signAccessToken(decoded.sub, decoded.roles);
    const newRawRefreshToken = signRefreshToken(decoded.sub, decoded.roles, newJti);
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

    const newTokenRecord = new RefreshToken({
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
  } catch (error) {
    next(error);
  }
});

// 1.4 Logout
router.post('/logout', validate(logoutSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenFromCookie = req.cookies?.refreshToken;
    const tokenFromBody = req.body.refreshToken;
    const rawToken = tokenFromCookie || tokenFromBody;

    if (rawToken) {
      let decoded;
      try {
        decoded = verifyRefreshToken(rawToken);
        const tokenHash = hashToken(rawToken);
        await RefreshToken.findOneAndUpdate(
          { tokenId: decoded.jti, tokenHash },
          { revokedAt: new Date() }
        );
      } catch (e) {
        // Skip token error, just clear cookie
      }
    }

    clearRefreshCookie(res);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
