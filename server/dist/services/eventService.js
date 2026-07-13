"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventAnalytics = exports.approveEvent = exports.submitEventForApproval = exports.deleteEvent = exports.updateEvent = exports.getEvents = exports.getEventById = exports.createEvent = exports.isValidObjectId = void 0;
const mongoose_1 = require("mongoose");
const Event_1 = require("../models/Event");
const isValidObjectId = (id) => {
    return mongoose_1.Types.ObjectId.isValid(id);
};
exports.isValidObjectId = isValidObjectId;
const createEvent = async (data, createdBy) => {
    const event = new Event_1.Event({
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        clubId: data.clubId,
        createdBy,
        organizers: data.organizers || [createdBy],
        approval: {
            status: 'draft',
        },
        schedule: data.schedule,
        location: data.location,
        capacity: data.capacity || { waitlistEnabled: true },
        registration: data.registration || { requiresApproval: false },
        qr: data.qr || { checkInEnabled: true },
        analytics: {
            registeredCount: 0,
            checkedInCount: 0,
        },
    });
    return event.save();
};
exports.createEvent = createEvent;
const getEventById = async (eventId) => {
    if (!(0, exports.isValidObjectId)(eventId))
        return null;
    return Event_1.Event.findById(eventId).exec();
};
exports.getEventById = getEventById;
const getEvents = async (filters, page = 1, limit = 20) => {
    const query = {};
    if (filters.clubId && (0, exports.isValidObjectId)(filters.clubId)) {
        query.clubId = filters.clubId;
    }
    if (filters.status) {
        query['approval.status'] = filters.status;
    }
    if (filters.tags && filters.tags.length) {
        query.tags = { $all: filters.tags };
    }
    if (filters.locationMode) {
        query['location.mode'] = filters.locationMode;
    }
    if (filters.startDate || filters.endDate) {
        query['schedule.startAt'] = {};
        if (filters.startDate) {
            query['schedule.startAt'].$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            query['schedule.startAt'].$lte = new Date(filters.endDate);
        }
    }
    if (filters.search) {
        const searchRegex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        query.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { tags: searchRegex },
        ];
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        Event_1.Event.find(query)
            .sort({ 'schedule.startAt': 1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        Event_1.Event.countDocuments(query).exec(),
    ]);
    return { items, total };
};
exports.getEvents = getEvents;
const updateEvent = async (eventId, data) => {
    const updatePayload = {};
    if (data.title !== undefined)
        updatePayload.title = data.title;
    if (data.description !== undefined)
        updatePayload.description = data.description;
    if (data.tags !== undefined)
        updatePayload.tags = data.tags;
    if (data.clubId !== undefined)
        updatePayload.clubId = data.clubId;
    if (data.organizers !== undefined)
        updatePayload.organizers = data.organizers;
    if (data.schedule !== undefined)
        updatePayload.schedule = data.schedule;
    if (data.location !== undefined)
        updatePayload.location = data.location;
    if (data.capacity !== undefined)
        updatePayload.capacity = data.capacity;
    if (data.registration !== undefined)
        updatePayload.registration = data.registration;
    if (data.qr !== undefined)
        updatePayload.qr = data.qr;
    if (data.approval !== undefined) {
        updatePayload.approval = {
            ...data.approval,
        };
    }
    return Event_1.Event.findByIdAndUpdate(eventId, updatePayload, { new: true, runValidators: true }).exec();
};
exports.updateEvent = updateEvent;
const deleteEvent = async (eventId) => {
    return Event_1.Event.findByIdAndDelete(eventId).exec();
};
exports.deleteEvent = deleteEvent;
const submitEventForApproval = async (eventId) => {
    return Event_1.Event.findByIdAndUpdate(eventId, {
        'approval.status': 'pending',
        'approval.reviewedBy': undefined,
        'approval.reviewedAt': undefined,
        'approval.feedback': undefined,
    }, { new: true, runValidators: true }).exec();
};
exports.submitEventForApproval = submitEventForApproval;
const approveEvent = async (eventId, reviewerId, status, feedback) => {
    return Event_1.Event.findByIdAndUpdate(eventId, {
        approval: {
            status,
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            feedback,
        },
    }, { new: true, runValidators: true }).exec();
};
exports.approveEvent = approveEvent;
const getEventAnalytics = async (filters) => {
    const match = {};
    if (filters.clubId && (0, exports.isValidObjectId)(filters.clubId)) {
        match.clubId = new mongoose_1.Types.ObjectId(filters.clubId);
    }
    if (filters.status) {
        match['approval.status'] = filters.status;
    }
    if (filters.locationMode) {
        match['location.mode'] = filters.locationMode;
    }
    if (filters.startDate || filters.endDate) {
        match['schedule.startAt'] = {};
        if (filters.startDate)
            match['schedule.startAt'].$gte = new Date(filters.startDate);
        if (filters.endDate)
            match['schedule.startAt'].$lte = new Date(filters.endDate);
    }
    const aggregation = await Event_1.Event.aggregate([
        { $match: match },
        {
            $facet: {
                stats: [
                    {
                        $group: {
                            _id: null,
                            totalEvents: { $sum: 1 },
                            approvedEvents: {
                                $sum: {
                                    $cond: [{ $eq: ['$approval.status', 'approved'] }, 1, 0],
                                },
                            },
                            upcomingEvents: {
                                $sum: {
                                    $cond: [{ $gt: ['$schedule.startAt', new Date()] }, 1, 0],
                                },
                            },
                            totalRegistered: { $sum: '$analytics.registeredCount' },
                            totalCheckedIn: { $sum: '$analytics.checkedInCount' },
                        },
                    },
                ],
                topTags: [
                    { $unwind: '$tags' },
                    { $group: { _id: '$tags', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                    { $project: { tag: '$_id', count: 1, _id: 0 } },
                ],
            },
        },
    ]).exec();
    const stats = (aggregation[0]?.stats?.[0]) || {
        totalEvents: 0,
        approvedEvents: 0,
        upcomingEvents: 0,
        totalRegistered: 0,
        totalCheckedIn: 0,
    };
    const averageRegistrations = stats.totalEvents > 0 ? stats.totalRegistered / stats.totalEvents : 0;
    const averageAttendance = stats.totalEvents > 0 ? stats.totalCheckedIn / stats.totalEvents : 0;
    return {
        totalEvents: stats.totalEvents,
        upcomingEvents: stats.upcomingEvents,
        approvedEvents: stats.approvedEvents,
        averageRegistrations,
        averageAttendance,
        topTags: aggregation[0]?.topTags || [],
    };
};
exports.getEventAnalytics = getEventAnalytics;
