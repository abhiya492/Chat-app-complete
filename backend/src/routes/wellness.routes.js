import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getWellnessData,
  updateMood,
  recordBreak,
  getMindfulnessPrompt,
  getWellnessStats,
  getWellnessInsights,
} from '../controllers/wellness.controller.js';

const router = express.Router();

router.get('/data', protectRoute, getWellnessData);
router.post('/mood', protectRoute, updateMood);
router.post('/break', protectRoute, recordBreak);
router.get('/mindfulness', protectRoute, getMindfulnessPrompt);
router.get('/stats', protectRoute, getWellnessStats);
router.get('/insights', protectRoute, getWellnessInsights);

export default router;