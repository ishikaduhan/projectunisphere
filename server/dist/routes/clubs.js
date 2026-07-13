"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const clubsController_1 = require("../controllers/clubsController");
const router = (0, express_1.Router)();
const clubSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Club name is required'),
        slug: zod_1.z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain lowercase letters, numbers, and hyphens').optional(),
        description: zod_1.z.string().min(1, 'Description is required'),
        category: zod_1.z.string().min(1, 'Category is required'),
        visibility: zod_1.z.enum(['public', 'university_only', 'private']).optional(),
        facultyAdvisorId: zod_1.z.string().optional(),
        members: zod_1.z.array(zod_1.z.object({
            userId: zod_1.z.string().min(1),
            role: zod_1.z.enum(['lead', 'officer', 'member']),
            status: zod_1.z.enum(['active', 'pending', 'left']).optional(),
        })).optional(),
    }),
});
const clubUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        slug: zod_1.z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain lowercase letters, numbers, and hyphens').optional(),
        description: zod_1.z.string().min(1).optional(),
        category: zod_1.z.string().min(1).optional(),
        visibility: zod_1.z.enum(['public', 'university_only', 'private']).optional(),
        facultyAdvisorId: zod_1.z.string().optional(),
        members: zod_1.z.array(zod_1.z.object({
            userId: zod_1.z.string().min(1),
            role: zod_1.z.enum(['lead', 'officer', 'member']),
            status: zod_1.z.enum(['active', 'pending', 'left']).optional(),
        })).optional(),
    }),
});
const clubQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        category: zod_1.z.string().optional(),
        visibility: zod_1.z.enum(['public', 'university_only', 'private']).optional(),
        createdBy: zod_1.z.string().optional(),
        slug: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
    }),
});
router.post('/', auth_1.authenticateJWT, (0, auth_1.requireRole)(['organizer', 'faculty', 'admin']), (0, validate_1.validate)(clubSchema), clubsController_1.createClubHandler);
router.get('/', auth_1.authenticateJWT, (0, validate_1.validate)(clubQuerySchema), clubsController_1.listClubsHandler);
router.get('/:id', auth_1.authenticateJWT, clubsController_1.getClubHandler);
router.patch('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['organizer', 'faculty', 'admin']), (0, validate_1.validate)(clubUpdateSchema), clubsController_1.updateClubHandler);
router.delete('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['admin']), clubsController_1.deleteClubHandler);
exports.default = router;
