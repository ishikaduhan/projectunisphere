import { Types, Document } from 'mongoose';
import { AppError } from '../middlewares/errorHandler';
import { User, IUser } from '../models/User';
import { Event, IEvent } from '../models/Event';
import { Club, IClub } from '../models/Club';
import { Registration } from '../models/Registration';
import { Attendance } from '../models/Attendance';
import { Recommendation, IRecommendation, IRecommendationItem } from '../models/Recommendation';

type EventPayload = Omit<IEvent, keyof Document> & { _id: Types.ObjectId };

const RECOMMENDATION_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const MAX_RECOMMENDATIONS = 10;
const ALGORITHM_NAME = 'hybrid-event-recommendation';
const ALGORITHM_VERSION = '1.0';

const normalizeValue = (value: number, max: number): number => {
  if (max <= 0) return 0;
  return Math.min(1, value / max);
};

const makeTagSet = (tags: string[] = []): Set<string> => {
  return new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean));
};

const intersectCount = (source: Set<string>, target: string[] = []): number => {
  if (!source.size || target.length === 0) return 0;
  return target.reduce((count, tag) => (source.has(tag.trim().toLowerCase()) ? count + 1 : count), 0);
};

const getEventReasons = (
  interestMatches: number,
  historyMatches: number,
  clubMatch: boolean,
  trendingScore: number,
  attendanceScore: number
): string[] => {
  const reasons: string[] = [];

  if (interestMatches > 0) {
    reasons.push('Matches your interests');
  }
  if (clubMatch) {
    reasons.push('Organized by a club you joined');
  }
  if (historyMatches > 0) {
    reasons.push('Similar to your recent events');
  }
  if (trendingScore >= 0.25) {
    reasons.push('Trending among students');
  }
  if (attendanceScore >= 0.25) {
    reasons.push('High attendee engagement');
  }

  if (reasons.length === 0) {
    reasons.push('Recommended based on current event popularity');
  }

  return reasons;
};

const formatEventScore = (
  interestMatches: number,
  historyMatches: number,
  clubMatch: boolean,
  trendingScore: number,
  attendanceScore: number
): number => {
  const interestWeight = 0.35;
  const historyWeight = 0.2;
  const clubWeight = clubMatch ? 0.15 : 0;
  const trendingWeight = 0.18;
  const attendanceWeight = 0.12;

  return Math.min(
    1,
    interestMatches * interestWeight +
      historyMatches * historyWeight +
      clubWeight +
      trendingScore * trendingWeight +
      attendanceScore * attendanceWeight
  );
};

const buildRecommendationItems = (
  events: EventPayload[],
  userInterests: Set<string>,
  historicTags: Set<string>,
  clubIds: string[],
  maxRegistered: number,
  maxCheckedIn: number
): IRecommendationItem[] => {
  return events
    .map((event) => {
      const eventTags = makeTagSet(event.tags || []);
      const interestMatches = userInterests.size ? intersectCount(userInterests, Array.from(eventTags)) / userInterests.size : 0;
      const historyMatches = historicTags.size ? intersectCount(historicTags, Array.from(eventTags)) / historicTags.size : 0;
      const clubMatch = Boolean(event.clubId && clubIds.includes(event.clubId.toString()));
      const trendingScore = normalizeValue(event.analytics?.registeredCount ?? 0, maxRegistered);
      const attendanceScore = normalizeValue(event.analytics?.checkedInCount ?? 0, maxCheckedIn);
      const score = formatEventScore(interestMatches, historyMatches, clubMatch, trendingScore, attendanceScore);
      const reasons = getEventReasons(interestMatches, historyMatches, clubMatch, trendingScore, attendanceScore);

      return {
        eventId: event._id,
        score,
        reasons,
        expiresAt: new Date(Date.now() + RECOMMENDATION_TTL_MS),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RECOMMENDATIONS);
};

export const getTrendingEvents = async (limit = 10): Promise<EventPayload[]> => {
  const now = new Date();
  return Event.find({
    'approval.status': 'approved',
    'schedule.startAt': { $gte: now },
  })
    .sort({ 'analytics.registeredCount': -1, 'analytics.checkedInCount': -1 })
    .limit(limit)
    .lean()
    .exec();
};

export const refreshRecommendations = async (userId: string): Promise<IRecommendation> => {
  if (!Types.ObjectId.isValid(userId)) {
    const err: AppError = new Error('Invalid user identifier');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const user = await User.findById(userId).exec();
  if (!user) {
    const err: AppError = new Error('User not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const [clubs, registrations, attendanceRecords] = await Promise.all([
    Club.find({ 'members.userId': user._id, 'members.status': 'active' }).select('_id').lean().exec(),
    Registration.find({ userId: user._id, status: { $in: ['registered', 'waitlisted'] } }).select('eventId').lean().exec(),
    Attendance.find({ userId: user._id }).select('eventId').lean().exec(),
  ]);

  const userInterests = makeTagSet(user.profile.interests || []);
  const clubIds = clubs.map((club) => club._id.toString());
  const excludedEventIds = new Set<string>([
    ...registrations.map((item) => item.eventId.toString()),
    ...attendanceRecords.map((item) => item.eventId.toString()),
  ]);

  const pastEventIds = Array.from(new Set<string>([...excludedEventIds]));

  const pastEvents: EventPayload[] = pastEventIds.length
    ? await Event.find({ _id: { $in: pastEventIds.map((id) => new Types.ObjectId(id)) } })
        .select('tags')
        .lean()
        .exec()
    : [];

  const historicTags = new Set<string>(
    pastEvents.flatMap((event) => (event.tags || []).map((tag: string) => tag.toLowerCase().trim()))
  );

  const now = new Date();
  const candidateEvents: EventPayload[] = await Event.find({
    _id: { $nin: Array.from(excludedEventIds).map((id) => new Types.ObjectId(id)) },
    'approval.status': 'approved',
    'schedule.startAt': { $gte: now },
  })
    .lean()
    .exec();

  const maxRegistered = Math.max(1, ...candidateEvents.map((event) => event.analytics?.registeredCount ?? 0));
  const maxCheckedIn = Math.max(1, ...candidateEvents.map((event) => event.analytics?.checkedInCount ?? 0));

  const recommendationItems = buildRecommendationItems(
    candidateEvents,
    userInterests,
    historicTags,
    clubIds,
    maxRegistered,
    maxCheckedIn
  );

  const context = {
    interestTags: Array.from(userInterests),
    recentActions: [
      `${registrations.length} registrations`,
      `${attendanceRecords.length} attended events`,
      `${clubs.length} club memberships`,
    ],
  };

  const recommendationData = {
    userId: new Types.ObjectId(userId),
    generatedAt: new Date(),
    algorithm: {
      name: ALGORITHM_NAME,
      version: ALGORITHM_VERSION,
    },
    items: recommendationItems,
    context,
  };

  const recommendation = await Recommendation.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    recommendationData,
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  ).exec();

  if (!recommendation) {
    const err: AppError = new Error('Unable to generate recommendations');
    err.statusCode = 500;
    err.code = 'INTERNAL_ERROR';
    throw err;
  }

  return recommendation;
};

export const getPersonalizedRecommendations = async (userId: string): Promise<IRecommendation> => {
  if (!Types.ObjectId.isValid(userId)) {
    const err: AppError = new Error('Invalid user identifier');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const recommendation = await Recommendation.findOne({ userId: new Types.ObjectId(userId) }).exec();

  const now = new Date();
  if (recommendation) {
    const validItems = recommendation.items.filter((item) => item.expiresAt > now);
    if (validItems.length > 0) {
      recommendation.items = validItems as any;
      return recommendation;
    }
  }

  return refreshRecommendations(userId);
};
