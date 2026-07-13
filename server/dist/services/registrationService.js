"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelRegistration = exports.registerForEvent = exports.getUserRegistrations = exports.isValidObjectId = void 0;
const mongoose_1 = require("mongoose");
const Registration_1 = require("../models/Registration");
const Event_1 = require("../models/Event");
const User_1 = require("../models/User");
const notificationService_1 = require("./notificationService");
const isValidObjectId = (id) => mongoose_1.Types.ObjectId.isValid(id);
exports.isValidObjectId = isValidObjectId;
const getUserRegistrations = async (userId, page = 1, limit = 20) => {
    if (!(0, exports.isValidObjectId)(userId)) {
        const err = new Error('Invalid user identifier');
        err.statusCode = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const skip = (page - 1) * limit;
    const query = { userId: new mongoose_1.Types.ObjectId(userId) };
    const [items, total] = await Promise.all([
        Registration_1.Registration.find(query).sort({ registeredAt: -1 }).skip(skip).limit(limit).exec(),
        Registration_1.Registration.countDocuments(query).exec(),
    ]);
    return { items, total };
};
exports.getUserRegistrations = getUserRegistrations;
const registerForEvent = async (userId, eventId) => {
    if (!(0, exports.isValidObjectId)(userId) || !(0, exports.isValidObjectId)(eventId)) {
        const err = new Error('Invalid user or event identifier');
        err.statusCode = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const [event, user] = await Promise.all([
        Event_1.Event.findById(eventId).exec(),
        User_1.User.findById(userId).exec(),
    ]);
    if (!event) {
        const err = new Error('Event not found');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    const existingRegistration = await Registration_1.Registration.findOne({
        eventId: event._id,
        userId: new mongoose_1.Types.ObjectId(userId),
        status: { $in: ['registered', 'waitlisted'] },
    }).exec();
    if (existingRegistration) {
        const err = new Error('User is already registered for this event');
        err.statusCode = 409;
        err.code = 'CONFLICT';
        throw err;
    }
    const currentCount = event.analytics?.registeredCount || 0;
    const capacityLimit = event.capacity?.limit;
    const waitlistEnabled = event.capacity?.waitlistEnabled ?? true;
    let status = 'registered';
    if (typeof capacityLimit === 'number' && capacityLimit >= 0 && currentCount >= capacityLimit) {
        if (!waitlistEnabled) {
            const err = new Error('Event capacity has been reached');
            err.statusCode = 409;
            err.code = 'CAPACITY_FULL';
            throw err;
        }
        status = 'waitlisted';
    }
    const registration = new Registration_1.Registration({
        eventId: event._id,
        userId: new mongoose_1.Types.ObjectId(userId),
        status,
        registeredAt: new Date(),
    });
    try {
        await registration.save();
    }
    catch (error) {
        if (error?.code === 11000) {
            const err = new Error('Duplicate registration detected');
            err.statusCode = 409;
            err.code = 'CONFLICT';
            throw err;
        }
        throw error;
    }
    if (status === 'registered') {
        event.analytics.registeredCount = currentCount + 1;
        await event.save();
    }
    try {
        await (0, notificationService_1.queueRegistrationConfirmation)(registration._id.toString(), event, user);
    }
    catch (notificationError) {
        console.warn('[Registration] Failed to queue confirmation notification', notificationError);
    }
    return registration;
};
exports.registerForEvent = registerForEvent;
const cancelRegistration = async (userId, registrationId) => {
    if (!(0, exports.isValidObjectId)(userId) || !(0, exports.isValidObjectId)(registrationId)) {
        const err = new Error('Invalid user or registration identifier');
        err.statusCode = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const registration = await Registration_1.Registration.findOne({
        _id: new mongoose_1.Types.ObjectId(registrationId),
        userId: new mongoose_1.Types.ObjectId(userId),
    }).exec();
    if (!registration) {
        const err = new Error('Registration not found');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    if (registration.status === 'cancelled') {
        const err = new Error('Registration is already cancelled');
        err.statusCode = 400;
        err.code = 'INVALID_STATE';
        throw err;
    }
    const event = await Event_1.Event.findById(registration.eventId).exec();
    if (!event) {
        const err = new Error('Associated event not found');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    if (registration.status === 'registered') {
        event.analytics.registeredCount = Math.max(0, (event.analytics?.registeredCount || 0) - 1);
        await event.save();
    }
    registration.status = 'cancelled';
    await registration.save();
    return registration;
};
exports.cancelRegistration = cancelRegistration;
