import { aiService } from '../services/ai.service.js';

export const getSmartReplies = async (req, res) => {
  try {
    const { messageText } = req.body;
    const replies = await aiService.generateSmartReplies(messageText);
    res.json({ replies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate replies' });
  }
};

export const translateMessage = async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    const result = await aiService.translateMessage(text, targetLang);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' });
  }
};

export const detectSpam = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await aiService.detectSpam(text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Spam detection failed' });
  }
};

export const moderateContent = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await aiService.moderateContent(text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Moderation failed' });
  }
};

export const analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await aiService.analyzeSentiment(text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Sentiment analysis failed' });
  }
};

export const chatbotResponse = async (req, res) => {
  try {
    const { message, history } = req.body;
    const response = await aiService.getChatbotResponse(message, history || []);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Chatbot unavailable' });
  }
};
