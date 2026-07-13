import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';
import {
  deleteNotification,
  getUserNotifications,
  markNotificationRead,
  markNotificationUnread,
} from '../services/notificationService';

/**
 * List notifications for the authenticated user.
 */
export const listNotificationsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;

    const result = await getUserNotifications(userId, page, limit, status as any);
    res.status(200).json({ ...result, page, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as read for the authenticated user.
 */
export const markNotificationReadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const notificationId = req.params.id;
    const notification = await markNotificationRead(notificationId, userId);

    if (!notification) {
      const err: AppError = new Error('Notification not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }

    res.status(200).json({ notification });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as unread for the authenticated user.
 */
export const markNotificationUnreadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const notificationId = req.params.id;
    const notification = await markNotificationUnread(notificationId, userId);

    if (!notification) {
      const err: AppError = new Error('Notification not found or cannot be marked unread');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }

    res.status(200).json({ notification });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification for the authenticated user.
 */
export const deleteNotificationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const notificationId = req.params.id;
    const deleted = await deleteNotification(notificationId, userId);

    if (!deleted) {
      const err: AppError = new Error('Notification not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
