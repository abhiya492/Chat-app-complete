import { useState, useEffect } from 'react';
import { useWellnessStore } from '../store/useWellnessStore';

const WellnessGameification = () => {
  const [achievements, setAchievements] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);

  const wellnessAchievements = [
    { id: 'mood_tracker', name: 'Mood Master', desc: 'Track mood for 7 days', icon: '🎭', xp: 100 },
    { id: 'break_taker', name: 'Break Champion', desc: 'Take 10 wellness breaks', icon: '☕', xp: 150 },
    { id: 'mindful_moments', name: 'Zen Master', desc: 'Complete 5 mindfulness exercises', icon: '🧘', xp: 200 },
    { id: 'stress_manager', name: 'Calm Keeper', desc: 'Keep stress below 30% for 3 days', icon: '😌', xp: 250 },
    { id: 'positive_vibes', name: 'Sunshine Spreader', desc: 'Send 20 positive messages', icon: '🌞', xp: 180 },
    { id: 'wellness_buddy', name: 'Support Squad', desc: 'Help 3 friends with wellness', icon: '🤝', xp: 300 }
  ];

  const calculateLevel = (totalXp) => {
    return Math.floor(totalXp / 500) + 1;
  };

  const getNextLevelXp = (currentLevel) => {
    return currentLevel * 500;
  };

  const unlockAchievement = (achievementId) => {
    const achievement = wellnessAchievements.find(a => a.id === achievementId);
    if (achievement && !achievements.includes(achievementId)) {
      setAchievements(prev => [...prev, achievementId]);
      setXp(prev => {
        const newXp = prev + achievement.xp;
        setLevel(calculateLevel(newXp));
        return newXp;
      });
      
      // Show celebration
      return achievement;
    }
  };

  return (
    <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title">Wellness Journey 🎮</h3>
          <div className="badge badge-primary badge-lg">Level {level}</div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>XP: {xp}</span>
            <span>Next: {getNextLevelXp(level)}</span>
          </div>
          <progress 
            className="progress progress-primary w-full" 
            value={xp % 500} 
            max="500"
          ></progress>
        </div>

        {/* Current Streak */}
        <div className="stat bg-base-200 rounded-lg mb-4 p-3">
          <div className="stat-title text-xs">Wellness Streak</div>
          <div className="stat-value text-lg">🔥 {currentStreak} days</div>
          <div className="stat-desc">Keep it up!</div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-2 gap-2">
          {wellnessAchievements.map(achievement => {
            const isUnlocked = achievements.includes(achievement.id);
            return (
              <div 
                key={achievement.id}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isUnlocked 
                    ? 'bg-success/20 border-success' 
                    : 'bg-base-200 border-base-300 opacity-60'
                }`}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-xs font-semibold">{achievement.name}</div>
                <div className="text-xs text-base-content/60">{achievement.desc}</div>
                {isUnlocked && (
                  <div className="badge badge-success badge-xs mt-1">+{achievement.xp} XP</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Daily Challenge */}
        <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/30">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">Today's Challenge</div>
              <div className="text-xs text-base-content/70">Send 3 encouraging messages</div>
            </div>
            <div className="text-2xl">🎯</div>
          </div>
          <progress className="progress progress-accent w-full mt-2" value="1" max="3"></progress>
          <div className="text-xs text-right mt-1">1/3 completed</div>
        </div>
      </div>
    </div>
  );
};

export default WellnessGameification;