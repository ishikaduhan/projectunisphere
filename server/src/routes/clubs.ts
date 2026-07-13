import { Router } from 'express';
import { z } from 'zod';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createClubHandler,
  deleteClubHandler,
  getClubHandler,
  listClubsHandler,
  updateClubHandler,
} from '../controllers/clubsController';

const router = Router();

const clubSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Club name is required'),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain lowercase letters, numbers, and hyphens').optional(),
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required'),
    visibility: z.enum(['public', 'university_only', 'private']).optional(),
    facultyAdvisorId: z.string().optional(),
    members: z.array(
      z.object({
        userId: z.string().min(1),
        role: z.enum(['lead', 'officer', 'member']),
        status: z.enum(['active', 'pending', 'left']).optional(),
      })
    ).optional(),
  }),
});

const clubUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain lowercase letters, numbers, and hyphens').optional(),
    description: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    visibility: z.enum(['public', 'university_only', 'private']).optional(),
    facultyAdvisorId: z.string().optional(),
    members: z.array(
      z.object({
        userId: z.string().min(1),
        role: z.enum(['lead', 'officer', 'member']),
        status: z.enum(['active', 'pending', 'left']).optional(),
      })
    ).optional(),
  }),
});

const clubQuerySchema = z.object({
  query: z.object({
    category: z.string().optional(),
    visibility: z.enum(['public', 'university_only', 'private']).optional(),
    createdBy: z.string().optional(),
    slug: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

router.post('/', authenticateJWT, requireRole(['organizer', 'faculty', 'admin']), validate(clubSchema), createClubHandler);
router.get('/', authenticateJWT, validate(clubQuerySchema), listClubsHandler);
router.get('/:id', authenticateJWT, getClubHandler);
router.patch('/:id', authenticateJWT, requireRole(['organizer', 'faculty', 'admin']), validate(clubUpdateSchema), updateClubHandler);
router.delete('/:id', authenticateJWT, requireRole(['admin']), deleteClubHandler);

export default router;
