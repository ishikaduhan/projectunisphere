import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';
import { cancelRegistration, getUserRegistrations, registerForEvent } from '../services/registrationService';

/**
 * Register the authenticated user for an event.
 */
export const createRegistrationHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const { eventId } = req.body;
    const { registration, qrToken } = await registerForEvent(userId, eventId);
    res.status(201).json({ registration, qrToken });
  } catch (error) {
    next(error);
  }
};

/**
 * List registrations for the authenticated user.
 */
export const listRegistrationsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await getUserRegistrations(userId, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a registration for the authenticated user.
 */
export const cancelRegistrationHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const registrationId = req.params.id;
    const registration = await cancelRegistration(userId, registrationId);
    res.status(200).json({ registration });
  } catch (error) {
    next(error);
  }
};
