import { Types } from 'mongoose';
import { Registration, IRegistration } from '../models/Registration';
import { Event, IEvent } from '../models/Event';
import { User, IUser } from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import { queueRegistrationConfirmation } from './notificationService';
import { generateQrToken, hashQrToken } from '../utils/qr';

export const isValidObjectId = (id: string): boolean => Types.ObjectId.isValid(id);

export const getUserRegistrations = async (
  userId: string,
  page = 1,
  limit = 20
): Promise<{ items: IRegistration[]; total: number }> => {
  if (!isValidObjectId(userId)) {
    const err: AppError = new Error('Invalid user identifier');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const skip = (page - 1) * limit;
  const query = { userId: new Types.ObjectId(userId) };

  const [items, total] = await Promise.all([
    Registration.find(query).sort({ registeredAt: -1 }).skip(skip).limit(limit).exec(),
    Registration.countDocuments(query).exec(),
  ]);

  return { items, total };
};

export const registerForEvent = async (userId: string, eventId: string): Promise<{ registration: IRegistration; qrToken?: string }> => {
  if (!isValidObjectId(userId) || !isValidObjectId(eventId)) {
    const err: AppError = new Error('Invalid user or event identifier');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const [event, user] = await Promise.all([
    Event.findById(eventId).exec(),
    User.findById(userId).exec(),
  ]);

  if (!event) {
    const err: AppError = new Error('Event not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (!user) {
    const err: AppError = new Error('User not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const existingRegistration = await Registration.findOne({
    eventId: event._id,
    userId: new Types.ObjectId(userId),
    status: { $in: ['registered', 'waitlisted'] },
  }).exec();

  if (existingRegistration) {
    const err: AppError = new Error('User is already registered for this event');
    err.statusCode = 409;
    err.code = 'CONFLICT';
    throw err;
  }

  const currentCount = event.analytics?.registeredCount || 0;
  const capacityLimit = event.capacity?.limit;
  const waitlistEnabled = event.capacity?.waitlistEnabled ?? true;

  let status: IRegistration['status'] = 'registered';
  if (typeof capacityLimit === 'number' && capacityLimit >= 0 && currentCount >= capacityLimit) {
    if (!waitlistEnabled) {
      const err: AppError = new Error('Event capacity has been reached');
      err.statusCode = 409;
      err.code = 'CAPACITY_FULL';
      throw err;
    }
    status = 'waitlisted';
  }

  const registrationData: Partial<IRegistration> = {
    eventId: event._id,
    userId: new Types.ObjectId(userId),
    status,
    registeredAt: new Date(),
  };

  let qrToken: string | undefined;
  const registration = new Registration(registrationData);

  try {
    await registration.save();
  } catch (error: any) {
    if (error?.code === 11000) {
      const err: AppError = new Error('Duplicate registration detected');
      err.statusCode = 409;
      err.code = 'CONFLICT';
      throw err;
    }
    throw error;
  }

  if (status === 'registered') {
    qrToken = generateQrToken(registration._id.toString(), event._id.toString(), userId, event.qr?.secretVersion || 1);
    registration.ticket = {
      qrTokenHash: hashQrToken(qrToken),
      issuedAt: new Date(),
    };
    await registration.save();

    event.analytics.registeredCount = currentCount + 1;
    await event.save();
  }

  try {
    await queueRegistrationConfirmation(registration._id.toString(), event, user, qrToken);
  } catch (notificationError) {
    console.warn('[Registration] Failed to queue confirmation notification', notificationError);
  }

  return { registration, qrToken };
};

export const cancelRegistration = async (userId: string, registrationId: string): Promise<IRegistration> => {
  if (!isValidObjectId(userId) || !isValidObjectId(registrationId)) {
    const err: AppError = new Error('Invalid user or registration identifier');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const registration = await Registration.findOne({
    _id: new Types.ObjectId(registrationId),
    userId: new Types.ObjectId(userId),
  }).exec();

  if (!registration) {
    const err: AppError = new Error('Registration not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (registration.status === 'cancelled') {
    const err: AppError = new Error('Registration is already cancelled');
    err.statusCode = 400;
    err.code = 'INVALID_STATE';
    throw err;
  }

  const event = await Event.findById(registration.eventId).exec();
  if (!event) {
    const err: AppError = new Error('Associated event not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (registration.status === 'registered') {
    event.analytics.registeredCount = Math.max(0, (event.analytics?.registeredCount || 0) - 1);
    await event.save();
  }

  registration.status = 'cancelled';
  await registration.save();

  return registration;
};
