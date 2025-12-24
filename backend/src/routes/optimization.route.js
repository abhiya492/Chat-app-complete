import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import dataArchiver from '../lib/dataArchiver.js';
import maintenanceScheduler from '../lib/maintenanceScheduler.js';
import cache from '../lib/cache.js';
import createIndexes from '../scripts/createIndexes.js';

const router = express.Router();

// Get archive statistics
router.get('/stats', protectRoute, async (req, res) => {
  try {
    const stats = await dataArchiver.getArchiveStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get maintenance scheduler status
router.get('/scheduler/status', protectRoute, async (req, res) => {
  try {
    const status = maintenanceScheduler.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run manual maintenance task
router.post('/maintenance/:task', protectRoute, async (req, res) => {
  try {
    const { task } = req.params;
    const result = await maintenanceScheduler.runTask(task);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create database indexes
router.post('/indexes', protectRoute, async (req, res) => {
  try {
    await createIndexes();
    res.json({ message: 'Indexes created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cache health check
router.get('/cache/health', protectRoute, async (req, res) => {
  try {
    const isHealthy = await cache.ping();
    res.json({ healthy: isHealthy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cache patterns
router.delete('/cache/:pattern', protectRoute, async (req, res) => {
  try {
    const { pattern } = req.params;
    const deletedCount = await cache.deletePattern(pattern);
    res.json({ deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get archived messages
router.get('/archive/messages/:userId', protectRoute, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const myId = req.user._id;
    
    const result = await dataArchiver.getArchivedMessages(myId, userId, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;