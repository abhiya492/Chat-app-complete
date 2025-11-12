import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { 
  getSmartReplies, 
  translateMessage, 
  detectSpam, 
  moderateContent, 
  analyzeSentiment, 
  chatbotResponse 
} from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/smart-replies', protectRoute, getSmartReplies);
router.post('/translate', protectRoute, translateMessage);
router.post('/detect-spam', protectRoute, detectSpam);
router.post('/moderate', protectRoute, moderateContent);
router.post('/sentiment', protectRoute, analyzeSentiment);
router.post('/chatbot', protectRoute, chatbotResponse);

export default router;
