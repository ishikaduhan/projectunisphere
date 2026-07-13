"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClub = exports.updateClub = exports.getClubs = exports.getClubBySlug = exports.getClubById = exports.createClub = exports.isValidObjectId = void 0;
const mongoose_1 = require("mongoose");
const Club_1 = require("../models/Club");
const isValidObjectId = (id) => {
    return mongoose_1.Types.ObjectId.isValid(id);
};
exports.isValidObjectId = isValidObjectId;
const normalizeSlug = (value) => {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};
const ensureUniqueSlug = async (slugBase) => {
    let slug = normalizeSlug(slugBase);
    let suffix = 0;
    while (await Club_1.Club.exists({ slug })) {
        suffix += 1;
        slug = `${normalizeSlug(slugBase)}-${suffix}`;
    }
    return slug;
};
const createClub = async (data, createdBy) => {
    const slug = data.slug ? normalizeSlug(data.slug) : await ensureUniqueSlug(data.name || 'club');
    const club = new Club_1.Club({
        name: data.name,
        slug,
        description: data.description,
        category: data.category,
        visibility: data.visibility || 'public',
        facultyAdvisorId: data.facultyAdvisorId,
        members: data.members || [],
        createdBy,
    });
    return club.save();
};
exports.createClub = createClub;
const getClubById = async (clubId) => {
    if (!(0, exports.isValidObjectId)(clubId))
        return null;
    return Club_1.Club.findById(clubId).exec();
};
exports.getClubById = getClubById;
const getClubBySlug = async (slug) => {
    return Club_1.Club.findOne({ slug }).exec();
};
exports.getClubBySlug = getClubBySlug;
const getClubs = async (filters, page = 1, limit = 20) => {
    const query = {};
    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.visibility) {
        query.visibility = filters.visibility;
    }
    if (filters.createdBy && (0, exports.isValidObjectId)(filters.createdBy)) {
        query.createdBy = filters.createdBy;
    }
    if (filters.slug) {
        query.slug = filters.slug;
    }
    if (filters.search) {
        const searchRegex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        query.$or = [
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
        ];
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        Club_1.Club.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        Club_1.Club.countDocuments(query).exec(),
    ]);
    return { items, total };
};
exports.getClubs = getClubs;
const updateClub = async (clubId, data) => {
    const updatePayload = {};
    if (data.name !== undefined)
        updatePayload.name = data.name;
    if (data.description !== undefined)
        updatePayload.description = data.description;
    if (data.category !== undefined)
        updatePayload.category = data.category;
    if (data.visibility !== undefined)
        updatePayload.visibility = data.visibility;
    if (data.facultyAdvisorId !== undefined)
        updatePayload.facultyAdvisorId = data.facultyAdvisorId;
    if (data.members !== undefined)
        updatePayload.members = data.members;
    if (data.slug !== undefined) {
        updatePayload.slug = normalizeSlug(data.slug);
    }
    return Club_1.Club.findByIdAndUpdate(clubId, updatePayload, { new: true, runValidators: true }).exec();
};
exports.updateClub = updateClub;
const deleteClub = async (clubId) => {
    return Club_1.Club.findByIdAndDelete(clubId).exec();
};
exports.deleteClub = deleteClub;
