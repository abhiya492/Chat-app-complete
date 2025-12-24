import { useState, useEffect } from 'react';
import { useWellnessStore } from '../store/useWellnessStore';

const MoodTracker = () => {
  const { moodScore, updateMood, analyzeMoodFromText } = useWellnessStore();
  const [showTracker, setShowTracker] = useState(false);

  const moods = [
    { score: 1, emoji: '😢', label: 'Very Sad', color: 'text-red-500' },
    { score: 2, emoji: '😔', label: 'Sad', color: 'text-orange-500' },
    { score: 3, emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
    { score: 4, emoji: '😊', label: 'Happy', color: 'text-green-500' },
    { score: 5, emoji: '😄', label: 'Very Happy', color: 'text-blue-500' },
  ];

  const currentMood = moods.find(m => m.score === moodScore) || moods[2];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showTracker ? (
        <button
          onClick={() => setShowTracker(true)}
          className={`btn btn-circle ${currentMood.color} bg-base-200 border-2`}
          title="Track your mood"
        >
          <span className="text-2xl">{currentMood.emoji}</span>
        </button>
      ) : (
        <div className="bg-base-100 rounded-lg shadow-lg p-4 w-64">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">How are you feeling?</h3>
            <button 
              onClick={() => setShowTracker(false)}
              className="btn btn-ghost btn-xs"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-3">
            {moods.map((mood) => (
              <button
                key={mood.score}
                onClick={() => {
                  updateMood(mood.score);
                  setShowTracker(false);
                }}
                className={`btn btn-ghost p-2 ${
                  moodScore === mood.score ? 'bg-primary/20' : ''
                }`}
                title={mood.label}
              >
                <span className="text-2xl">{mood.emoji}</span>
              </button>
            ))}
          </div>
          
          <div className="text-center">
            <span className={`text-sm ${currentMood.color}`}>
              {currentMood.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;