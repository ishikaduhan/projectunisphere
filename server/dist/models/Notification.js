"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Event' },
        eventTitle: String,
        clubId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Club' },
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
}, {
    timestamps: true,
});
// Indexes
NotificationSchema.index({ userId: 1, status: 1, scheduledFor: 1 });
NotificationSchema.index({ scheduledFor: 1, status: 1 });
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
