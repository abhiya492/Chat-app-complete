import { useEffect, useState } from 'react';
import { useCircadianStore } from '../store/useCircadianStore';
import { useWellnessStore } from '../store/useWellnessStore';

const CircadianBreakReminder = () => {
  const { currentRecommendations, circadianSettings, timeOfDay } = useCircadianStore();
  const { setBreakReminder } = useWellnessStore();
  const [nextBreakTime, setNextBreakTime] = useState(null);

  useEffect(() => {
    if (!circadianSettings.smartBreaks || !currentRecommendations) return;

    const scheduleAdaptiveBreaks = () => {
      const breakInterval = currentRecommendations.breakInterval * 60000; // Convert to milliseconds
      
      const scheduleBreak = () => {
        setTimeout(() => {
          // Don't show breaks during night time unless it's critical
          if (timeOfDay === 'night' && Math.random() > 0.3) {
            scheduleBreak(); // Reschedule for later
            return;
          }

          setBreakReminder(true);
          setNextBreakTime(new Date(Date.now() + breakInterval));
          scheduleBreak(); // Schedule next break
        }, breakInterval);
      };

      scheduleBreak();
      setNextBreakTime(new Date(Date.now() + breakInterval));
    };

    scheduleAdaptiveBreaks();
  }, [currentRecommendations, circadianSettings.smartBreaks, timeOfDay, setBreakReminder]);

  // Show next break countdown (optional UI element)
  if (!nextBreakTime || timeOfDay === 'night') return null;

  const timeUntilBreak = Math.max(0, Math.floor((nextBreakTime - new Date()) / 60000));

  return (
    <div className="fixed bottom-4 left-4 z-30">
      <div className="bg-base-100/80 backdrop-blur-sm rounded-lg shadow-sm p-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          <span>Next break in {timeUntilBreak}m</span>
        </div>
      </div>
    </div>
  );
};

export default CircadianBreakReminder;