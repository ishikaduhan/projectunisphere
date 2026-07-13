"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recommendation = void 0;
const mongoose_1 = require("mongoose");
const RecommendationItemSchema = new mongoose_1.Schema({
    eventId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const RecommendationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// Indexes
RecommendationSchema.index({ userId: 1, generatedAt: -1 });
exports.Recommendation = (0, mongoose_1.model)('Recommendation', RecommendationSchema);
