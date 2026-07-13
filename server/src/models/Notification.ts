import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: 'event_reminder' | 'event_update' | 'club_announcement' | 'system';
  channel: 'email' | 'push' | 'in_app';
  title: string;
  message: string;
  data?: {
    eventId?: Types.ObjectId;
    eventTitle?: string;
    clubId?: Types.ObjectId;
  };
  status: 'queued' | 'sent' | 'failed' | 'read';
  scheduledFor: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['event_reminder', 'event_update', 'club_announcement', 'system'],
      required: true,
    },
    channel: {
      type: String,
      enum: ['email', 'push', 'in_app'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
      eventTitle: String,
      clubId: { type: Schema.Types.ObjectId, ref: 'Club' },
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'failed', 'read'],
      default: 'queued',
    },
    scheduledFor: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ userId: 1, status: 1, scheduledFor: 1 });
NotificationSchema.index({ scheduledFor: 1, status: 1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
