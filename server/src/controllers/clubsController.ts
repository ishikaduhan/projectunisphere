import { Request, Response, NextFunction } from 'express';
import { createClub, deleteClub, getClubById, getClubs, updateClub } from '../services/clubService';
import { AppError } from '../middlewares/errorHandler';

/**
 * Create a new club.
 */
export const createClubHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      const err: AppError = new Error('Authentication required');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const club = await createClub(req.body, userId);
    res.status(201).json({ club });
  } catch (error) {
    next(error);
  }
};

/**
 * List clubs with query filters.
 */
export const listClubsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, visibility, createdBy, slug, search, page, limit } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const result = await getClubs(
      {
        category: category as string,
        visibility: visibility as 'public' | 'university_only' | 'private',
        createdBy: createdBy as string,
        slug: slug as string,
        search: search as string,
      },
      pageNum,
      limitNum
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a club by ID.
 */
export const getClubHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clubId = req.params.id;
    const club = await getClubById(clubId);
    if (!club) {
      const err: AppError = new Error('Club not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }
    res.status(200).json({ club });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a club by ID.
 */
export const updateClubHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clubId = req.params.id;
    const club = await updateClub(clubId, req.body);
    if (!club) {
      const err: AppError = new Error('Club not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }
    res.status(200).json({ club });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a club by ID.
 */
export const deleteClubHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clubId = req.params.id;
    const club = await deleteClub(clubId);
    if (!club) {
      const err: AppError = new Error('Club not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
