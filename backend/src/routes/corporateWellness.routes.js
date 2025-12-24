import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getTeamDashboard,
  getOrganizationOverview,
  getWellnessTrends,
  generateWellnessReport,
  getTeamRecommendations,
} from '../controllers/corporateWellness.controller.js';

const router = express.Router();

router.get('/team/:organizationId/:teamId', protectRoute, getTeamDashboard);
router.get('/organization/:organizationId', protectRoute, getOrganizationOverview);
router.get('/trends/:organizationId', protectRoute, getWellnessTrends);
router.post('/report', protectRoute, generateWellnessReport);
router.get('/recommendations/:organizationId/:teamId', protectRoute, getTeamRecommendations);

export default router;