import { Router } from 'express';
import { z } from 'zod';
import { authenticateJWT } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  deleteNotificationHandler,
  listNotificationsHandler,
  markNotificationReadHandler,
  markNotificationUnreadHandler,
} from '../controllers/notificationController';

const router = Router();

const notificationQuerySchema = z.object({
  query: z.object({
    status: z.enum(['all', 'queued', 'sent', 'failed', 'read', 'unread']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

const notificationIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Notification ID is required'),
  }),
});

router.get('/', authenticateJWT, validate(notificationQuerySchema), listNotificationsHandler);
router.patch('/:id/read', authenticateJWT, validate(notificationIdSchema), markNotificationReadHandler);
router.patch('/:id/unread', authenticateJWT, validate(notificationIdSchema), markNotificationUnreadHandler);
router.delete('/:id', authenticateJWT, validate(notificationIdSchema), deleteNotificationHandler);

export default router;
