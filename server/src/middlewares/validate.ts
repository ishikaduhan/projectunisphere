import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './errorHandler';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => {
          // err.path starts with 'body', 'query', or 'params', let's format path nicely
          const field = err.path.length > 1 ? err.path.slice(1).join('.') : err.path[0];
          return {
            field: String(field),
            issue: err.message,
          };
        });
        
        const valError: AppError = new Error('Invalid request payload');
        valError.statusCode = 400;
        valError.code = 'VALIDATION_ERROR';
        valError.details = details;
        next(valError);
      } else {
        next(error);
      }
    }
  };
};
