class CircadianWellnessService {
  static getTimeOfDay() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  static getCircadianRecommendations(timeOfDay) {
    const recommendations = {
      morning: {
        theme: 'light',
        notifications: true,
        breakInterval: 45, // minutes
        mindfulnessType: 'energizing',
        chatSuggestion: 'Great time for important conversations!',
        wellnessTip: 'Morning sunlight helps regulate your circadian rhythm'
      },
      afternoon: {
        theme: 'auto',
        notifications: true,
        breakInterval: 30,
        mindfulnessType: 'focus',
        chatSuggestion: 'Peak productivity hours - perfect for work chats',
        wellnessTip: 'Stay hydrated and take short breaks'
      },
      evening: {
        theme: 'warm',
        notifications: 'reduced',
        breakInterval: 60,
        mindfulnessType: 'relaxing',
        chatSuggestion: 'Wind down with casual conversations',
        wellnessTip: 'Reduce screen brightness for better sleep'
      },
      night: {
        theme: 'dark',
        notifications: false,
        breakInterval: 90,
        mindfulnessType: 'sleep',
        chatSuggestion: 'Consider limiting screen time before bed',
        wellnessTip: 'Blue light can disrupt your sleep cycle'
      }
    };

    return recommendations[timeOfDay];
  }

  static shouldShowFeature(feature, timeOfDay) {
    const restrictions = {
      night: ['stress_alerts', 'activity_reminders'],
      morning: ['sleep_reminders'],
      evening: ['high_energy_activities']
    };

    return !restrictions[timeOfDay]?.includes(feature);
  }

  static getOptimalChatTimes() {
    return {
      best: ['9-11 AM', '2-4 PM'],
      avoid: ['11 PM - 7 AM'],
      current: this.getCurrentOptimalityScore()
    };
  }

  static getCurrentOptimalityScore() {
    const hour = new Date().getHours();
    
    if (hour >= 9 && hour <= 11) return 'excellent';
    if (hour >= 14 && hour <= 16) return 'excellent';
    if (hour >= 7 && hour <= 9) return 'good';
    if (hour >= 12 && hour <= 14) return 'good';
    if (hour >= 17 && hour <= 20) return 'fair';
    return 'poor';
  }
}

export default CircadianWellnessService;