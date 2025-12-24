import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  connectDevice,
  getHealthData,
  getHealthInsights,
  syncHealthData,
  disconnectDevice,
} from '../controllers/healthIntegration.controller.js';

const router = express.Router();

router.post('/connect', protectRoute, connectDevice);
router.get('/data', protectRoute, getHealthData);
router.get('/insights', protectRoute, getHealthInsights);
router.post('/sync', protectRoute, syncHealthData);
router.delete('/disconnect/:deviceType', protectRoute, disconnectDevice);

export default router;