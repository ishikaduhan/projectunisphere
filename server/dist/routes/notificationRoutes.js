"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const notificationController_1 = require("../controllers/notificationController");
const router = (0, express_1.Router)();
const notificationQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.enum(['all', 'queued', 'sent', 'failed', 'read', 'unread']).optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
    }),
});
const notificationIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Notification ID is required'),
    }),
});
router.get('/', auth_1.authenticateJWT, (0, validate_1.validate)(notificationQuerySchema), notificationController_1.listNotificationsHandler);
router.patch('/:id/read', auth_1.authenticateJWT, (0, validate_1.validate)(notificationIdSchema), notificationController_1.markNotificationReadHandler);
router.patch('/:id/unread', auth_1.authenticateJWT, (0, validate_1.validate)(notificationIdSchema), notificationController_1.markNotificationUnreadHandler);
router.delete('/:id', auth_1.authenticateJWT, (0, validate_1.validate)(notificationIdSchema), notificationController_1.deleteNotificationHandler);
exports.default = router;
