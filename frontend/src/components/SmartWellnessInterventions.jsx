import { useState, useEffect } from 'react';
import { useWellnessStore } from '../store/useWellnessStore';

const SmartWellnessInterventions = () => {
  const { moodScore, stressLevel } = useWellnessStore();
  const [intervention, setIntervention] = useState(null);

  useEffect(() => {
    // Trigger interventions based on wellness data
    if (moodScore <= 2 && stressLevel > 60) {
      setIntervention({
        type: 'crisis',
        title: 'Need Support? 💙',
        message: 'It seems like you might be having a tough time. Would you like to talk to someone?',
        actions: ['Call Helpline', 'Find Therapist', 'Emergency Contact']
      });
    } else if (stressLevel > 80) {
      setIntervention({
        type: 'stress',
        title: 'High Stress Detected 🚨',
        message: 'Your typing patterns suggest high stress. Let\'s take a moment to breathe.',
        actions: ['Breathing Exercise', '5-Min Break', 'Calming Music']
      });
    } else if (moodScore <= 2) {
      setIntervention({
        type: 'mood',
        title: 'Feeling Down? 🌈',
        message: 'Your messages suggest you might be feeling low. Here are some things that might help.',
        actions: ['Gratitude Journal', 'Call Friend', 'Watch Comedy']
      });
    }
  }, [moodScore, stressLevel]);

  if (!intervention) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
        <h3 className="text-xl font-bold mb-3 text-center">{intervention.title}</h3>
        <p className="text-base-content/80 mb-6 text-center">{intervention.message}</p>
        
        <div className="space-y-2">
          {intervention.actions.map((action, index) => (
            <button key={index} className="btn btn-primary btn-block">
              {action}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setIntervention(null)}
          className="btn btn-ghost btn-sm w-full mt-4"
        >
          Not now
        </button>
      </div>
    </div>
  );
};

export default SmartWellnessInterventions;