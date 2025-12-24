import { create } from 'zustand';
import MusicAPIService from '../lib/musicAPI.service';

export const useMoodMusicStore = create((set, get) => ({
  currentPlaylist: null,
  musicPreferences: {
    platform: 'spotify', // spotify, youtube, apple
    autoSuggest: true,
    adaptToMood: true,
    adaptToTime: true,
  },
  recentSuggestions: [],
  
  generatePlaylist: async (moodScore, stressLevel, timeOfDay, emotion = null) => {
    // Determine mood category
    let category = 'balanced';
    
    if (moodScore <= 2 && stressLevel > 60) category = 'distressed';
    else if (moodScore <= 2) category = 'melancholy';
    else if (moodScore >= 4 && stressLevel < 30) category = 'uplifting';
    else if (moodScore >= 4 && stressLevel > 50) category = 'energetic';

    // Time adjustments
    if (timeOfDay === 'night' && category === 'energetic') category = 'uplifting';
    if (timeOfDay === 'morning' && category === 'melancholy') category = 'balanced';

    const { musicPreferences } = get();
    
    try {
      const result = await MusicAPIService.fetchPlaylistsForMood(category, musicPreferences.platform);
      
      const playlist = {
        category,
        playlists: result.playlists,
        title: get().getCategoryTitle(category),
        description: get().getCategoryDescription(category),
        color: get().getCategoryColor(category)
      };
      
      set({ currentPlaylist: playlist });
      
      // Add to recent suggestions
      const recent = get().recentSuggestions;
      set({ 
        recentSuggestions: [playlist, ...recent.slice(0, 4)] 
      });
      
      return playlist;
    } catch (error) {
      console.error('Failed to generate playlist:', error);
      return null;
    }
  },

  getCategoryTitle: (category) => {
    const titles = {
      distressed: 'Calming & Healing 🕊️',
      melancholy: 'Reflective Moments 🌧️',
      balanced: 'Everyday Vibes ☀️',
      uplifting: 'Feel Good Hits 😊',
      energetic: 'High Energy Boost ⚡'
    };
    return titles[category] || 'Music Mix';
  },

  getCategoryDescription: (category) => {
    const descriptions = {
      distressed: 'Gentle music to help you feel better',
      melancholy: 'Music for introspection and healing',
      balanced: 'Perfect background music for any activity',
      uplifting: 'Upbeat songs to boost your mood',
      energetic: 'Pump-up music for maximum energy'
    };
    return descriptions[category] || 'Curated music for your mood';
  },

  getCategoryColor: (category) => {
    const colors = {
      distressed: 'bg-blue-500',
      melancholy: 'bg-gray-500',
      balanced: 'bg-yellow-500',
      uplifting: 'bg-green-500',
      energetic: 'bg-red-500'
    };
    return colors[category] || 'bg-primary';
  },



  updatePreferences: (newPrefs) => {
    set({ 
      musicPreferences: { ...get().musicPreferences, ...newPrefs } 
    });
  },

  clearSuggestions: () => {
    set({ recentSuggestions: [], currentPlaylist: null });
  }
}));