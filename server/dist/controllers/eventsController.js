"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsEventHandler = exports.approveEventHandler = exports.submitEventForApprovalHandler = exports.deleteEventHandler = exports.updateEventHandler = exports.getEventHandler = exports.listEventsHandler = exports.createEventHandler = void 0;
const eventService_1 = require("../services/eventService");
/**
 * Create a new event.
 */
const createEventHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const event = await (0, eventService_1.createEvent)(req.body, userId);
        res.status(201).json({ event });
    }
    catch (error) {
        next(error);
    }
};
exports.createEventHandler = createEventHandler;
/**
 * List events with search and filter support.
 */
const listEventsHandler = async (req, res, next) => {
    try {
        const { clubId, status, startDate, endDate, locationMode, search, page, limit, } = req.query;
        const rawTags = req.query.tags;
        const tags = typeof rawTags === 'string'
            ? rawTags.split(',').map((tag) => tag.trim()).filter(Boolean)
            : Array.isArray(rawTags)
                ? rawTags.map((tag) => String(tag).trim()).filter(Boolean)
                : undefined;
        const result = await (0, eventService_1.getEvents)({
            clubId: clubId,
            status: status,
            startDate: startDate,
            endDate: endDate,
            tags,
            locationMode: locationMode,
            search: search,
        }, Number(page) || 1, Number(limit) || 20);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.listEventsHandler = listEventsHandler;
/**
 * Get a specific event by ID.
 */
const getEventHandler = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const event = await (0, eventService_1.getEventById)(eventId);
        if (!event) {
            const err = new Error('Event not found');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            return next(err);
        }
        res.status(200).json({ event });
    }
    catch (error) {
        next(error);
    }
};
exports.getEventHandler = getEventHandler;
/**
 * Update event details.
 */
const updateEventHandler = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const event = await (0, eventService_1.updateEvent)(eventId, req.body);
        if (!event) {
            const err = new Error('Event not found');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            return next(err);
        }
        res.status(200).json({ event });
    }
    catch (error) {
        next(error);
    }
};
exports.updateEventHandler = updateEventHandler;
/**
 * Delete an event.
 */
const deleteEventHandler = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const event = await (0, eventService_1.deleteEvent)(eventId);
        if (!event) {
            const err = new Error('Event not found');
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
exports.deleteEventHandler = deleteEventHandler;
/**
 * Submit an event for approval.
 */
const submitEventForApprovalHandler = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const userId = req.user?.id;
        if (!userId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const event = await (0, eventService_1.submitEventForApproval)(eventId);
        if (!event) {
            const err = new Error('Event not found');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            return next(err);
        }
        res.status(200).json({ event });
    }
    catch (error) {
        next(error);
    }
};
exports.submitEventForApprovalHandler = submitEventForApprovalHandler;
const approveEventHandler = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const reviewerId = req.user?.id;
        if (!reviewerId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const { status, feedback } = req.body;
        const event = await (0, eventService_1.approveEvent)(eventId, reviewerId, status, feedback);
        if (!event) {
            const err = new Error('Event not found');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            return next(err);
        }
        res.status(200).json({ event });
    }
    catch (error) {
        next(error);
    }
};
exports.approveEventHandler = approveEventHandler;
/**
 * Get analytics summary for events.
 */
const analyticsEventHandler = async (req, res, next) => {
    try {
        const { clubId, status, startDate, endDate, locationMode } = req.query;
        const stats = await (0, eventService_1.getEventAnalytics)({
            clubId: clubId,
            status: status,
            startDate: startDate,
            endDate: endDate,
            locationMode: locationMode,
        });
        res.status(200).json({ analytics: stats });
    }
    catch (error) {
        next(error);
    }
};
exports.analyticsEventHandler = analyticsEventHandler;
