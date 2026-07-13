"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventAttendanceReport = exports.markAttendanceWithQrToken = exports.validateAttendanceQrToken = exports.isValidObjectId = void 0;
const mongoose_1 = require("mongoose");
const Attendance_1 = require("../models/Attendance");
const Event_1 = require("../models/Event");
const Registration_1 = require("../models/Registration");
const qr_1 = require("../utils/qr");
const isValidObjectId = (id) => mongoose_1.Types.ObjectId.isValid(id);
exports.isValidObjectId = isValidObjectId;
const validateAttendanceQrToken = async (qrToken) => {
    if (!qrToken || typeof qrToken !== 'string') {
        const err = new Error('QR token is required');
        err.statusCode = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    let payload;
    try {
        payload = (0, qr_1.verifyQrToken)(qrToken);
    }
    catch (error) {
        const err = new Error(error.name === 'TokenExpiredError' ? 'QR token has expired' : 'Invalid QR token');
        err.statusCode = 400;
        err.code = 'INVALID_QR_TOKEN';
        throw err;
    }
    const { registrationId, eventId, userId, version } = payload;
    if (!(0, exports.isValidObjectId)(registrationId) || !(0, exports.isValidObjectId)(eventId) || !(0, exports.isValidObjectId)(userId)) {
        const err = new Error('QR token contains invalid identifiers');
        err.statusCode = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const [event, registration] = await Promise.all([
        Event_1.Event.findById(eventId).exec(),
        Registration_1.Registration.findById(registrationId).exec(),
    ]);
    if (!event) {
        const err = new Error('Event not found for QR token');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    if (!registration) {
        const err = new Error('Registration not found for QR token');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    if (registration.eventId.toString() !== eventId || registration.userId.toString() !== userId) {
        const err = new Error('QR token payload does not match registration');
        err.statusCode = 400;
        err.code = 'INVALID_QR_TOKEN';
        throw err;
    }
    const currentSecretVersion = event.qr?.secretVersion || 1;
    if (version !== currentSecretVersion) {
        const err = new Error('QR token version does not match event configuration');
        err.statusCode = 400;
        err.code = 'INVALID_QR_TOKEN';
        throw err;
    }
    if (!event.qr?.checkInEnabled) {
        const err = new Error('QR check-in is not enabled for this event');
        err.statusCode = 400;
        err.code = 'INVALID_OPERATION';
        throw err;
    }
    const qrHash = registration.ticket?.qrTokenHash;
    if (!qrHash) {
        const err = new Error('QR token has not been issued for this registration');
        err.statusCode = 400;
        err.code = 'INVALID_QR_TOKEN';
        throw err;
    }
    if ((0, qr_1.hashQrToken)(qrToken) !== qrHash) {
        const err = new Error('Invalid QR token');
        err.statusCode = 400;
        err.code = 'INVALID_QR_TOKEN';
        throw err;
    }
    if (registration.status !== 'registered') {
        const err = new Error('Only registered attendees can check in');
        err.statusCode = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }
    return { registration, event };
};
exports.validateAttendanceQrToken = validateAttendanceQrToken;
const markAttendanceWithQrToken = async (scannerId, qrToken) => {
    if (!(0, exports.isValidObjectId)(scannerId)) {
        const err = new Error('Authenticated user identifier is invalid');
        err.statusCode = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const { registration, event } = await (0, exports.validateAttendanceQrToken)(qrToken);
    const attendanceExists = await Attendance_1.Attendance.findOne({
        eventId: registration.eventId,
        userId: registration.userId,
    }).exec();
    if (attendanceExists) {
        const err = new Error('Attendance has already been recorded for this user');
        err.statusCode = 409;
        err.code = 'DUPLICATE_ATTENDANCE';
        throw err;
    }
    const attendance = new Attendance_1.Attendance({
        eventId: registration.eventId,
        userId: registration.userId,
        registrationId: registration._id,
        checkIn: {
            status: 'checked_in',
            checkedInAt: new Date(),
            method: 'qr',
            scannedBy: new mongoose_1.Types.ObjectId(scannerId),
        },
    });
    try {
        await attendance.save();
    }
    catch (error) {
        if (error?.code === 11000) {
            const err = new Error('Attendance has already been recorded for this user');
            err.statusCode = 409;
            err.code = 'DUPLICATE_ATTENDANCE';
            throw err;
        }
        throw error;
    }
    event.analytics.checkedInCount = (event.analytics?.checkedInCount || 0) + 1;
    await event.save();
    return attendance;
};
exports.markAttendanceWithQrToken = markAttendanceWithQrToken;
const getEventAttendanceReport = async (eventId) => {
    if (!(0, exports.isValidObjectId)(eventId)) {
        const err = new Error('Invalid event identifier');
        err.statusCode = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const event = await Event_1.Event.findById(eventId).exec();
    if (!event) {
        const err = new Error('Event not found');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    const [attendance, totalRegistered] = await Promise.all([
        Attendance_1.Attendance.find({ eventId: event._id })
            .populate('userId', 'name profile.department email')
            .sort({ 'checkIn.checkedInAt': -1 })
            .lean()
            .exec(),
        Registration_1.Registration.countDocuments({ eventId: event._id, status: 'registered' }).exec(),
    ]);
    const totalCheckedIn = attendance.filter((item) => item.checkIn?.status === 'checked_in').length;
    const totalExcused = attendance.filter((item) => item.checkIn?.status === 'excused').length;
    const totalAbsent = attendance.filter((item) => item.checkIn?.status === 'absent').length;
    const attendanceRate = totalRegistered > 0 ? Number(((totalCheckedIn / totalRegistered) * 100).toFixed(2)) : 0;
    return {
        event,
        attendance,
        statistics: {
            totalRegistered,
            totalCheckedIn,
            totalExcused,
            totalAbsent,
            attendanceRate,
        },
    };
};
exports.getEventAttendanceReport = getEventAttendanceReport;
