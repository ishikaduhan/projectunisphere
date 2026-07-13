"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = require("mongoose");
const EventSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Club',
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    organizers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// Indexes
EventSchema.index({ 'approval.status': 1, 'schedule.startAt': 1 });
EventSchema.index({ clubId: 1, 'schedule.startAt': -1 });
EventSchema.index({ title: 'text', description: 'text' });
exports.Event = (0, mongoose_1.model)('Event', EventSchema);
