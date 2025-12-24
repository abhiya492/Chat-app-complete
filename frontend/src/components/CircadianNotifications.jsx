import { useEffect } from 'react';
import { useCircadianStore } from '../store/useCircadianStore';

const CircadianNotifications = () => {
  const { timeOfDay, currentRecommendations, circadianSettings, shouldShowFeature } = useCircadianStore();

  useEffect(() => {
    if (!circadianSettings.adaptiveNotifications) return;

    // Adjust notification behavior based on time
    const adjustNotifications = () => {
      if (timeOfDay === 'night') {
        // Enable Do Not Disturb mode
        document.body.classList.add('night-mode');
        
        // Reduce notification volume/intensity
        if ('Notification' in window) {
          // In a real app, you'd adjust notification settings here
          console.log('Night mode: Notifications muted');
        }
      } else {
        document.body.classList.remove('night-mode');
        console.log(`${timeOfDay} mode: Normal notifications`);
      }
    };

    adjustNotifications();
  }, [timeOfDay, circadianSettings.adaptiveNotifications]);

  // Show time-appropriate wellness notifications
  useEffect(() => {
    if (!currentRecommendations) return;

    const showCircadianNotification = () => {
      // Morning energy boost
      if (timeOfDay === 'morning' && shouldShowFeature('morning_boost')) {
        setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification('Good Morning! 🌅', {
              body: currentRecommendations.wellnessTip,
              icon: '/avatar.png'
            });
          }
        }, 5000);
      }

      // Evening wind-down reminder
      if (timeOfDay === 'evening' && shouldShowFeature('evening_reminder')) {
        setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification('Time to Wind Down 🌆', {
              body: 'Consider reducing screen brightness and having calmer conversations.',
              icon: '/avatar.png'
            });
          }
        }, 10000);
      }

      // Night sleep reminder
      if (timeOfDay === 'night' && shouldShowFeature('sleep_reminder')) {
        setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification('Sleep Time Approaching 🌙', {
              body: 'Blue light can disrupt sleep. Consider ending your chat session soon.',
              icon: '/avatar.png'
            });
          }
        }, 15000);
      }
    };

    showCircadianNotification();
  }, [timeOfDay, currentRecommendations, shouldShowFeature]);

  return null;
};

export default CircadianNotifications;