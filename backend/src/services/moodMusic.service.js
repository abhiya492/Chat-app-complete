class MoodMusicService {
  static getMoodPlaylists(moodScore, stressLevel, timeOfDay) {
    const playlists = {
      // Very sad (1-2) + high stress
      distressed: {
        spotify: ['37i9dQZF1DX3rxVfibe1L0', '37i9dQZF1DX7qK8ma5wgG1'], // Chill, Peaceful Piano
        youtube: ['PLrAl6rYGSuNBVfhx8Ib-PQnNjEhJGhyNE', 'PLrAl6rYGSuNAjVZAaZbzJnhYXHjx8f8nH'], // Relaxing, Meditation
        apple: ['pl.f4d106fed2bd41149aaacabb233eb5eb', 'pl.567caf87c8b4428c9c2b0e7b5c5c5c5c'], // Chill Mix, Peaceful
        title: 'Calming & Healing',
        description: 'Gentle music to help you feel better'
      },
      
      // Sad (1-2) + low stress  
      melancholy: {
        spotify: ['37i9dQZF1DX59NCqCqJtoH', '37i9dQZF1DX3YSRoSdA634'], // Sad Songs, Indie Folk
        youtube: ['PLrAl6rYGSuNBpJNbqjVZzqzqzqzqzqzq', 'PLrAl6rYGSuNBpJNbqjVZzqzqzqzqzqzr'], // Sad Indie, Melancholy
        apple: ['pl.f4d106fed2bd41149aaacabb233eb5ec', 'pl.567caf87c8b4428c9c2b0e7b5c5c5c5d'],
        title: 'Reflective Moments',
        description: 'Music for introspection and healing'
      },
      
      // Neutral (3)
      balanced: {
        spotify: ['37i9dQZF1DXcBWIGoYBM5M', '37i9dQZF1DX0XUsuxWHRQd'], // Today\'s Top Hits, RapCaviar
        youtube: ['PLrAl6rYGSuNBpJNbqjVZzqzqzqzqzqze', 'PLrAl6rYGSuNBpJNbqjVZzqzqzqzqzqzf'], // Pop Mix, Chill Vibes
        apple: ['pl.f4d106fed2bd41149aaacabb233eb5ef', 'pl.567caf87c8b4428c9c2b0e7b5c5c5c5g'],
        title: 'Everyday Vibes',
        description: 'Perfect background music for any activity'
      },
      
      // Happy (4-5) + low stress
      uplifting: {
        spotify: ['37i9dQZF1DX3rxVfibe1L0', '37i9dQZF1DXdPec7aLTL8x'], // Happy Hits, Good Vibes
        youtube: ['PLrAl6rYGSuNBpJNbqjVZzqzqzqzqzqzh', 'PLrAl6rYGSuNBpJNbqjVZzqzqzqzqzqzi'], // Happy Songs, Upbeat
        apple: ['pl.f4d106fed2bd41149aaacabb233eb5eh', 'pl.567caf87c8b4428c9c2b0e7b5c5c5c5i'],
        title: 'Feel Good Hits',
        description: 'Upbeat songs to boost your mood'
      },
      
      // Happy (4-5) + high energy
      energetic: {
        spotify: ['37i9dQZF1DX76Wlfdnj7AP', '37i9dQZF1DX0XUsuxWHRQd'], // Beast Mode, Workout
        youtube: ['PLrAl6rYGSuNBpJNbqjVZzqzqzqzqzqzj', 'PLrAl6rYGSuNBpJNbqjVZzqzqzqzqzqzk'], // Workout, High Energy
        apple: ['pl.f4d106fed2bd41149aaacabb233eb5ej', 'pl.567caf87c8b4428c9c2b0e7b5c5c5c5k'],
        title: 'High Energy Boost',
        description: 'Pump-up music for maximum energy'
      }
    };

    // Determine mood category
    let category = 'balanced';
    
    if (moodScore <= 2 && stressLevel > 60) category = 'distressed';
    else if (moodScore <= 2) category = 'melancholy';
    else if (moodScore >= 4 && stressLevel < 30) category = 'uplifting';
    else if (moodScore >= 4 && stressLevel > 50) category = 'energetic';

    // Adjust for time of day
    if (timeOfDay === 'night' && category === 'energetic') {
      category = 'uplifting'; // Tone down for night
    }
    
    if (timeOfDay === 'morning' && category === 'melancholy') {
      category = 'balanced'; // Boost for morning
    }

    return playlists[category];
  }

  static generatePlaylistUrl(platform, playlistId) {
    const baseUrls = {
      spotify: 'https://open.spotify.com/playlist/',
      youtube: 'https://youtube.com/playlist?list=',
      apple: 'https://music.apple.com/playlist/'
    };
    
    return baseUrls[platform] + playlistId;
  }

  static getEmotionFromText(text) {
    const emotions = {
      joy: ['happy', 'excited', 'amazing', 'awesome', 'great', 'love', 'wonderful'],
      sadness: ['sad', 'depressed', 'down', 'upset', 'crying', 'hurt', 'lonely'],
      anger: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'hate'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'panic'],
      calm: ['peaceful', 'relaxed', 'calm', 'serene', 'tranquil', 'zen']
    };

    const words = text.toLowerCase().split(' ');
    const detected = {};

    Object.entries(emotions).forEach(([emotion, keywords]) => {
      detected[emotion] = keywords.filter(keyword => 
        words.some(word => word.includes(keyword))
      ).length;
    });

    return Object.entries(detected).reduce((a, b) => 
      detected[a[0]] > detected[b[0]] ? a : b
    )[0];
  }
}

export default MoodMusicService;