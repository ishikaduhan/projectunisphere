"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    universityId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        first: { type: String, required: true, trim: true },
        last: { type: String, required: true, trim: true },
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    roles: {
        type: [String],
        default: ['student'],
        validate: {
            validator: (v) => v.length > 0,
            message: 'A user must have at least one role.',
        },
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'deleted'],
        default: 'active',
    },
    profile: {
        department: { type: String, required: true, trim: true },
        year: { type: Number },
        interests: { type: [String], default: [] },
    },
    settings: {
        notifyEmail: { type: Boolean, default: true },
        notifyPush: { type: Boolean, default: true },
        timezone: { type: String, default: 'Asia/Kolkata' },
    },
}, {
    timestamps: true,
});
// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ universityId: 1 });
UserSchema.index({ roles: 1, status: 1 });
exports.User = (0, mongoose_1.model)('User', UserSchema);
