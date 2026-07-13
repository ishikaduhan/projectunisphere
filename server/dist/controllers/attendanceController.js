"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventAttendanceReportHandler = exports.checkInAttendanceHandler = void 0;
const attendanceService_1 = require("../services/attendanceService");
/**
 * Verify a QR token and record attendance for a registered attendee.
 */
const checkInAttendanceHandler = async (req, res, next) => {
    try {
        const scannerId = req.user?.id;
        if (!scannerId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const { qrToken } = req.body;
        const attendance = await (0, attendanceService_1.markAttendanceWithQrToken)(scannerId, qrToken);
        res.status(201).json({ attendance });
    }
    catch (error) {
        next(error);
    }
};
exports.checkInAttendanceHandler = checkInAttendanceHandler;
/**
 * Return attendance report and summary for an event.
 */
const getEventAttendanceReportHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userRoles = req.user?.roles || [];
        if (!userId) {
            const err = new Error('Authentication required');
            err.statusCode = 401;
            err.code = 'UNAUTHORIZED';
            return next(err);
        }
        const eventId = req.params.eventId;
        const report = await (0, attendanceService_1.getEventAttendanceReport)(eventId);
        if (!userRoles.includes('admin')) {
            const isOrganizer = report.event.organizers.some((organizerId) => organizerId.toString() === userId);
            const isCreator = report.event.createdBy.toString() === userId;
            if (!isOrganizer && !isCreator) {
                const err = new Error('You do not have permission to access attendance for this event');
                err.statusCode = 403;
                err.code = 'FORBIDDEN';
                return next(err);
            }
        }
        res.status(200).json(report);
    }
    catch (error) {
        next(error);
    }
};
exports.getEventAttendanceReportHandler = getEventAttendanceReportHandler;
