import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';
import { getEventAttendanceReport, markAttendanceWithQrToken } from '../services/attendanceService';

/**
 * Verify a QR token and record attendance for a registered attendee.
 */
export const checkInAttendanceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const scannerId = req.user?.id;

    if (!scannerId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const { qrToken } = req.body;
    const attendance = await markAttendanceWithQrToken(scannerId, qrToken);

    res.status(201).json({ attendance });
  } catch (error) {
    next(error);
  }
};

/**
 * Return attendance report and summary for an event.
 */
export const getEventAttendanceReportHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];

    if (!userId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const eventId = req.params.eventId;
    const report = await getEventAttendanceReport(eventId);

    if (!userRoles.includes('admin')) {
      const isOrganizer = report.event.organizers.some((organizerId) => organizerId.toString() === userId);
      const isCreator = report.event.createdBy.toString() === userId;
      if (!isOrganizer && !isCreator) {
        const err: AppError = new Error('You do not have permission to access attendance for this event');
        err.statusCode = 403;
        err.code = 'FORBIDDEN';
        return next(err);
      }
    }

    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};
