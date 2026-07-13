"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const eventsController_1 = require("../controllers/eventsController");
const router = (0, express_1.Router)();
const eventSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required'),
        description: zod_1.z.string().min(1, 'Description is required'),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        clubId: zod_1.z.string().optional(),
        organizers: zod_1.z.array(zod_1.z.string()).optional(),
        schedule: zod_1.z.object({
            startAt: zod_1.z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid start date'),
            endAt: zod_1.z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid end date'),
            timezone: zod_1.z.string().optional(),
        }),
        location: zod_1.z.object({
            mode: zod_1.z.enum(['offline', 'online', 'hybrid']),
            venue: zod_1.z.string().optional(),
            room: zod_1.z.string().optional(),
            meetingUrl: zod_1.z.string().url().optional(),
        }),
        capacity: zod_1.z.object({
            limit: zod_1.z.number().int().positive().optional(),
            waitlistEnabled: zod_1.z.boolean().optional(),
        }).optional(),
        registration: zod_1.z.object({
            openAt: zod_1.z.string().optional(),
            closeAt: zod_1.z.string().optional(),
            requiresApproval: zod_1.z.boolean().optional(),
        }).optional(),
        qr: zod_1.z.object({
            checkInEnabled: zod_1.z.boolean().optional(),
            secretVersion: zod_1.z.number().int().positive().optional(),
        }).optional(),
    }),
});
const eventUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().min(1).optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        clubId: zod_1.z.string().optional(),
        organizers: zod_1.z.array(zod_1.z.string()).optional(),
        schedule: zod_1.z.object({
            startAt: zod_1.z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid start date').optional(),
            endAt: zod_1.z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid end date').optional(),
            timezone: zod_1.z.string().optional(),
        }).optional(),
        location: zod_1.z.object({
            mode: zod_1.z.enum(['offline', 'online', 'hybrid']).optional(),
            venue: zod_1.z.string().optional(),
            room: zod_1.z.string().optional(),
            meetingUrl: zod_1.z.string().url().optional(),
        }).optional(),
        capacity: zod_1.z.object({
            limit: zod_1.z.number().int().positive().optional(),
            waitlistEnabled: zod_1.z.boolean().optional(),
        }).optional(),
        registration: zod_1.z.object({
            openAt: zod_1.z.string().optional(),
            closeAt: zod_1.z.string().optional(),
            requiresApproval: zod_1.z.boolean().optional(),
        }).optional(),
        qr: zod_1.z.object({
            checkInEnabled: zod_1.z.boolean().optional(),
            secretVersion: zod_1.z.number().int().positive().optional(),
        }).optional(),
    }),
});
const eventApproveSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['approved', 'rejected']),
        feedback: zod_1.z.string().optional(),
    }),
});
const eventQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        clubId: zod_1.z.string().optional(),
        status: zod_1.z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        locationMode: zod_1.z.enum(['offline', 'online', 'hybrid']).optional(),
        tags: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
        search: zod_1.z.string().optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
    }),
});
router.post('/', auth_1.authenticateJWT, (0, auth_1.requireRole)(['organizer', 'faculty', 'admin']), (0, validate_1.validate)(eventSchema), eventsController_1.createEventHandler);
router.get('/', auth_1.authenticateJWT, (0, validate_1.validate)(eventQuerySchema), eventsController_1.listEventsHandler);
router.get('/analytics', auth_1.authenticateJWT, eventsController_1.analyticsEventHandler);
router.post('/:id/submit', auth_1.authenticateJWT, (0, auth_1.requireRole)(['organizer', 'faculty', 'admin']), eventsController_1.submitEventForApprovalHandler);
router.post('/:id/approval', auth_1.authenticateJWT, (0, auth_1.requireRole)(['faculty', 'admin']), (0, validate_1.validate)(eventApproveSchema), eventsController_1.approveEventHandler);
router.get('/:id', auth_1.authenticateJWT, eventsController_1.getEventHandler);
router.patch('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['organizer', 'faculty', 'admin']), (0, validate_1.validate)(eventUpdateSchema), eventsController_1.updateEventHandler);
router.delete('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['organizer', 'faculty', 'admin']), eventsController_1.deleteEventHandler);
exports.default = router;
