import { Router } from 'express';
import { z } from 'zod';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  approveEventHandler,
  analyticsEventHandler,
  createEventHandler,
  deleteEventHandler,
  getEventHandler,
  listEventsHandler,
  submitEventForApprovalHandler,
  updateEventHandler,
} from '../controllers/eventsController';

const router = Router();

const eventSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    tags: z.array(z.string()).optional(),
    clubId: z.string().optional(),
    organizers: z.array(z.string()).optional(),
    schedule: z.object({
      startAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid start date'),
      endAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid end date'),
      timezone: z.string().optional(),
    }),
    location: z.object({
      mode: z.enum(['offline', 'online', 'hybrid']),
      venue: z.string().optional(),
      room: z.string().optional(),
      meetingUrl: z.string().url().optional(),
    }),
    capacity: z.object({
      limit: z.number().int().positive().optional(),
      waitlistEnabled: z.boolean().optional(),
    }).optional(),
    registration: z.object({
      openAt: z.string().optional(),
      closeAt: z.string().optional(),
      requiresApproval: z.boolean().optional(),
    }).optional(),
    qr: z.object({
      checkInEnabled: z.boolean().optional(),
      secretVersion: z.number().int().positive().optional(),
    }).optional(),
  }),
});

const eventUpdateSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    tags: z.array(z.string()).optional(),
    clubId: z.string().optional(),
    organizers: z.array(z.string()).optional(),
    schedule: z.object({
      startAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid start date').optional(),
      endAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid end date').optional(),
      timezone: z.string().optional(),
    }).optional(),
    location: z.object({
      mode: z.enum(['offline', 'online', 'hybrid']).optional(),
      venue: z.string().optional(),
      room: z.string().optional(),
      meetingUrl: z.string().url().optional(),
    }).optional(),
    capacity: z.object({
      limit: z.number().int().positive().optional(),
      waitlistEnabled: z.boolean().optional(),
    }).optional(),
    registration: z.object({
      openAt: z.string().optional(),
      closeAt: z.string().optional(),
      requiresApproval: z.boolean().optional(),
    }).optional(),
    qr: z.object({
      checkInEnabled: z.boolean().optional(),
      secretVersion: z.number().int().positive().optional(),
    }).optional(),
  }),
});

const eventApproveSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
    feedback: z.string().optional(),
  }),
});

const eventQuerySchema = z.object({
  query: z.object({
    clubId: z.string().optional(),
    status: z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    locationMode: z.enum(['offline', 'online', 'hybrid']).optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

router.post('/', authenticateJWT, requireRole(['organizer', 'faculty', 'admin']), validate(eventSchema), createEventHandler);
router.get('/', authenticateJWT, validate(eventQuerySchema), listEventsHandler);
router.get('/analytics', authenticateJWT, analyticsEventHandler);
router.post('/:id/submit', authenticateJWT, requireRole(['organizer', 'faculty', 'admin']), submitEventForApprovalHandler);
router.post('/:id/approval', authenticateJWT, requireRole(['faculty', 'admin']), validate(eventApproveSchema), approveEventHandler);
router.get('/:id', authenticateJWT, getEventHandler);
router.patch('/:id', authenticateJWT, requireRole(['organizer', 'faculty', 'admin']), validate(eventUpdateSchema), updateEventHandler);
router.delete('/:id', authenticateJWT, requireRole(['organizer', 'faculty', 'admin']), deleteEventHandler);

export default router;
