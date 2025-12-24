import { useState, useEffect } from 'react';
import { useWellnessStore } from '../store/useWellnessStore';
import { useHealthStore } from '../store/useHealthStore';
import { axiosInstance } from '../lib/axios';
import HealthIntegration from './HealthIntegration';
import CircadianSettings from './CircadianSettings';
import MusicWellnessDashboard from './MusicWellnessDashboard';
import CBTTechniquesDashboard from './CBTTechniquesDashboard';
import MedicationReminders from './MedicationReminders';

const WellnessDashboard = () => {
  const [stats, setStats] = useState(null);
  const [digitalDetox, setDigitalDetox] = useState(false);
  const [detoxTimer, setDetoxTimer] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get('/wellness/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch wellness stats:', error);
    }
  };

  const startDigitalDetox = (minutes) => {
    setDigitalDetox(true);
    setDetoxTimer(minutes * 60);
    
    const interval = setInterval(() => {
      setDetoxTimer(prev => {
        if (prev <= 1) {
          setDigitalDetox(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (digitalDetox) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Digital Detox 🌿</h2>
          <div className="text-6xl font-mono mb-4">{formatTime(detoxTimer)}</div>
          <p className="text-xl mb-8">Take this time to disconnect and recharge</p>
          <button 
            onClick={() => setDigitalDetox(false)}
            className="btn btn-outline btn-white"
          >
            End Detox
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Wellness Dashboard 🌱</h2>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Average Mood</div>
            <div className="stat-value text-primary">{stats.avgMood?.toFixed(1) || '3.0'}</div>
            <div className="stat-desc">Out of 5.0</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Stress Level</div>
            <div className="stat-value text-warning">{stats.avgStress?.toFixed(0) || '0'}%</div>
            <div className="stat-desc">Average this week</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Breaks Taken</div>
            <div className="stat-value text-success">{stats.totalBreaks || 0}</div>
            <div className="stat-desc">This week</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title">Digital Detox</h3>
            <p>Take a break from screens and notifications</p>
            <div className="card-actions justify-end">
              <button 
                onClick={() => startDigitalDetox(15)}
                className="btn btn-primary btn-sm"
              >
                15 min
              </button>
              <button 
                onClick={() => startDigitalDetox(30)}
                className="btn btn-primary btn-sm"
              >
                30 min
              </button>
              <button 
                onClick={() => startDigitalDetox(60)}
                className="btn btn-primary btn-sm"
              >
                1 hour
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title">Wellness Challenges</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Send 5 positive messages</span>
                <span className="badge badge-success">✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Take 3 mindful breaks</span>
                <span className="badge badge-warning">2/3</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Practice gratitude</span>
                <span className="badge badge-ghost">0/1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Health Integration Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Health Integration 🩺</h2>
        <HealthIntegration />
      </div>
      
      {/* Circadian Wellness Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Circadian Wellness 🌙</h2>
        <CircadianSettings />
      </div>
      
      {/* Mood Music Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Mood-Based Music 🎵</h2>
        <MusicWellnessDashboard />
      </div>
      
      {/* CBT & Therapy Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">CBT Techniques & Coping 🧠</h2>
        <CBTTechniquesDashboard />
      </div>
      
      {/* Medication Reminders Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Medication Management 💊</h2>
        <MedicationReminders />
      </div>
    </div>
  );
};

export default WellnessDashboard;