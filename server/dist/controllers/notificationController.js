"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotificationHandler = exports.markNotificationUnreadHandler = exports.markNotificationReadHandler = exports.listNotificationsHandler = void 0;
const notificationService_1 = require("../services/notificationService");
/**
 * List notifications for the authenticated user.
 */
const listNotificationsHandler = async (req, res, next) => {
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
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const result = await (0, notificationService_1.getUserNotifications)(userId, page, limit, status);
        res.status(200).json({ ...result, page, limit });
    }
    catch (error) {
        next(error);
    }
};
exports.listNotificationsHandler = listNotificationsHandler;
/**
 * Mark a notification as read for the authenticated user.
 */
const markNotificationReadHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const notificationId = req.params.id;
        const notification = await (0, notificationService_1.markNotificationRead)(notificationId, userId);
        if (!notification) {
            const err = new Error('Notification not found');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            return next(err);
        }
        res.status(200).json({ notification });
    }
    catch (error) {
        next(error);
    }
};
exports.markNotificationReadHandler = markNotificationReadHandler;
/**
 * Mark a notification as unread for the authenticated user.
 */
const markNotificationUnreadHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const notificationId = req.params.id;
        const notification = await (0, notificationService_1.markNotificationUnread)(notificationId, userId);
        if (!notification) {
            const err = new Error('Notification not found or cannot be marked unread');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            return next(err);
        }
        res.status(200).json({ notification });
    }
    catch (error) {
        next(error);
    }
};
exports.markNotificationUnreadHandler = markNotificationUnreadHandler;
/**
 * Delete a notification for the authenticated user.
 */
const deleteNotificationHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const notificationId = req.params.id;
        const deleted = await (0, notificationService_1.deleteNotification)(notificationId, userId);
        if (!deleted) {
            const err = new Error('Notification not found');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            return next(err);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteNotificationHandler = deleteNotificationHandler;
