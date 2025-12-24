import { useState, useEffect } from 'react';
import { useWellnessStore } from '../store/useWellnessStore';

const BreakReminder = () => {
  const { breakReminder, recordBreak, setBreakReminder } = useWellnessStore();
  const [screenTime, setScreenTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScreenTime(prev => prev + 1);
      
      // Show break reminder every 30 minutes
      if (screenTime > 0 && screenTime % 30 === 0) {
        setBreakReminder(true);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [screenTime, setBreakReminder]);

  const takeBreak = () => {
    recordBreak();
    setScreenTime(0);
  };

  const dismissReminder = () => {
    setBreakReminder(false);
  };

  if (!breakReminder) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="alert alert-info shadow-lg">
        <div className="flex-1">
          <div className="flex flex-col">
            <h3 className="font-bold">Time for a break! 🌱</h3>
            <p className="text-sm">You've been chatting for {screenTime} minutes. Take a moment to rest your eyes and stretch.</p>
          </div>
        </div>
        <div className="flex-none">
          <button onClick={takeBreak} className="btn btn-sm btn-primary">
            Take Break
          </button>
          <button onClick={dismissReminder} className="btn btn-sm btn-ghost ml-2">
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreakReminder;