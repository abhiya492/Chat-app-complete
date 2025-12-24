import { useState, useEffect } from 'react';
import { useHealthStore } from '../store/useHealthStore';
import { useWellnessStore } from '../store/useWellnessStore';
import { Activity, Moon, Heart, AlertTriangle } from 'lucide-react';

const HealthBasedWellness = () => {
  const { healthInsights, healthData } = useHealthStore();
  const { moodScore, stressLevel } = useWellnessStore();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    generateHealthWellnessRecommendations();
  }, [healthInsights, moodScore, stressLevel]);

  const generateHealthWellnessRecommendations = () => {
    const recs = [];
    const latestHealth = healthData?.[0];

    // Sleep-based recommendations
    if (latestHealth?.sleep?.duration < 360) { // Less than 6 hours
      recs.push({
        type: 'sleep',
        icon: Moon,
        title: 'Poor Sleep Detected',
        message: 'You got less than 6 hours of sleep. This might affect your mood and stress levels.',
        action: 'Set a bedtime reminder',
        priority: 'high',
        wellnessImpact: 'Your mood might improve with better sleep tonight.'
      });
    }

    // Activity-based recommendations
    if (latestHealth?.fitness?.steps < 5000 && moodScore < 3) {
      recs.push({
        type: 'activity',
        icon: Activity,
        title: 'Low Activity + Low Mood',
        message: 'Physical activity can significantly boost your mood.',
        action: 'Take a 10-minute walk',
        priority: 'medium',
        wellnessImpact: 'Even light exercise releases endorphins that improve mood.'
      });
    }

    // Heart rate + stress correlation
    if (latestHealth?.fitness?.heartRate?.resting > 80 && stressLevel > 60) {
      recs.push({
        type: 'stress',
        icon: Heart,
        title: 'Elevated Heart Rate + Stress',
        message: 'Your resting heart rate and stress levels are both elevated.',
        action: 'Try breathing exercises',
        priority: 'high',
        wellnessImpact: 'Reducing stress can help lower your heart rate.'
      });
    }

    // Energy level recommendations
    if (latestHealth?.wellnessImpact?.energyLevel < 4) {
      recs.push({
        type: 'energy',
        icon: AlertTriangle,
        title: 'Low Energy Detected',
        message: 'Your health data suggests low energy levels today.',
        action: 'Consider a power nap or healthy snack',
        priority: 'medium',
        wellnessImpact: 'Small energy boosts can improve your chat experience.'
      });
    }

    setRecommendations(recs);
  };

  if (recommendations.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 max-w-sm z-40">
      <div className="card bg-base-100 shadow-xl border border-primary/20">
        <div className="card-body p-4">
          <h4 className="font-bold text-sm mb-3">Health + Wellness Insights 🔗</h4>
          
          <div className="space-y-3">
            {recommendations.slice(0, 2).map((rec, index) => {
              const IconComponent = rec.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <IconComponent className={`w-4 h-4 mt-0.5 ${
                      rec.priority === 'high' ? 'text-error' : 'text-warning'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">{rec.title}</div>
                      <div className="text-xs text-base-content/70">{rec.message}</div>
                    </div>
                  </div>
                  
                  <button className="btn btn-xs btn-primary w-full">
                    {rec.action}
                  </button>
                  
                  <div className="text-xs text-primary/70 italic">
                    💡 {rec.wellnessImpact}
                  </div>
                  
                  {index < recommendations.length - 1 && (
                    <div className="divider my-2"></div>
                  )}
                </div>
              );
            })}
          </div>

          {recommendations.length > 2 && (
            <div className="text-center mt-3">
              <button className="btn btn-ghost btn-xs">
                View {recommendations.length - 2} more insights
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthBasedWellness;