import { create } from 'zustand';

export const useCircadianStore = create((set, get) => ({
  timeOfDay: 'morning',
  circadianSettings: {
    autoTheme: true,
    adaptiveNotifications: true,
    smartBreaks: true,
    sleepMode: true,
  },
  currentRecommendations: null,
  
  updateTimeOfDay: () => {
    const hour = new Date().getHours();
    let timeOfDay;
    
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';
    
    set({ timeOfDay });
    get().updateRecommendations(timeOfDay);
  },
  
  updateRecommendations: (timeOfDay) => {
    const recommendations = {
      morning: {
        theme: 'light',
        notifications: true,
        breakInterval: 45,
        mindfulnessType: 'energizing',
        chatSuggestion: 'Great time for important conversations! 🌅',
        wellnessTip: 'Morning sunlight helps regulate your circadian rhythm',
        features: ['mood_boost', 'energy_tracking', 'goal_setting']
      },
      afternoon: {
        theme: 'auto',
        notifications: true,
        breakInterval: 30,
        mindfulnessType: 'focus',
        chatSuggestion: 'Peak productivity hours - perfect for work chats 💼',
        wellnessTip: 'Stay hydrated and take short breaks',
        features: ['focus_mode', 'productivity_tracking', 'stress_monitoring']
      },
      evening: {
        theme: 'warm',
        notifications: 'reduced',
        breakInterval: 60,
        mindfulnessType: 'relaxing',
        chatSuggestion: 'Wind down with casual conversations 🌆',
        wellnessTip: 'Reduce screen brightness for better sleep',
        features: ['relaxation', 'social_chat', 'reflection']
      },
      night: {
        theme: 'dark',
        notifications: false,
        breakInterval: 90,
        mindfulnessType: 'sleep',
        chatSuggestion: 'Consider limiting screen time before bed 🌙',
        wellnessTip: 'Blue light can disrupt your sleep cycle',
        features: ['sleep_mode', 'do_not_disturb', 'night_filter']
      }
    };
    
    set({ currentRecommendations: recommendations[timeOfDay] });
  },
  
  getOptimalChatScore: () => {
    const hour = new Date().getHours();
    
    if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) return 'excellent';
    if ((hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14)) return 'good';
    if (hour >= 17 && hour <= 20) return 'fair';
    return 'poor';
  },
  
  shouldShowFeature: (feature) => {
    const { timeOfDay } = get();
    const restrictions = {
      night: ['stress_alerts', 'activity_reminders', 'bright_notifications'],
      morning: ['sleep_reminders', 'late_night_features'],
      evening: ['high_energy_activities', 'work_notifications']
    };
    
    return !restrictions[timeOfDay]?.includes(feature);
  },
  
  updateSettings: (newSettings) => {
    set({ circadianSettings: { ...get().circadianSettings, ...newSettings } });
  }
}));