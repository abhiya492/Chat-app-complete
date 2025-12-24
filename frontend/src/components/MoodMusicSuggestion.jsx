import { useState, useEffect } from 'react';
import { useWellnessStore } from '../store/useWellnessStore';
import { useCircadianStore } from '../store/useCircadianStore';
import { useMoodMusicStore } from '../store/useMoodMusicStore';
import { Music, Play, ExternalLink, X, Settings, Search } from 'lucide-react';
import { useMoodMusicFallback } from '../hooks/useMoodMusicFallback';

const MoodMusicSuggestion = () => {
  const { moodScore, stressLevel } = useWellnessStore();
  const { timeOfDay } = useCircadianStore();
  const { 
    currentPlaylist, 
    musicPreferences, 
    generatePlaylist, 
    getPlaylistUrl, 
    updatePreferences 
  } = useMoodMusicStore();
  
  const { generateSearchQuery, getSearchUrl } = useMoodMusicFallback();
  
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!musicPreferences.autoSuggest) return;

    // Auto-suggest when mood changes significantly
    const shouldSuggest = 
      (moodScore <= 2 && stressLevel > 60) || // Distressed
      (moodScore >= 4 && stressLevel < 30) || // Very happy
      (moodScore <= 2); // Sad

    if (shouldSuggest) {
      const playlist = generatePlaylist(moodScore, stressLevel, timeOfDay);
      setShowSuggestion(true);
    }
  }, [moodScore, stressLevel, timeOfDay, musicPreferences.autoSuggest]);

  const handlePlaylistClick = (playlistId) => {
    const url = getPlaylistUrl(musicPreferences.platform, playlistId);
    window.open(url, '_blank');
  };

  const handleSearchFallback = () => {
    const category = moodScore <= 2 && stressLevel > 60 ? 'distressed' :
                    moodScore <= 2 ? 'melancholy' :
                    moodScore >= 4 && stressLevel < 30 ? 'uplifting' :
                    moodScore >= 4 && stressLevel > 50 ? 'energetic' : 'balanced';
    
    const query = generateSearchQuery(category, musicPreferences.platform);
    const searchUrl = getSearchUrl(musicPreferences.platform, query);
    window.open(searchUrl, '_blank');
  };

  const platforms = [
    { id: 'spotify', name: 'Spotify', color: 'text-green-500' },
    { id: 'youtube', name: 'YouTube', color: 'text-red-500' },
    { id: 'apple', name: 'Apple Music', color: 'text-gray-700' }
  ];

  if (!showSuggestion || !currentPlaylist) return null;

  return (
    <>
      <div className="fixed bottom-20 left-4 max-w-sm z-40">
        <div className="card bg-base-100 shadow-xl border border-primary/20">
          <div className="card-body p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-sm">Music for Your Mood</h4>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => setShowSettings(true)}
                  className="btn btn-ghost btn-xs"
                >
                  <Settings className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setShowSuggestion(false)}
                  className="btn btn-ghost btn-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${currentPlaylist.color}/20 mb-3`}>
              <div className="font-medium text-sm mb-1">{currentPlaylist.title}</div>
              <div className="text-xs text-base-content/70">{currentPlaylist.description}</div>
            </div>

            <div className="space-y-2">
              {currentPlaylist.playlists?.slice(0, 2).map((playlist, index) => (
                <button
                  key={index}
                  onClick={() => window.open(playlist.url, '_blank')}
                  className="btn btn-sm btn-ghost w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-3 h-3" />
                    <span className="text-xs">{playlist.name}</span>
                  </div>
                  <ExternalLink className="w-3 h-3" />
                </button>
              ))}
              
              <button
                onClick={handleSearchFallback}
                className="btn btn-sm btn-outline w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3 h-3" />
                  <span className="text-xs">Search for more</span>
                </div>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="text-xs text-center text-base-content/60 mt-2">
              Playing on {platforms.find(p => p.id === musicPreferences.platform)?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Music Preferences 🎵</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Preferred Platform</span>
                </label>
                <select 
                  value={musicPreferences.platform}
                  onChange={(e) => updatePreferences({ platform: e.target.value })}
                  className="select select-bordered w-full"
                >
                  {platforms.map(platform => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Auto-suggest playlists</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={musicPreferences.autoSuggest}
                    onChange={(e) => updatePreferences({ autoSuggest: e.target.checked })}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Adapt to mood changes</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={musicPreferences.adaptToMood}
                    onChange={(e) => updatePreferences({ adaptToMood: e.target.checked })}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Adapt to time of day</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={musicPreferences.adaptToTime}
                    onChange={(e) => updatePreferences({ adaptToTime: e.target.checked })}
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => setShowSettings(false)}
                className="btn btn-primary flex-1"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MoodMusicSuggestion;