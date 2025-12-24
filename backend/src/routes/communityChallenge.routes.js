import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getActiveChallenges,
  joinChallenge,
  updateChallengeProgress,
  getChallengeLeaderboard,
  getUserChallenges,
  getGlobalStats,
} from '../controllers/communityChallenge.controller.js';

const router = express.Router();

router.get('/active', protectRoute, getActiveChallenges);
router.get('/my-challenges', protectRoute, getUserChallenges);
router.get('/global-stats', protectRoute, getGlobalStats);
router.get('/leaderboard/:challengeId', protectRoute, getChallengeLeaderboard);
router.post('/join/:challengeId', protectRoute, joinChallenge);
router.put('/progress/:challengeId', protectRoute, updateChallengeProgress);

export default router;