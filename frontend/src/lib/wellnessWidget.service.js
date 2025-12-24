class WellnessWidgetService {
  static async registerWidget() {
    if ('serviceWorker' in navigator && 'widgets' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.widgets.updateByInstanceId('mood-tracker', {
          template: 'mood-tracker-template',
          data: { mood: 3, lastUpdate: Date.now() }
        });
        return true;
      } catch (error) {
        console.log('Widget API not supported:', error);
        return false;
      }
    }
    return false;
  }

  static async updateMoodWidget(moodScore, stressLevel) {
    if ('serviceWorker' in navigator && 'widgets' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.widgets.updateByInstanceId('mood-tracker', {
          template: 'mood-tracker-template',
          data: {
            mood: moodScore,
            stress: stressLevel,
            lastUpdate: Date.now(),
            emoji: this.getMoodEmoji(moodScore)
          }
        });
      } catch (error) {
        console.log('Failed to update widget:', error);
      }
    }
  }

  static getMoodEmoji(score) {
    if (score <= 1) return '😢';
    if (score <= 2) return '😔';
    if (score <= 3) return '😐';
    if (score <= 4) return '😊';
    return '😄';
  }

  static generateWidgetHTML(mood, stress, emoji) {
    return `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  border-radius: 12px; padding: 16px; color: white; 
                  font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 24px;">${emoji}</span>
          <span style="font-weight: 600;">Mood Tracker</span>
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
          Mood: ${mood}/5 • Stress: ${stress}%
        </div>
        <div style="font-size: 12px; opacity: 0.7; margin-top: 4px;">
          Tap to update
        </div>
      </div>
    `;
  }
}

export default WellnessWidgetService;