"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Club = void 0;
const mongoose_1 = require("mongoose");
const ClubMemberSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const ClubSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    members: {
        type: [ClubMemberSchema],
        default: [],
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
// Indexes
ClubSchema.index({ slug: 1 }, { unique: true });
ClubSchema.index({ category: 1, visibility: 1 });
ClubSchema.index({ 'members.userId': 1 });
exports.Club = (0, mongoose_1.model)('Club', ClubSchema);
