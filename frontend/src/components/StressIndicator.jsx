import { useWellnessStore } from '../store/useWellnessStore';

const StressIndicator = () => {
  const { stressLevel } = useWellnessStore();

  const getStressColor = (level) => {
    if (level < 30) return 'text-green-500';
    if (level < 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStressLabel = (level) => {
    if (level < 30) return 'Calm';
    if (level < 60) return 'Moderate';
    return 'High Stress';
  };

  if (stressLevel === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-40">
      <div className="bg-base-100 rounded-lg shadow-md p-3 flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full animate-pulse bg-current" 
             style={{ color: getStressColor(stressLevel) }}></div>
        <span className={`text-sm font-medium ${getStressColor(stressLevel)}`}>
          {getStressLabel(stressLevel)}
        </span>
        {stressLevel > 60 && (
          <span className="text-xs text-base-content/60">
            Take deep breaths
          </span>
        )}
      </div>
    </div>
  );
};

export default StressIndicator;