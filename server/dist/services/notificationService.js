"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueEventApprovalNotification = exports.queueRegistrationConfirmation = exports.processQueuedNotifications = exports.deleteNotification = exports.markNotificationUnread = exports.markNotificationRead = exports.getUserNotifications = exports.queueNotification = void 0;
const mongoose_1 = require("mongoose");
const Notification_1 = require("../models/Notification");
const User_1 = require("../models/User");
const mail_1 = require("../utils/mail");
const queueNotification = async (input) => {
    const notification = new Notification_1.Notification({
        userId: new mongoose_1.Types.ObjectId(input.userId),
        type: input.type,
        channel: input.channel,
        title: input.title,
        message: input.message,
        data: input.data,
        scheduledFor: input.scheduledFor || new Date(),
    });
    return notification.save();
};
exports.queueNotification = queueNotification;
const getUserNotifications = async (userId, page = 1, limit = 20, status) => {
    const skip = (page - 1) * limit;
    const query = { userId: new mongoose_1.Types.ObjectId(userId) };
    if (status && status !== 'all') {
        query.status = status === 'unread' ? 'sent' : status;
    }
    const [items, total] = await Promise.all([
        Notification_1.Notification.find(query)
            .sort({ scheduledFor: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        Notification_1.Notification.countDocuments(query).exec(),
    ]);
    return { items, total };
};
exports.getUserNotifications = getUserNotifications;
const markNotificationRead = async (notificationId, userId) => {
    return Notification_1.Notification.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(notificationId), userId: new mongoose_1.Types.ObjectId(userId) }, { status: 'read' }, { new: true }).exec();
};
exports.markNotificationRead = markNotificationRead;
const markNotificationUnread = async (notificationId, userId) => {
    return Notification_1.Notification.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(notificationId), userId: new mongoose_1.Types.ObjectId(userId), status: 'read' }, { status: 'sent' }, { new: true }).exec();
};
exports.markNotificationUnread = markNotificationUnread;
const deleteNotification = async (notificationId, userId) => {
    return Notification_1.Notification.findOneAndDelete({ _id: new mongoose_1.Types.ObjectId(notificationId), userId: new mongoose_1.Types.ObjectId(userId) }).exec();
};
exports.deleteNotification = deleteNotification;
const processQueuedNotifications = async () => {
    const now = new Date();
    const notifications = await Notification_1.Notification.find({ status: 'queued', scheduledFor: { $lte: now } })
        .limit(200)
        .exec();
    let processed = 0;
    let failed = 0;
    for (const notification of notifications) {
        try {
            const user = await User_1.User.findById(notification.userId).exec();
            if (!user) {
                notification.status = 'failed';
                await notification.save();
                failed += 1;
                continue;
            }
            switch (notification.channel) {
                case 'email': {
                    if (!user.settings.notifyEmail) {
                        notification.status = 'failed';
                        notification.message += ' (user email notifications disabled)';
                        await notification.save();
                        failed += 1;
                        break;
                    }
                    await (0, mail_1.sendEmail)(user.email, notification.title, notification.message, `<p>${notification.message}</p>`);
                    notification.status = 'sent';
                    await notification.save();
                    processed += 1;
                    break;
                }
                case 'in_app': {
                    notification.status = 'sent';
                    await notification.save();
                    processed += 1;
                    break;
                }
                case 'push': {
                    if (!user.settings.notifyPush) {
                        notification.status = 'failed';
                        notification.message += ' (user push notifications disabled)';
                        await notification.save();
                        failed += 1;
                        break;
                    }
                    console.info(`[PushNotification] userId=${user._id} title=${notification.title}`);
                    notification.status = 'sent';
                    await notification.save();
                    processed += 1;
                    break;
                }
            }
        }
        catch (error) {
            notification.status = 'failed';
            await notification.save();
            failed += 1;
        }
    }
    return { processed, failed };
};
exports.processQueuedNotifications = processQueuedNotifications;
const queueRegistrationConfirmation = async (registrationId, event, user, qrToken) => {
    const title = `Registered for ${event.title}`;
    const message = `You are ${qrToken ? 'successfully registered' : 'waitlisted'} for ${event.title} on ${new Date(event.schedule.startAt).toLocaleString()}.`;
    await (0, exports.queueNotification)({
        userId: user._id.toString(),
        type: 'event_update',
        channel: 'in_app',
        title,
        message,
        data: {
            eventId: event._id,
            eventTitle: event.title,
        },
    });
    if (user.settings.notifyEmail) {
        await (0, exports.queueNotification)({
            userId: user._id.toString(),
            type: 'event_update',
            channel: 'email',
            title,
            message: `${message}${qrToken ? ` Your QR token is: ${qrToken}` : ''}`,
            data: {
                eventId: event._id,
                eventTitle: event.title,
            },
        });
    }
    const reminderDate = new Date(event.schedule.startAt.getTime() - 60 * 60 * 1000);
    if (reminderDate > new Date()) {
        await (0, exports.queueNotification)({
            userId: user._id.toString(),
            type: 'event_reminder',
            channel: 'in_app',
            title: `Reminder: ${event.title}`,
            message: `Your event ${event.title} starts at ${new Date(event.schedule.startAt).toLocaleString()}.`,
            data: {
                eventId: event._id,
                eventTitle: event.title,
            },
            scheduledFor: reminderDate,
        });
        if (user.settings.notifyEmail) {
            await (0, exports.queueNotification)({
                userId: user._id.toString(),
                type: 'event_reminder',
                channel: 'email',
                title: `Reminder: ${event.title}`,
                message: `Your event ${event.title} starts at ${new Date(event.schedule.startAt).toLocaleString()}.`,
                data: {
                    eventId: event._id,
                    eventTitle: event.title,
                },
                scheduledFor: reminderDate,
            });
        }
    }
};
exports.queueRegistrationConfirmation = queueRegistrationConfirmation;
const queueEventApprovalNotification = async (event, user, approved) => {
    const title = approved ? `Event approved: ${event.title}` : `Event rejected: ${event.title}`;
    const message = approved
        ? `Your event ${event.title} has been approved and is now visible to attendees.`
        : `Your event ${event.title} was rejected. Please review the details and resubmit.`;
    await (0, exports.queueNotification)({
        userId: user._id.toString(),
        type: 'event_update',
        channel: 'in_app',
        title,
        message,
        data: {
            eventId: event._id,
            eventTitle: event.title,
        },
    });
    if (user.settings.notifyEmail) {
        await (0, exports.queueNotification)({
            userId: user._id.toString(),
            type: 'event_update',
            channel: 'email',
            title,
            message,
            data: {
                eventId: event._id,
                eventTitle: event.title,
            },
        });
    }
};
exports.queueEventApprovalNotification = queueEventApprovalNotification;
