"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registration = void 0;
const mongoose_1 = require("mongoose");
const RegistrationSchema = new mongoose_1.Schema({
    eventId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['registered', 'waitlisted', 'cancelled', 'rejected'],
        default: 'registered',
    },
    registeredAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    ticket: {
        qrTokenHash: String,
        issuedAt: Date,
    },
    meta: {
        source: {
            type: String,
            enum: ['app', 'admin', 'import'],
            default: 'app',
        },
        answers: {
            type: mongoose_1.Schema.Types.Map,
            of: mongoose_1.Schema.Types.Mixed,
        },
    },
}, {
    timestamps: true,
});
// Indexes
// Force single registration per user per event
RegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
RegistrationSchema.index({ eventId: 1, status: 1, registeredAt: 1 });
RegistrationSchema.index({ userId: 1, registeredAt: -1 });
exports.Registration = (0, mongoose_1.model)('Registration', RegistrationSchema);
