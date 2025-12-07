import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { aiLimiter } from '../middleware/rateLimiter.middleware.js';
import { 
  getSmartReplies, 
  translateMessage, 
  detectSpam, 
  moderateContent, 
  analyzeSentiment, 
  chatbotResponse 
} from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/smart-replies', protectRoute, aiLimiter, getSmartReplies);
router.post('/translate', protectRoute, aiLimiter, translateMessage);
router.post('/detect-spam', protectRoute, aiLimiter, detectSpam);
router.post('/moderate', protectRoute, aiLimiter, moderateContent);
router.post('/sentiment', protectRoute, aiLimiter, analyzeSentiment);
router.post('/chatbot', protectRoute, aiLimiter, chatbotResponse);

export default router;
