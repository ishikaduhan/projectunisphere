"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const registrationController_1 = require("../controllers/registrationController");
const router = (0, express_1.Router)();
const createRegistrationSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventId: zod_1.z.string().min(1, 'Event ID is required'),
    }),
});
const registrationIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Registration ID is required'),
    }),
});
const registrationQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
    }),
});
router.post('/', auth_1.authenticateJWT, (0, validate_1.validate)(createRegistrationSchema), registrationController_1.createRegistrationHandler);
router.get('/', auth_1.authenticateJWT, (0, validate_1.validate)(registrationQuerySchema), registrationController_1.listRegistrationsHandler);
router.delete('/:id', auth_1.authenticateJWT, (0, validate_1.validate)(registrationIdSchema), registrationController_1.cancelRegistrationHandler);
exports.default = router;
