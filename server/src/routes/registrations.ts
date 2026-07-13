import { Router } from 'express';
import { z } from 'zod';
import { authenticateJWT } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  cancelRegistrationHandler,
  createRegistrationHandler,
  listRegistrationsHandler,
} from '../controllers/registrationController';

const router = Router();

const createRegistrationSchema = z.object({
  body: z.object({
    eventId: z.string().min(1, 'Event ID is required'),
  }),
});

const registrationIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Registration ID is required'),
  }),
});

const registrationQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

router.post('/', authenticateJWT, validate(createRegistrationSchema), createRegistrationHandler);
router.get('/', authenticateJWT, validate(registrationQuerySchema), listRegistrationsHandler);
router.delete('/:id', authenticateJWT, validate(registrationIdSchema), cancelRegistrationHandler);

export default router;
