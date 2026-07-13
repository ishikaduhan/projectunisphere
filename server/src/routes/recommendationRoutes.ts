import { Router } from 'express';
import { z } from 'zod';
import { authenticateJWT } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  getRecommendationsHandler,
  refreshRecommendationsHandler,
  getTrendingEventsHandler,
} from '../controllers/recommendationController';

const router = Router();

const trendingQuerySchema = z.object({
  query: z.object({
    limit: z.string().optional(),
  }),
});

router.get('/', authenticateJWT, getRecommendationsHandler);
router.post('/refresh', authenticateJWT, refreshRecommendationsHandler);
router.get('/trending', authenticateJWT, validate(trendingQuerySchema), getTrendingEventsHandler);

export default router;
