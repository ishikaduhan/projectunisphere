"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClubHandler = exports.updateClubHandler = exports.getClubHandler = exports.listClubsHandler = exports.createClubHandler = void 0;
const clubService_1 = require("../services/clubService");
/**
 * Create a new club.
 */
const createClubHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const club = await (0, clubService_1.createClub)(req.body, userId);
        res.status(201).json({ club });
    }
    catch (error) {
        next(error);
    }
};
exports.createClubHandler = createClubHandler;
/**
 * List clubs with query filters.
 */
const listClubsHandler = async (req, res, next) => {
    try {
        const { category, visibility, createdBy, slug, search, page, limit } = req.query;
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const result = await (0, clubService_1.getClubs)({
            category: category,
            visibility: visibility,
            createdBy: createdBy,
            slug: slug,
            search: search,
        }, pageNum, limitNum);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.listClubsHandler = listClubsHandler;
/**
 * Get a club by ID.
 */
const getClubHandler = async (req, res, next) => {
    try {
        const clubId = req.params.id;
        const club = await (0, clubService_1.getClubById)(clubId);
        if (!club) {
            const err = new Error('Club not found');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            return next(err);
        }
        res.status(200).json({ club });
    }
    catch (error) {
        next(error);
    }
};
exports.getClubHandler = getClubHandler;
/**
 * Update a club by ID.
 */
const updateClubHandler = async (req, res, next) => {
    try {
        const clubId = req.params.id;
        const club = await (0, clubService_1.updateClub)(clubId, req.body);
        if (!club) {
            const err = new Error('Club not found');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            return next(err);
        }
        res.status(200).json({ club });
    }
    catch (error) {
        next(error);
    }
};
exports.updateClubHandler = updateClubHandler;
/**
 * Delete a club by ID.
 */
const deleteClubHandler = async (req, res, next) => {
    try {
        const clubId = req.params.id;
        const club = await (0, clubService_1.deleteClub)(clubId);
        if (!club) {
            const err = new Error('Club not found');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            return next(err);
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteClubHandler = deleteClubHandler;
