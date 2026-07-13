import { Types } from 'mongoose';
import { Attendance, IAttendance } from '../models/Attendance';
import { Event, IEvent } from '../models/Event';
import { Registration, IRegistration } from '../models/Registration';
import { AppError } from '../middlewares/errorHandler';
import { hashQrToken, IQrPayload, verifyQrToken } from '../utils/qr';

export const isValidObjectId = (id: string): boolean => Types.ObjectId.isValid(id);

export const validateAttendanceQrToken = async (qrToken: string): Promise<{ registration: IRegistration; event: IEvent }> => {
  if (!qrToken || typeof qrToken !== 'string') {
    const err: AppError = new Error('QR token is required');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  let payload: IQrPayload;

  try {
    payload = verifyQrToken(qrToken);
  } catch (error: any) {
    const err: AppError = new Error(error.name === 'TokenExpiredError' ? 'QR token has expired' : 'Invalid QR token');
    err.statusCode = 400;
    err.code = 'INVALID_QR_TOKEN';
    throw err;
  }

  const { registrationId, eventId, userId, version } = payload;

  if (!isValidObjectId(registrationId) || !isValidObjectId(eventId) || !isValidObjectId(userId)) {
    const err: AppError = new Error('QR token contains invalid identifiers');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const [event, registration] = await Promise.all([
    Event.findById(eventId).exec(),
    Registration.findById(registrationId).exec(),
  ]);

  if (!event) {
    const err: AppError = new Error('Event not found for QR token');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (!registration) {
    const err: AppError = new Error('Registration not found for QR token');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (registration.eventId.toString() !== eventId || registration.userId.toString() !== userId) {
    const err: AppError = new Error('QR token payload does not match registration');
    err.statusCode = 400;
    err.code = 'INVALID_QR_TOKEN';
    throw err;
  }

  const currentSecretVersion = event.qr?.secretVersion || 1;
  if (version !== currentSecretVersion) {
    const err: AppError = new Error('QR token version does not match event configuration');
    err.statusCode = 400;
    err.code = 'INVALID_QR_TOKEN';
    throw err;
  }

  if (!event.qr?.checkInEnabled) {
    const err: AppError = new Error('QR check-in is not enabled for this event');
    err.statusCode = 400;
    err.code = 'INVALID_OPERATION';
    throw err;
  }

  const qrHash = registration.ticket?.qrTokenHash;
  if (!qrHash) {
    const err: AppError = new Error('QR token has not been issued for this registration');
    err.statusCode = 400;
    err.code = 'INVALID_QR_TOKEN';
    throw err;
  }

  if (hashQrToken(qrToken) !== qrHash) {
    const err: AppError = new Error('Invalid QR token');
    err.statusCode = 400;
    err.code = 'INVALID_QR_TOKEN';
    throw err;
  }

  if (registration.status !== 'registered') {
    const err: AppError = new Error('Only registered attendees can check in');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  return { registration, event };
};

export const markAttendanceWithQrToken = async (
  scannerId: string,
  qrToken: string
): Promise<IAttendance> => {
  if (!isValidObjectId(scannerId)) {
    const err: AppError = new Error('Authenticated user identifier is invalid');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const { registration, event } = await validateAttendanceQrToken(qrToken);

  const attendanceExists = await Attendance.findOne({
    eventId: registration.eventId,
    userId: registration.userId,
  }).exec();

  if (attendanceExists) {
    const err: AppError = new Error('Attendance has already been recorded for this user');
    err.statusCode = 409;
    err.code = 'DUPLICATE_ATTENDANCE';
    throw err;
  }

  const attendance = new Attendance({
    eventId: registration.eventId,
    userId: registration.userId,
    registrationId: registration._id,
    checkIn: {
      status: 'checked_in',
      checkedInAt: new Date(),
      method: 'qr',
      scannedBy: new Types.ObjectId(scannerId),
    },
  });

  try {
    await attendance.save();
  } catch (error: any) {
    if (error?.code === 11000) {
      const err: AppError = new Error('Attendance has already been recorded for this user');
      err.statusCode = 409;
      err.code = 'DUPLICATE_ATTENDANCE';
      throw err;
    }
    throw error;
  }

  event.analytics.checkedInCount = (event.analytics?.checkedInCount || 0) + 1;
  await event.save();

  return attendance;
};

export const getEventAttendanceReport = async (eventId: string): Promise<{
  event: IEvent;
  statistics: {
    totalRegistered: number;
    totalCheckedIn: number;
    totalExcused: number;
    totalAbsent: number;
    attendanceRate: number;
  };
  attendance: any[];
}> => {
  if (!isValidObjectId(eventId)) {
    const err: AppError = new Error('Invalid event identifier');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const event = await Event.findById(eventId).exec();

  if (!event) {
    const err: AppError = new Error('Event not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const [attendance, totalRegistered] = await Promise.all([
    Attendance.find({ eventId: event._id })
      .populate('userId', 'name profile.department email')
      .sort({ 'checkIn.checkedInAt': -1 })
      .lean()
      .exec() as Promise<any[]>,
    Registration.countDocuments({ eventId: event._id, status: 'registered' }).exec(),
  ]);

  const totalCheckedIn = attendance.filter((item) => item.checkIn?.status === 'checked_in').length;
  const totalExcused = attendance.filter((item) => item.checkIn?.status === 'excused').length;
  const totalAbsent = attendance.filter((item) => item.checkIn?.status === 'absent').length;
  const attendanceRate = totalRegistered > 0 ? Number(((totalCheckedIn / totalRegistered) * 100).toFixed(2)) : 0;

  return {
    event,
    attendance,
    statistics: {
      totalRegistered,
      totalCheckedIn,
      totalExcused,
      totalAbsent,
      attendanceRate,
    },
  };
};
