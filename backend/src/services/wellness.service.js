import Wellness from '../models/wellness.model.js';

class WellnessService {
  // Analyze mood from message content
  static analyzeMood(text) {
    const positiveWords = ['happy', 'great', 'awesome', 'love', 'excited', 'good', 'amazing', 'wonderful'];
    const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'bad', 'horrible', 'depressed'];
    
    const words = text.toLowerCase().split(' ');
    let score = 3; // neutral
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.5;
      if (negativeWords.includes(word)) score -= 0.5;
    });
    
    return Math.max(1, Math.min(5, Math.round(score)));
  }

  // Detect stress from typing patterns
  static analyzeStress(typingData) {
    const { speed, errors, pauses } = typingData;
    let stressLevel = 0;
    
    if (speed > 100) stressLevel += 20; // Fast typing
    if (errors > 5) stressLevel += 30; // Many errors
    if (pauses > 10) stressLevel += 25; // Frequent pauses
    
    return Math.min(100, stressLevel);
  }

  // Check if user needs a break
  static needsBreak(userId, currentUsage) {
    const { screenTime, lastBreak } = currentUsage;
    const timeSinceBreak = Date.now() - (lastBreak || 0);
    
    return screenTime > 60 || timeSinceBreak > 3600000; // 1 hour
  }

  // Get mindfulness prompt
  static getMindfulnessPrompt() {
    const prompts = [
      "Take a deep breath and notice how you're feeling right now.",
      "What are three things you're grateful for today?",
      "How is your body feeling in this moment?",
      "What positive intention can you set for this conversation?",
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  // Update wellness data
  static async updateWellness(userId, data) {
    const today = new Date().toDateString();
    
    return await Wellness.findOneAndUpdate(
      { userId, date: { $gte: new Date(today) } },
      { $set: data },
      { upsert: true, new: true }
    );
  }
}

export default WellnessService;