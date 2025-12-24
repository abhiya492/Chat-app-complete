import { useEffect, useState } from 'react';
import { useCircadianStore } from '../store/useCircadianStore';
import { Sun, Moon, Sunset, Coffee } from 'lucide-react';

const CircadianWellnessIndicator = () => {
  const { timeOfDay, currentRecommendations, updateTimeOfDay, getOptimalChatScore } = useCircadianStore();
  const [chatScore, setChatScore] = useState('good');

  useEffect(() => {
    updateTimeOfDay();
    setChatScore(getOptimalChatScore());
    
    // Update every 30 minutes
    const interval = setInterval(() => {
      updateTimeOfDay();
      setChatScore(getOptimalChatScore());
    }, 1800000);
    
    return () => clearInterval(interval);
  }, []);

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'morning': return Coffee;
      case 'afternoon': return Sun;
      case 'evening': return Sunset;
      case 'night': return Moon;
      default: return Sun;
    }
  };

  const getScoreColor = (score) => {
    switch (score) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-info';
      case 'fair': return 'text-warning';
      case 'poor': return 'text-error';
      default: return 'text-base-content';
    }
  };

  const TimeIcon = getTimeIcon();

  return (
    <div className="fixed top-20 right-4 z-30">
      <div className="bg-base-100/90 backdrop-blur-sm rounded-lg shadow-md p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <TimeIcon className={`w-4 h-4 ${getScoreColor(chatScore)}`} />
          <span className="text-sm font-medium capitalize">{timeOfDay}</span>
          <div className={`badge badge-xs ${
            chatScore === 'excellent' ? 'badge-success' :
            chatScore === 'good' ? 'badge-info' :
            chatScore === 'fair' ? 'badge-warning' : 'badge-error'
          }`}>
            {chatScore}
          </div>
        </div>
        
        {currentRecommendations && (
          <>
            <div className="text-xs text-base-content/80 mb-2">
              {currentRecommendations.chatSuggestion}
            </div>
            
            <div className="text-xs text-primary/70 italic">
              💡 {currentRecommendations.wellnessTip}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CircadianWellnessIndicator;