import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { authenticateJWT } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

const updateMeSchema = z.object({
  body: z.object({
    profile: z.object({
      year: z.number().int().positive().optional(),
      interests: z.array(z.string()).optional(),
    }).optional(),
    settings: z.object({
      notifyEmail: z.boolean().optional(),
      notifyPush: z.boolean().optional(),
      timezone: z.string().optional(),
    }).optional(),
  }),
});

// 2.1 Get My Profile
router.get('/me', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      const err: AppError = new Error('User profile not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      profile: user.profile,
      settings: user.settings,
    });
  } catch (error) {
    next(error);
  }
});

// 2.2 Update My Profile
router.patch('/me', authenticateJWT, validate(updateMeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { profile, settings } = req.body;

    const updateFields: any = {};
    
    if (profile) {
      if (profile.year !== undefined) updateFields['profile.year'] = profile.year;
      if (profile.interests !== undefined) updateFields['profile.interests'] = profile.interests;
    }
    
    if (settings) {
      if (settings.notifyEmail !== undefined) updateFields['settings.notifyEmail'] = settings.notifyEmail;
      if (settings.notifyPush !== undefined) updateFields['settings.notifyPush'] = settings.notifyPush;
      if (settings.timezone !== undefined) updateFields['settings.timezone'] = settings.timezone;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      const err: AppError = new Error('User not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
