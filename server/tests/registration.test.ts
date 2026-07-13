import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User';
import { Event } from '../src/models/Event';
import { registerForEvent, cancelRegistration } from '../src/services/registrationService';

const connectDatabase = async (): Promise<{ cleanup?: () => Promise<void> }> => {
  const envUri = process.env.MONGODB_URI;
  if (envUri) {
    try {
      await mongoose.connect(envUri);
      return {};
    } catch (error: any) {
      console.warn('Unable to connect to provided MONGODB_URI:', error.message || error);
      console.warn('Falling back to in-memory MongoDB for registration test.');
    }
  }

  const mongoServer = await MongoMemoryServer.create({ instance: { dbName: 'unisphere_registration_test' } });
  await mongoose.connect(mongoServer.getUri());
  return {
    cleanup: async () => {
      await mongoServer.stop();
    },
  };
};

const run = async (): Promise<void> => {
  const { cleanup } = await connectDatabase();

  const user = await new User({
    universityId: 'TEST-REG-001',
    name: { first: 'Test', last: 'Register' },
    email: 'test-register@example.com',
    passwordHash: 'passwordhash',
    roles: ['student'],
    profile: { department: 'Testing', interests: [] },
  }).save();

  const event = await new Event({
    title: 'Registration Test Event',
    description: 'A test event for registration module verification',
    tags: ['registration', 'test'],
    createdBy: user._id,
    organizers: [user._id],
    approval: { status: 'approved' },
    schedule: {
      startAt: new Date(Date.now() + 1000 * 60 * 60),
      endAt: new Date(Date.now() + 1000 * 60 * 120),
      timezone: 'Asia/Kolkata',
    },
    location: {
      mode: 'offline',
      venue: 'Test Hall',
    },
    capacity: {
      limit: 1,
      waitlistEnabled: false,
    },
    registration: {
      requiresApproval: false,
    },
    qr: {
      checkInEnabled: true,
    },
    analytics: {
      registeredCount: 0,
      checkedInCount: 0,
    },
  }).save();

  console.log('Running registration tests...');

  const registration = await registerForEvent(user._id.toString(), event._id.toString());
  if (registration.status !== 'registered') {
    throw new Error(`Expected registration status registered, got ${registration.status}`);
  }

  const eventAfterRegister = await Event.findById(event._id);
  if (!eventAfterRegister || eventAfterRegister.analytics.registeredCount !== 1) {
    throw new Error('Expected event.analytics.registeredCount to increment to 1.');
  }

  let duplicateFailed = false;
  try {
    await registerForEvent(user._id.toString(), event._id.toString());
  } catch (err: any) {
    duplicateFailed = err.code === 'CONFLICT';
  }
  if (!duplicateFailed) {
    throw new Error('Duplicate registration should be rejected with CONFLICT.');
  }

  const secondUser = await new User({
    universityId: 'TEST-REG-002',
    name: { first: 'Second', last: 'Registrant' },
    email: 'test-register2@example.com',
    passwordHash: 'passwordhash',
    roles: ['student'],
    profile: { department: 'Testing', interests: [] },
  }).save();

  let capacityFailed = false;
  try {
    await registerForEvent(secondUser._id.toString(), event._id.toString());
  } catch (err: any) {
    capacityFailed = err.code === 'CAPACITY_FULL';
  }
  if (!capacityFailed) {
    throw new Error('Registration should fail with CAPACITY_FULL when event capacity is reached.');
  }

  const cancelled = await cancelRegistration(user._id.toString(), registration._id.toString());
  if (cancelled.status !== 'cancelled') {
    throw new Error(`Expected cancelled status after cancellation, got ${cancelled.status}`);
  }

  const eventAfterCancel = await Event.findById(event._id);
  if (!eventAfterCancel || eventAfterCancel.analytics.registeredCount !== 0) {
    throw new Error('Expected event.analytics.registeredCount to decrement to 0 after cancellation.');
  }

  console.log('Registration module tests passed.');
  await mongoose.disconnect();
  if (cleanup) {
    await cleanup();
  }
};

run().catch((error) => {
  console.error('Registration module tests failed:', error);
  process.exit(1);
});
