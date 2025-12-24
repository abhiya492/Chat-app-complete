export const useMoodMusicFallback = () => {
  const generateSearchQuery = (moodCategory, platform) => {
    const searchQueries = {
      distressed: {
        spotify: 'peaceful piano calm relaxing',
        youtube: 'relaxing music meditation calm',
        apple: 'peaceful piano chill'
      },
      melancholy: {
        spotify: 'sad songs indie folk emotional',
        youtube: 'sad music indie emotional songs',
        apple: 'sad indie folk'
      },
      balanced: {
        spotify: 'top hits popular music',
        youtube: 'popular music hits 2024',
        apple: 'top hits today'
      },
      uplifting: {
        spotify: 'happy music good vibes upbeat',
        youtube: 'happy songs feel good music',
        apple: 'feel good hits'
      },
      energetic: {
        spotify: 'workout music high energy pump up',
        youtube: 'workout music high energy',
        apple: 'workout pump up'
      }
    };

    return searchQueries[moodCategory]?.[platform] || 'music';
  };

  const getSearchUrl = (platform, query) => {
    const searchUrls = {
      spotify: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
      youtube: `https://music.youtube.com/search?q=${encodeURIComponent(query)}`,
      apple: `https://music.apple.com/search?term=${encodeURIComponent(query)}`
    };

    return searchUrls[platform];
  };

  return { generateSearchQuery, getSearchUrl };
};