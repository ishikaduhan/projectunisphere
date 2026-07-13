import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  registrationId?: Types.ObjectId;
  checkIn: {
    status: 'checked_in' | 'absent' | 'excused';
    checkedInAt: Date;
    method: 'qr' | 'manual' | 'geo' | 'code';
    scannedBy?: Types.ObjectId;
  };
  checkOut?: {
    checkedOutAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
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
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: 'Registration',
    },
    checkIn: {
      status: {
        type: String,
        enum: ['checked_in', 'absent', 'excused'],
        default: 'checked_in',
      },
      checkedInAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
      method: {
        type: String,
        enum: ['qr', 'manual', 'geo', 'code'],
        default: 'qr',
      },
      scannedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    checkOut: {
      checkedOutAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Force single attendance record per user per event
AttendanceSchema.index({ eventId: 1, userId: 1 }, { unique: true });
AttendanceSchema.index({ eventId: 1, 'checkIn.checkedInAt': 1 });
AttendanceSchema.index({ userId: 1, 'checkIn.checkedInAt': -1 });

export const Attendance = model<IAttendance>('Attendance', AttendanceSchema);
