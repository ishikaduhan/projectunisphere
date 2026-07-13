"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrendingEventsHandler = exports.refreshRecommendationsHandler = exports.getRecommendationsHandler = void 0;
const recommendationService_1 = require("../services/recommendationService");
const getRecommendationsHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const recommendations = await (0, recommendationService_1.getPersonalizedRecommendations)(userId);
        const populated = await recommendations.populate('items.eventId');
        res.status(200).json({
            recommendations: populated.items.map((item) => ({
                score: item.score,
                reasons: item.reasons,
                expiresAt: item.expiresAt,
                event: item.eventId,
            })),
            generatedAt: populated.generatedAt,
            algorithm: populated.algorithm,
            context: populated.context,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRecommendationsHandler = getRecommendationsHandler;
const refreshRecommendationsHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const recommendations = await (0, recommendationService_1.refreshRecommendations)(userId);
        const populated = await recommendations.populate('items.eventId');
        res.status(200).json({
            recommendations: populated.items.map((item) => ({
                score: item.score,
                reasons: item.reasons,
                expiresAt: item.expiresAt,
                event: item.eventId,
            })),
            generatedAt: populated.generatedAt,
            algorithm: populated.algorithm,
            context: populated.context,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refreshRecommendationsHandler = refreshRecommendationsHandler;
const getTrendingEventsHandler = async (req, res, next) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const events = await (0, recommendationService_1.getTrendingEvents)(limit);
        res.status(200).json({ events });
    }
    catch (error) {
        next(error);
    }
};
exports.getTrendingEventsHandler = getTrendingEventsHandler;
