import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

export const useWellnessStore = create((set, get) => ({
  wellnessData: null,
  moodScore: 3,
  stressLevel: 0,
  breakReminder: false,
  mindfulnessPrompt: null,
  typingData: { speed: 0, errors: 0, pauses: 0 },
  
  fetchWellnessData: async () => {
    try {
      const res = await axiosInstance.get('/wellness/data');
      set({ wellnessData: res.data });
    } catch (error) {
      console.error('Failed to fetch wellness data:', error);
    }
  },

  updateMood: async (score) => {
    try {
      await axiosInstance.post('/wellness/mood', { score });
      set({ moodScore: score });
    } catch (error) {
      console.error('Failed to update mood:', error);
    }
  },

  recordBreak: async () => {
    try {
      await axiosInstance.post('/wellness/break');
      set({ breakReminder: false });
    } catch (error) {
      console.error('Failed to record break:', error);
    }
  },

  getMindfulnessPrompt: async () => {
    try {
      const res = await axiosInstance.get('/wellness/mindfulness');
      set({ mindfulnessPrompt: res.data.prompt });
    } catch (error) {
      console.error('Failed to get mindfulness prompt:', error);
    }
  },

  updateTypingData: (data) => {
    set({ typingData: data });
    
    // Detect stress from typing patterns
    const { speed, errors, pauses } = data;
    let stressLevel = 0;
    if (speed > 100) stressLevel += 20;
    if (errors > 5) stressLevel += 30;
    if (pauses > 10) stressLevel += 25;
    
    set({ stressLevel: Math.min(100, stressLevel) });
  },

  setBreakReminder: (show) => set({ breakReminder: show }),
  
  analyzeMoodFromText: (text) => {
    const positiveWords = ['happy', 'great', 'awesome', 'love', 'excited'];
    const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful'];
    
    const words = text.toLowerCase().split(' ');
    let score = 3;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.5;
      if (negativeWords.includes(word)) score -= 0.5;
    });
    
    const moodScore = Math.max(1, Math.min(5, Math.round(score)));
    set({ moodScore });
    return moodScore;
  },
}));