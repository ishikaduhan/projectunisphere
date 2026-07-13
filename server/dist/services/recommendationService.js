"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPersonalizedRecommendations = exports.refreshRecommendations = exports.getTrendingEvents = void 0;
const mongoose_1 = require("mongoose");
const User_1 = require("../models/User");
const Event_1 = require("../models/Event");
const Club_1 = require("../models/Club");
const Registration_1 = require("../models/Registration");
const Attendance_1 = require("../models/Attendance");
const Recommendation_1 = require("../models/Recommendation");
const RECOMMENDATION_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const MAX_RECOMMENDATIONS = 10;
const ALGORITHM_NAME = 'hybrid-event-recommendation';
const ALGORITHM_VERSION = '1.0';
const normalizeValue = (value, max) => {
    if (max <= 0)
        return 0;
    return Math.min(1, value / max);
};
const makeTagSet = (tags = []) => {
    return new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean));
};
const intersectCount = (source, target = []) => {
    if (!source.size || target.length === 0)
        return 0;
    return target.reduce((count, tag) => (source.has(tag.trim().toLowerCase()) ? count + 1 : count), 0);
};
const getEventReasons = (interestMatches, historyMatches, clubMatch, trendingScore, attendanceScore) => {
    const reasons = [];
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
const formatEventScore = (interestMatches, historyMatches, clubMatch, trendingScore, attendanceScore) => {
    const interestWeight = 0.35;
    const historyWeight = 0.2;
    const clubWeight = clubMatch ? 0.15 : 0;
    const trendingWeight = 0.18;
    const attendanceWeight = 0.12;
    return Math.min(1, interestMatches * interestWeight +
        historyMatches * historyWeight +
        clubWeight +
        trendingScore * trendingWeight +
        attendanceScore * attendanceWeight);
};
const buildRecommendationItems = (events, userInterests, historicTags, clubIds, maxRegistered, maxCheckedIn) => {
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
const getTrendingEvents = async (limit = 10) => {
    const now = new Date();
    return Event_1.Event.find({
        'approval.status': 'approved',
        'schedule.startAt': { $gte: now },
    })
        .sort({ 'analytics.registeredCount': -1, 'analytics.checkedInCount': -1 })
        .limit(limit)
        .lean()
        .exec();
};
exports.getTrendingEvents = getTrendingEvents;
const refreshRecommendations = async (userId) => {
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        const err = new Error('Invalid user identifier');
        err.statusCode = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const user = await User_1.User.findById(userId).exec();
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    const [clubs, registrations, attendanceRecords] = await Promise.all([
        Club_1.Club.find({ 'members.userId': user._id, 'members.status': 'active' }).select('_id').lean().exec(),
        Registration_1.Registration.find({ userId: user._id, status: { $in: ['registered', 'waitlisted'] } }).select('eventId').lean().exec(),
        Attendance_1.Attendance.find({ userId: user._id }).select('eventId').lean().exec(),
    ]);
    const userInterests = makeTagSet(user.profile.interests || []);
    const clubIds = clubs.map((club) => club._id.toString());
    const excludedEventIds = new Set([
        ...registrations.map((item) => item.eventId.toString()),
        ...attendanceRecords.map((item) => item.eventId.toString()),
    ]);
    const pastEventIds = Array.from(new Set([...excludedEventIds]));
    const pastEvents = pastEventIds.length
        ? await Event_1.Event.find({ _id: { $in: pastEventIds.map((id) => new mongoose_1.Types.ObjectId(id)) } })
            .select('tags')
            .lean()
            .exec()
        : [];
    const historicTags = new Set(pastEvents.flatMap((event) => (event.tags || []).map((tag) => tag.toLowerCase().trim())));
    const now = new Date();
    const candidateEvents = await Event_1.Event.find({
        _id: { $nin: Array.from(excludedEventIds).map((id) => new mongoose_1.Types.ObjectId(id)) },
        'approval.status': 'approved',
        'schedule.startAt': { $gte: now },
    })
        .lean()
        .exec();
    const maxRegistered = Math.max(1, ...candidateEvents.map((event) => event.analytics?.registeredCount ?? 0));
    const maxCheckedIn = Math.max(1, ...candidateEvents.map((event) => event.analytics?.checkedInCount ?? 0));
    const recommendationItems = buildRecommendationItems(candidateEvents, userInterests, historicTags, clubIds, maxRegistered, maxCheckedIn);
    const context = {
        interestTags: Array.from(userInterests),
        recentActions: [
            `${registrations.length} registrations`,
            `${attendanceRecords.length} attended events`,
            `${clubs.length} club memberships`,
        ],
    };
    const recommendationData = {
        userId: new mongoose_1.Types.ObjectId(userId),
        generatedAt: new Date(),
        algorithm: {
            name: ALGORITHM_NAME,
            version: ALGORITHM_VERSION,
        },
        items: recommendationItems,
        context,
    };
    const recommendation = await Recommendation_1.Recommendation.findOneAndUpdate({ userId: new mongoose_1.Types.ObjectId(userId) }, recommendationData, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
    }).exec();
    if (!recommendation) {
        const err = new Error('Unable to generate recommendations');
        err.statusCode = 500;
        err.code = 'INTERNAL_ERROR';
        throw err;
    }
    return recommendation;
};
exports.refreshRecommendations = refreshRecommendations;
const getPersonalizedRecommendations = async (userId) => {
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        const err = new Error('Invalid user identifier');
        err.statusCode = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const recommendation = await Recommendation_1.Recommendation.findOne({ userId: new mongoose_1.Types.ObjectId(userId) }).exec();
    const now = new Date();
    if (recommendation) {
        const validItems = recommendation.items.filter((item) => item.expiresAt > now);
        if (validItems.length > 0) {
            recommendation.items = validItems;
            return recommendation;
        }
    }
    return (0, exports.refreshRecommendations)(userId);
};
exports.getPersonalizedRecommendations = getPersonalizedRecommendations;
