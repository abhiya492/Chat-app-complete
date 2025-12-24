class MusicAPIService {
  static async getSpotifyPlaylists(moodCategory) {
    const searchQueries = {
      distressed: 'peaceful piano calm meditation',
      melancholy: 'sad indie folk emotional',
      balanced: 'top hits popular music',
      uplifting: 'happy feel good upbeat',
      energetic: 'workout high energy pump up'
    };

    const query = searchQueries[moodCategory];
    return {
      playlists: [
        { id: `search:${query}`, name: `${moodCategory} Mix`, url: `https://open.spotify.com/search/${encodeURIComponent(query)}` }
      ]
    };
  }

  static async getYouTubePlaylists(moodCategory) {
    const searchQueries = {
      distressed: 'relaxing music meditation calm',
      melancholy: 'sad music indie emotional',
      balanced: 'popular music hits 2024',
      uplifting: 'happy songs feel good',
      energetic: 'workout music high energy'
    };

    const query = searchQueries[moodCategory];
    return {
      playlists: [
        { id: `search:${query}`, name: `${moodCategory} Mix`, url: `https://music.youtube.com/search?q=${encodeURIComponent(query)}` }
      ]
    };
  }

  static async fetchPlaylistsForMood(moodCategory, platform) {
    switch (platform) {
      case 'spotify':
        return await this.getSpotifyPlaylists(moodCategory);
      case 'youtube':
        return await this.getYouTubePlaylists(moodCategory);
      default:
        return { playlists: [] };
    }
  }
}

export default MusicAPIService;