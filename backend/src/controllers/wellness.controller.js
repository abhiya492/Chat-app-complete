import Wellness from '../models/wellness.model.js';
import WellnessService from '../services/wellness.service.js';

export const getWellnessData = async (req, res) => {
  try {
    const { userId } = req.user;
    const wellness = await Wellness.findOne({ 
      userId, 
      date: { $gte: new Date().toDateString() } 
    });
    
    res.json(wellness || { mood: { score: 3 }, stress: { level: 0 } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMood = async (req, res) => {
  try {
    const { userId } = req.user;
    const { score, manual = true } = req.body;
    
    const wellness = await WellnessService.updateWellness(userId, {
      'mood.score': score,
      'mood.manual': manual,
    });
    
    res.json(wellness);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const recordBreak = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const wellness = await WellnessService.updateWellness(userId, {
      $inc: { 'usage.breaksTaken': 1 },
      'usage.lastBreak': new Date(),
    });
    
    res.json({ message: 'Break recorded', wellness });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMindfulnessPrompt = async (req, res) => {
  try {
    const prompt = WellnessService.getMindfulnessPrompt();
    res.json({ prompt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWellnessStats = async (req, res) => {
  try {
    const { userId } = req.user;
    const stats = await Wellness.aggregate([
      { $match: { userId: userId } },
      { $group: {
        _id: null,
        avgMood: { $avg: '$mood.score' },
        avgStress: { $avg: '$stress.level' },
        totalBreaks: { $sum: '$usage.breaksTaken' },
      }}
    ]);
    
    res.json(stats[0] || { avgMood: 3, avgStress: 0, totalBreaks: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWellnessInsights = async (req, res) => {
  try {
    const { userId } = req.user;
    const { timeframe = 'week' } = req.query;
    
    const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const data = await Wellness.find({ 
      userId, 
      date: { $gte: startDate } 
    }).sort({ date: 1 });
    
    const insights = {
      moodTrend: data.length > 1 ? 
        ((data[data.length - 1].mood?.score || 3) - (data[0].mood?.score || 3)) / (data[0].mood?.score || 3) * 100 : 0,
      avgStress: data.reduce((sum, d) => sum + (d.stress?.level || 0), 0) / data.length || 0,
      recommendation: 'Keep maintaining your wellness routine!',
      achievements: ['Consistent mood tracking'],
      optimalChatTime: '2:00 PM - 4:00 PM'
    };
    
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};