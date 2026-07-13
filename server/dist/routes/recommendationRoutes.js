"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const recommendationController_1 = require("../controllers/recommendationController");
const router = (0, express_1.Router)();
const trendingQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        limit: zod_1.z.string().optional(),
    }),
});
router.get('/', auth_1.authenticateJWT, recommendationController_1.getRecommendationsHandler);
router.post('/refresh', auth_1.authenticateJWT, recommendationController_1.refreshRecommendationsHandler);
router.get('/trending', auth_1.authenticateJWT, (0, validate_1.validate)(trendingQuerySchema), recommendationController_1.getTrendingEventsHandler);
exports.default = router;
