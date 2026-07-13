import { Router } from 'express';
import { z } from 'zod';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { checkInAttendanceHandler, getEventAttendanceReportHandler } from '../controllers/attendanceController';

const router = Router();

const qrCheckSchema = z.object({
  body: z.object({
    qrToken: z.string().min(1, 'QR token is required'),
  }),
});

const eventIdSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, 'Event ID is required'),
  }),
});

router.post('/check-in', authenticateJWT, validate(qrCheckSchema), checkInAttendanceHandler);
router.get('/events/:eventId/report', authenticateJWT, requireRole(['organizer', 'admin']), validate(eventIdSchema), getEventAttendanceReportHandler);

export default router;
