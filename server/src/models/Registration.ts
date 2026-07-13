import { Schema, model, Document, Types } from 'mongoose';

export interface IRegistration extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  status: 'registered' | 'waitlisted' | 'cancelled' | 'rejected';
  registeredAt: Date;
  ticket: {
    qrTokenHash?: string;
    issuedAt?: Date;
  };
  meta?: {
    source: 'app' | 'admin' | 'import';
    answers?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['registered', 'waitlisted', 'cancelled', 'rejected'],
      default: 'registered',
    },
    registeredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ticket: {
      qrTokenHash: String,
      issuedAt: Date,
    },
    meta: {
      source: {
        type: String,
        enum: ['app', 'admin', 'import'],
        default: 'app',
      },
      answers: {
        type: Schema.Types.Map,
        of: Schema.Types.Mixed,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Force single registration per user per event
RegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
RegistrationSchema.index({ eventId: 1, status: 1, registeredAt: 1 });
RegistrationSchema.index({ userId: 1, registeredAt: -1 });

export const Registration = model<IRegistration>('Registration', RegistrationSchema);
