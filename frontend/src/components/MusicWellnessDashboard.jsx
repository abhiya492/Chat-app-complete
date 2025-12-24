import { useState, useEffect } from 'react';
import { useMoodMusicStore } from '../store/useMoodMusicStore';
import { useWellnessStore } from '../store/useWellnessStore';
import { Music, Play, ExternalLink, TrendingUp, Clock } from 'lucide-react';

const MusicWellnessDashboard = () => {
  const { 
    recentSuggestions, 
    musicPreferences, 
    generatePlaylist, 
    getPlaylistUrl,
    clearSuggestions 
  } = useMoodMusicStore();
  const { moodScore, stressLevel } = useWellnessStore();

  const [moodHistory, setMoodHistory] = useState([]);

  useEffect(() => {
    // Track mood changes for music correlation
    setMoodHistory(prev => [...prev.slice(-6), { 
      mood: moodScore, 
      stress: stressLevel, 
      time: new Date().toLocaleTimeString() 
    }]);
  }, [moodScore, stressLevel]);

  const handleManualSuggestion = () => {
    const timeOfDay = new Date().getHours() < 12 ? 'morning' : 
                     new Date().getHours() < 17 ? 'afternoon' : 
                     new Date().getHours() < 22 ? 'evening' : 'night';
    
    generatePlaylist(moodScore, stressLevel, timeOfDay);
  };

  const platforms = [
    { id: 'spotify', name: 'Spotify', color: 'text-green-500', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', color: 'text-red-500', icon: '📺' },
    { id: 'apple', name: 'Apple Music', color: 'text-gray-700', icon: '🍎' }
  ];

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-5 h-5 text-primary" />
          <h3 className="card-title">Mood-Based Music 🎵</h3>
        </div>

        {/* Current Mood Status */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">Current Mood</div>
            <div className="stat-value text-lg">
              {moodScore <= 2 ? '😢' : moodScore <= 3 ? '😐' : moodScore <= 4 ? '😊' : '😄'}
            </div>
            <div className="stat-desc">{moodScore}/5</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">Stress Level</div>
            <div className="stat-value text-lg">
              {stressLevel < 30 ? '😌' : stressLevel < 60 ? '😰' : '🤯'}
            </div>
            <div className="stat-desc">{stressLevel}%</div>
          </div>
        </div>

        {/* Manual Suggestion Button */}
        <button 
          onClick={handleManualSuggestion}
          className="btn btn-primary btn-block mb-4"
        >
          <Music className="w-4 h-4" />
          Get Music Recommendation
        </button>

        {/* Recent Suggestions */}
        {recentSuggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm">Recent Suggestions</h4>
              <button 
                onClick={clearSuggestions}
                className="btn btn-ghost btn-xs"
              >
                Clear
              </button>
            </div>
            
            {recentSuggestions.slice(0, 3).map((playlist, index) => (
              <div key={index} className={`p-3 rounded-lg ${playlist.color}/20 border border-base-300`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-sm">{playlist.title}</div>
                    <div className="text-xs text-base-content/70">{playlist.description}</div>
                  </div>
                  <div className="text-xs text-base-content/60">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {index === 0 ? 'Now' : `${index * 5}m ago`}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {platforms.map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => {
                        const url = getPlaylistUrl(platform.id, playlist[platform.id][0]);
                        window.open(url, '_blank');
                      }}
                      className="btn btn-xs btn-ghost"
                      title={`Open in ${platform.name}`}
                    >
                      <span className="text-xs">{platform.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mood Trend */}
        {moodHistory.length > 3 && (
          <div className="mt-4 p-3 bg-base-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Mood Trend</span>
            </div>
            <div className="flex justify-between text-xs">
              {moodHistory.slice(-5).map((entry, index) => (
                <div key={index} className="text-center">
                  <div className="text-lg">
                    {entry.mood <= 2 ? '😢' : entry.mood <= 3 ? '😐' : entry.mood <= 4 ? '😊' : '😄'}
                  </div>
                  <div className="text-xs text-base-content/60">{entry.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Music Preferences */}
        <div className="mt-4 text-xs text-base-content/60">
          <div>Platform: {platforms.find(p => p.id === musicPreferences.platform)?.name}</div>
          <div>Auto-suggest: {musicPreferences.autoSuggest ? 'On' : 'Off'}</div>
        </div>
      </div>
    </div>
  );
};

export default MusicWellnessDashboard;