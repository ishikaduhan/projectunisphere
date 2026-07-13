import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const details = err.details || undefined;
  
  // Generate request ID for correlation and tracking
  const requestId = (req.headers['x-request-id'] as string) || `req_${crypto.randomBytes(8).toString('hex')}`;
  
  // Log error (redacted logs in production)
  console.error(`[Error] Request ID: ${requestId} | Code: ${errorCode} | Status: ${statusCode} | Message: ${message}`);
  if (statusCode === 500 && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : message,
      details,
      requestId,
    },
  });
};
