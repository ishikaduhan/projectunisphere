"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const attendanceController_1 = require("../controllers/attendanceController");
const router = (0, express_1.Router)();
const qrCheckSchema = zod_1.z.object({
    body: zod_1.z.object({
        qrToken: zod_1.z.string().min(1, 'QR token is required'),
    }),
});
const eventIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().min(1, 'Event ID is required'),
    }),
});
router.post('/check-in', auth_1.authenticateJWT, (0, validate_1.validate)(qrCheckSchema), attendanceController_1.checkInAttendanceHandler);
router.get('/events/:eventId/report', auth_1.authenticateJWT, (0, auth_1.requireRole)(['organizer', 'admin']), (0, validate_1.validate)(eventIdSchema), attendanceController_1.getEventAttendanceReportHandler);
exports.default = router;
