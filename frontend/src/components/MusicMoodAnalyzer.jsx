import { useEffect } from 'react';
import { useMoodMusicStore } from '../store/useMoodMusicStore';
import { useWellnessStore } from '../store/useWellnessStore';
import { useCircadianStore } from '../store/useCircadianStore';

const MusicMoodAnalyzer = () => {
  const { generatePlaylist, musicPreferences } = useMoodMusicStore();
  const { moodScore, stressLevel } = useWellnessStore();
  const { timeOfDay } = useCircadianStore();

  useEffect(() => {
    if (!musicPreferences.adaptToMood) return;

    // Analyze text emotion from recent messages
    const analyzeRecentMessages = () => {
      const messages = document.querySelectorAll('[data-message-text]');
      const recentMessages = Array.from(messages)
        .slice(-5) // Last 5 messages
        .map(el => el.textContent)
        .join(' ');

      if (recentMessages.length < 10) return;

      const emotions = detectEmotionFromText(recentMessages);
      
      // Trigger playlist suggestion based on detected emotion
      if (emotions.intensity > 0.6) {
        generatePlaylist(moodScore, stressLevel, timeOfDay, emotions.primary);
      }
    };

    const interval = setInterval(analyzeRecentMessages, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [moodScore, stressLevel, timeOfDay, musicPreferences.adaptToMood]);

  const detectEmotionFromText = (text) => {
    const emotionKeywords = {
      joy: ['happy', 'excited', 'amazing', 'awesome', 'great', 'love', 'wonderful', 'fantastic', 'brilliant'],
      sadness: ['sad', 'depressed', 'down', 'upset', 'crying', 'hurt', 'lonely', 'disappointed', 'heartbroken'],
      anger: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'hate', 'irritated', 'outraged'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'panic', 'terrified', 'concerned'],
      calm: ['peaceful', 'relaxed', 'calm', 'serene', 'tranquil', 'zen', 'chill', 'mellow'],
      energy: ['pumped', 'energetic', 'hyped', 'motivated', 'driven', 'intense', 'powerful', 'dynamic']
    };

    const words = text.toLowerCase().split(/\s+/);
    const emotionScores = {};

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      emotionScores[emotion] = keywords.filter(keyword => 
        words.some(word => word.includes(keyword))
      ).length;
    });

    const totalMatches = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
    const primaryEmotion = Object.entries(emotionScores).reduce((a, b) => 
      emotionScores[a[0]] > emotionScores[b[0]] ? a : b
    )[0];

    return {
      primary: primaryEmotion,
      intensity: totalMatches / words.length,
      scores: emotionScores
    };
  };

  return null; // This is a logic-only component
};

export default MusicMoodAnalyzer;