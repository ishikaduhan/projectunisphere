import { Schema, model, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  tags: string[];
  clubId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  organizers: Types.ObjectId[];
  approval: {
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    feedback?: string;
  };
  schedule: {
    startAt: Date;
    endAt: Date;
    timezone: string;
  };
  location: {
    mode: 'offline' | 'online' | 'hybrid';
    venue?: string;
    room?: string;
    meetingUrl?: string;
  };
  capacity: {
    limit?: number;
    waitlistEnabled: boolean;
  };
  registration: {
    openAt?: Date;
    closeAt?: Date;
    requiresApproval: boolean;
  };
  qr: {
    checkInEnabled: boolean;
    secretVersion: number;
  };
  analytics: {
    registeredCount: number;
    checkedInCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    approval: {
      status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'draft',
      },
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: Date,
      feedback: String,
    },
    schedule: {
      startAt: {
        type: Date,
        required: true,
      },
      endAt: {
        type: Date,
        required: true,
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata',
      },
    },
    location: {
      mode: {
        type: String,
        enum: ['offline', 'online', 'hybrid'],
        required: true,
      },
      venue: String,
      room: String,
      meetingUrl: String,
    },
    capacity: {
      limit: Number,
      waitlistEnabled: {
        type: Boolean,
        default: true,
      },
    },
    registration: {
      openAt: Date,
      closeAt: Date,
      requiresApproval: {
        type: Boolean,
        default: false,
      },
    },
    qr: {
      checkInEnabled: {
        type: Boolean,
        default: true,
      },
      secretVersion: {
        type: Number,
        default: 1,
      },
    },
    analytics: {
      registeredCount: {
        type: Number,
        default: 0,
      },
      checkedInCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EventSchema.index({ 'approval.status': 1, 'schedule.startAt': 1 });
EventSchema.index({ clubId: 1, 'schedule.startAt': -1 });
EventSchema.index({ title: 'text', description: 'text' });

export const Event = model<IEvent>('Event', EventSchema);
