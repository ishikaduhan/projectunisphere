"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attendance = void 0;
const mongoose_1 = require("mongoose");
const AttendanceSchema = new mongoose_1.Schema({
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
    registrationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Registration',
    },
    checkIn: {
        status: {
            type: String,
            enum: ['checked_in', 'absent', 'excused'],
            default: 'checked_in',
        },
        checkedInAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        method: {
            type: String,
            enum: ['qr', 'manual', 'geo', 'code'],
            default: 'qr',
        },
        scannedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    checkOut: {
        checkedOutAt: Date,
    },
}, {
    timestamps: true,
});
// Indexes
// Force single attendance record per user per event
AttendanceSchema.index({ eventId: 1, userId: 1 }, { unique: true });
AttendanceSchema.index({ eventId: 1, 'checkIn.checkedInAt': 1 });
AttendanceSchema.index({ userId: 1, 'checkIn.checkedInAt': -1 });
exports.Attendance = (0, mongoose_1.model)('Attendance', AttendanceSchema);
