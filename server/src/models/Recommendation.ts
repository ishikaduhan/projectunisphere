import { Schema, model, Document, Types } from 'mongoose';

export interface IRecommendationItem {
  eventId: Types.ObjectId;
  score: number;
  reasons: string[];
  expiresAt: Date;
}

export interface IRecommendation extends Document {
  userId: Types.ObjectId;
  generatedAt: Date;
  algorithm: {
    name: string;
    version: string;
  };
  items: IRecommendationItem[];
  context?: {
    interestTags?: string[];
    recentActions?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationItemSchema = new Schema<IRecommendationItem>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 1, // score normalized between 0 and 1
  },
  reasons: {
    type: [String],
    default: [],
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const RecommendationSchema = new Schema<IRecommendation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One active recommendation document per user
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    algorithm: {
      name: { type: String, required: true },
      version: { type: String, required: true },
    },
    items: {
      type: [RecommendationItemSchema],
      default: [],
    },
    context: {
      interestTags: { type: [String], default: [] },
      recentActions: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RecommendationSchema.index({ userId: 1, generatedAt: -1 });

export const Recommendation = model<IRecommendation>('Recommendation', RecommendationSchema);
