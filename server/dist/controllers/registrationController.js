"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelRegistrationHandler = exports.listRegistrationsHandler = exports.createRegistrationHandler = void 0;
const registrationService_1 = require("../services/registrationService");
/**
 * Register the authenticated user for an event.
 */
const createRegistrationHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const { eventId } = req.body;
        const registration = await (0, registrationService_1.registerForEvent)(userId, eventId);
        res.status(201).json({ registration });
    }
    catch (error) {
        next(error);
    }
};
exports.createRegistrationHandler = createRegistrationHandler;
/**
 * List registrations for the authenticated user.
 */
const listRegistrationsHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = await (0, registrationService_1.getUserRegistrations)(userId, page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.listRegistrationsHandler = listRegistrationsHandler;
/**
 * Cancel a registration for the authenticated user.
 */
const cancelRegistrationHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const registrationId = req.params.id;
        const registration = await (0, registrationService_1.cancelRegistration)(userId, registrationId);
        res.status(200).json({ registration });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelRegistrationHandler = cancelRegistrationHandler;
