import { useEffect } from 'react';
import { useCircadianStore } from '../store/useCircadianStore';
import { useThemeStore } from '../store/useThemeStore';

const CircadianThemeAdapter = () => {
  const { timeOfDay, currentRecommendations, circadianSettings } = useCircadianStore();
  const { setTheme } = useThemeStore();

  useEffect(() => {
    if (!circadianSettings.autoTheme || !currentRecommendations) return;

    const circadianThemes = {
      morning: 'corporate', // Light, energizing
      afternoon: 'light', // Bright, focused
      evening: 'sunset', // Warm, relaxing
      night: 'dark' // Dark, sleep-friendly
    };

    const recommendedTheme = circadianThemes[timeOfDay];
    if (recommendedTheme) {
      setTheme(recommendedTheme);
    }
  }, [timeOfDay, currentRecommendations, circadianSettings.autoTheme, setTheme]);

  return null; // This is a logic-only component
};

export default CircadianThemeAdapter;