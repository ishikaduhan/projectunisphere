"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const User_1 = require("../models/User");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
const updateMeSchema = zod_1.z.object({
    body: zod_1.z.object({
        profile: zod_1.z.object({
            year: zod_1.z.number().int().positive().optional(),
            interests: zod_1.z.array(zod_1.z.string()).optional(),
        }).optional(),
        settings: zod_1.z.object({
            notifyEmail: zod_1.z.boolean().optional(),
            notifyPush: zod_1.z.boolean().optional(),
            timezone: zod_1.z.string().optional(),
        }).optional(),
    }),
});
// 2.1 Get My Profile
router.get('/me', auth_1.authenticateJWT, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const user = await User_1.User.findById(userId).select('-passwordHash');
        if (!user) {
            const err = new Error('User profile not found');
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
    }
    catch (error) {
        next(error);
    }
});
// 2.2 Update My Profile
router.patch('/me', auth_1.authenticateJWT, (0, validate_1.validate)(updateMeSchema), async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { profile, settings } = req.body;
        const updateFields = {};
        if (profile) {
            if (profile.year !== undefined)
                updateFields['profile.year'] = profile.year;
            if (profile.interests !== undefined)
                updateFields['profile.interests'] = profile.interests;
        }
        if (settings) {
            if (settings.notifyEmail !== undefined)
                updateFields['settings.notifyEmail'] = settings.notifyEmail;
            if (settings.notifyPush !== undefined)
                updateFields['settings.notifyPush'] = settings.notifyPush;
            if (settings.timezone !== undefined)
                updateFields['settings.timezone'] = settings.timezone;
        }
        const updatedUser = await User_1.User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true, runValidators: true }).select('-passwordHash');
        if (!updatedUser) {
            const err = new Error('User not found');
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
