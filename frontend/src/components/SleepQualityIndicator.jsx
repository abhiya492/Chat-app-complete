import { useEffect, useState } from 'react';
import { useHealthStore } from '../store/useHealthStore';
import { Moon, Sun, Clock } from 'lucide-react';

const SleepQualityIndicator = () => {
  const { healthData } = useHealthStore();
  const [sleepStatus, setSleepStatus] = useState(null);

  useEffect(() => {
    const latestData = healthData?.[0];
    if (latestData?.sleep) {
      const sleep = latestData.sleep;
      const now = new Date();
      const currentHour = now.getHours();
      
      // Determine sleep status based on time and data
      if (currentHour >= 22 || currentHour <= 6) {
        // Night time - show sleep recommendations
        setSleepStatus({
          phase: 'bedtime',
          message: sleep.duration < 360 ? 'Consider going to bed soon for better wellness' : 'Good sleep routine!',
          quality: sleep.quality,
          duration: sleep.duration,
          icon: Moon
        });
      } else if (currentHour >= 6 && currentHour <= 10) {
        // Morning - show sleep summary
        setSleepStatus({
          phase: 'morning',
          message: sleep.duration >= 420 ? 'Great sleep! You should feel energized' : 'Short sleep detected - take it easy today',
          quality: sleep.quality,
          duration: sleep.duration,
          icon: Sun
        });
      } else {
        // Day time - minimal display
        setSleepStatus({
          phase: 'day',
          message: `Last night: ${Math.floor(sleep.duration / 60)}h ${sleep.duration % 60}m`,
          quality: sleep.quality,
          duration: sleep.duration,
          icon: Clock
        });
      }
    }
  }, [healthData]);

  if (!sleepStatus) return null;

  const getSleepColor = (quality) => {
    if (quality >= 4) return 'text-success';
    if (quality >= 3) return 'text-warning';
    return 'text-error';
  };

  const IconComponent = sleepStatus.icon;

  return (
    <div className="fixed top-20 left-4 z-30">
      <div className="bg-base-100/90 backdrop-blur-sm rounded-lg shadow-md p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <IconComponent className={`w-4 h-4 ${getSleepColor(sleepStatus.quality)}`} />
          <span className="text-sm font-medium">Sleep Status</span>
        </div>
        
        <div className="text-xs text-base-content/80 mb-2">
          {sleepStatus.message}
        </div>
        
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span>Quality:</span>
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <span key={i} className={i <= sleepStatus.quality ? getSleepColor(sleepStatus.quality) : 'text-base-content/30'}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
          
          {sleepStatus.phase !== 'day' && (
            <div className={`badge badge-xs ${
              sleepStatus.duration >= 420 ? 'badge-success' : 
              sleepStatus.duration >= 360 ? 'badge-warning' : 'badge-error'
            }`}>
              {Math.floor(sleepStatus.duration / 60)}h {sleepStatus.duration % 60}m
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SleepQualityIndicator;