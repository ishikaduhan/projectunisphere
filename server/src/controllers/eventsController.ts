import { Request, Response, NextFunction } from 'express';
import {
  approveEvent,
  createEvent,
  deleteEvent,
  getEventAnalytics,
  getEventById,
  getEvents,
  submitEventForApproval,
  updateEvent,
} from '../services/eventService';
import { AppError } from '../middlewares/errorHandler';

/**
 * Create a new event.
 */
export const createEventHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const event = await createEvent(req.body, userId);
    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
};

/**
 * List events with search and filter support.
 */
export const listEventsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      clubId,
      status,
      startDate,
      endDate,
      locationMode,
      search,
      page,
      limit,
    } = req.query;

    const rawTags = req.query.tags;
    const tags =
      typeof rawTags === 'string'
        ? rawTags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : Array.isArray(rawTags)
        ? rawTags.map((tag) => String(tag).trim()).filter(Boolean)
        : undefined;

    const result = await getEvents(
      {
        clubId: clubId as string,
        status: status as 'draft' | 'pending' | 'approved' | 'rejected',
        startDate: startDate as string,
        endDate: endDate as string,
        tags,
        locationMode: locationMode as 'offline' | 'online' | 'hybrid',
        search: search as string,
      },
      Number(page) || 1,
      Number(limit) || 20
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific event by ID.
 */
export const getEventHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.id;
    const event = await getEventById(eventId);
    if (!event) {
      const err: AppError = new Error('Event not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }
    res.status(200).json({ event });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event details.
 */
export const updateEventHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.id;
    const event = await updateEvent(eventId, req.body);
    if (!event) {
      const err: AppError = new Error('Event not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }
    res.status(200).json({ event });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an event.
 */
export const deleteEventHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.id;
    const event = await deleteEvent(eventId);
    if (!event) {
      const err: AppError = new Error('Event not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit an event for approval.
 */
export const submitEventForApprovalHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.id;
    if (!userId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const event = await submitEventForApproval(eventId);
    if (!event) {
      const err: AppError = new Error('Event not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }
    res.status(200).json({ event });
  } catch (error) {
    next(error);
  }
};

export const approveEventHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.id;
    const reviewerId = req.user?.id;
    if (!reviewerId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const { status, feedback } = req.body;
    const event = await approveEvent(eventId, reviewerId, status, feedback);
    if (!event) {
      const err: AppError = new Error('Event not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }
    res.status(200).json({ event });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics summary for events.
 */
export const analyticsEventHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clubId, status, startDate, endDate, locationMode } = req.query;
    const stats = await getEventAnalytics({
      clubId: clubId as string,
      status: status as 'draft' | 'pending' | 'approved' | 'rejected',
      startDate: startDate as string,
      endDate: endDate as string,
      locationMode: locationMode as 'offline' | 'online' | 'hybrid',
    });
    res.status(200).json({ analytics: stats });
  } catch (error) {
    next(error);
  }
};
