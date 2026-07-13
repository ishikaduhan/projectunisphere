import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';
import { AppError } from './errorHandler';

// Extend Express Request interface to include the user object
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: string[];
      };
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err: AppError = new Error('Access token is missing or malformed');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      roles: decoded.roles,
    };
    next();
  } catch (error: any) {
    const err: AppError = new Error(
      error.name === 'TokenExpiredError' ? 'Access token has expired' : 'Invalid access token'
    );
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    next(err);
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const err: AppError = new Error('User not authenticated');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      const err: AppError = new Error('You do not have permission to access this resource');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      return next(err);
    }

    next();
  };
};
