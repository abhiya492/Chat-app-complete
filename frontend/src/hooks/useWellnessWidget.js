import { useEffect } from 'react';
import { useWellnessStore } from '../store/useWellnessStore';
import WellnessWidgetService from '../lib/wellnessWidget.service';

export const useWellnessWidget = () => {
  const { moodScore, stressLevel } = useWellnessStore();

  useEffect(() => {
    // Update widget when mood changes
    WellnessWidgetService.updateMoodWidget(moodScore, stressLevel);
  }, [moodScore, stressLevel]);

  useEffect(() => {
    // Listen for widget messages
    const handleWidgetMessage = (event) => {
      if (event.data?.type === 'MOOD_UPDATE') {
        const { mood } = event.data.data;
        useWellnessStore.getState().updateMood(mood);
      }
    };

    window.addEventListener('message', handleWidgetMessage);
    return () => window.removeEventListener('message', handleWidgetMessage);
  }, []);

  const installWidget = async () => {
    return await WellnessWidgetService.registerWidget();
  };

  return { installWidget };
};