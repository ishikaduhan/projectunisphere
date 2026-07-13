import { Schema, model, Document, Types } from 'mongoose';

export interface IClubMember {
  userId: Types.ObjectId;
  role: 'lead' | 'officer' | 'member';
  joinedAt: Date;
  status: 'active' | 'pending' | 'left';
}

export interface IClub extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  visibility: 'public' | 'university_only' | 'private';
  facultyAdvisorId?: Types.ObjectId;
  members: IClubMember[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClubMemberSchema = new Schema<IClubMember>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['lead', 'officer', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'left'],
    default: 'active',
  },
});

const ClubSchema = new Schema<IClub>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug must consist of lowercase letters, numbers, and hyphens.'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'university_only', 'private'],
      default: 'public',
    },
    facultyAdvisorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    members: {
      type: [ClubMemberSchema],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ClubSchema.index({ slug: 1 }, { unique: true });
ClubSchema.index({ category: 1, visibility: 1 });
ClubSchema.index({ 'members.userId': 1 });

export const Club = model<IClub>('Club', ClubSchema);
