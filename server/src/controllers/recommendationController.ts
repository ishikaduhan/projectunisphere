import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';
import {
  getPersonalizedRecommendations,
  refreshRecommendations,
  getTrendingEvents,
} from '../services/recommendationService';

export const getRecommendationsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const recommendations = await getPersonalizedRecommendations(userId);
    const populated = await recommendations.populate('items.eventId');

    res.status(200).json({
      recommendations: populated.items.map((item) => ({
        score: item.score,
        reasons: item.reasons,
        expiresAt: item.expiresAt,
        event: item.eventId,
      })),
      generatedAt: populated.generatedAt,
      algorithm: populated.algorithm,
      context: populated.context,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshRecommendationsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const recommendations = await refreshRecommendations(userId);
    const populated = await recommendations.populate('items.eventId');

    res.status(200).json({
      recommendations: populated.items.map((item) => ({
        score: item.score,
        reasons: item.reasons,
        expiresAt: item.expiresAt,
        event: item.eventId,
      })),
      generatedAt: populated.generatedAt,
      algorithm: populated.algorithm,
      context: populated.context,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrendingEventsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 10;
    const events = await getTrendingEvents(limit);

    res.status(200).json({ events });
  } catch (error) {
    next(error);
  }
};
