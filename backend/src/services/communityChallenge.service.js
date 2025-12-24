import CommunityChallenge from '../models/communityChallenge.model.js';

class CommunityChallengeService {
  static async createChallenge(challengeData) {
    const challenge = new CommunityChallenge({
      challengeId: `challenge_${Date.now()}`,
      ...challengeData,
      globalStats: {
        totalParticipants: 0,
        completionRate: 0,
        avgProgress: 0,
        topCountries: []
      }
    });
    
    return await challenge.save();
  }

  static async joinChallenge(challengeId, userId) {
    const challenge = await CommunityChallenge.findOne({ challengeId, isActive: true });
    if (!challenge) throw new Error('Challenge not found');

    const existingParticipant = challenge.participants.find(p => p.userId.toString() === userId);
    if (existingParticipant) throw new Error('Already joined this challenge');

    challenge.participants.push({
      userId,
      joinedAt: new Date(),
      progress: { current: 0, lastUpdate: new Date() }
    });

    challenge.globalStats.totalParticipants = challenge.participants.length;
    return await challenge.save();
  }

  static async updateProgress(challengeId, userId, progressValue) {
    const challenge = await CommunityChallenge.findOne({ challengeId });
    if (!challenge) throw new Error('Challenge not found');

    const participant = challenge.participants.find(p => p.userId.toString() === userId);
    if (!participant) throw new Error('Not participating in this challenge');

    participant.progress.current = progressValue;
    participant.progress.lastUpdate = new Date();

    // Check completion
    if (progressValue >= challenge.target.value && !participant.completed) {
      participant.completed = true;
      participant.completedAt = new Date();
    }

    // Update leaderboard
    await this.updateLeaderboard(challenge, userId, progressValue);
    
    return await challenge.save();
  }

  static async updateLeaderboard(challenge, userId, score) {
    const existingEntry = challenge.leaderboard.find(entry => entry.userId.toString() === userId);
    
    if (existingEntry) {
      existingEntry.score = score;
    } else {
      // Get user info for leaderboard
      const User = (await import('../models/user.model.js')).default;
      const user = await User.findById(userId).select('fullName');
      
      challenge.leaderboard.push({
        userId,
        username: user?.fullName || 'Anonymous',
        country: 'Global', // Could be enhanced with user location
        score,
        rank: 0
      });
    }

    // Sort and update ranks
    challenge.leaderboard.sort((a, b) => b.score - a.score);
    challenge.leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Keep only top 100
    challenge.leaderboard = challenge.leaderboard.slice(0, 100);
  }

  static getActiveChallenges() {
    const now = new Date();
    return CommunityChallenge.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ startDate: -1 });
  }

  static getUpcomingChallenges() {
    const now = new Date();
    return CommunityChallenge.find({
      isActive: true,
      startDate: { $gt: now }
    }).sort({ startDate: 1 }).limit(5);
  }

  static generateWeeklyChallenges() {
    const challenges = [
      {
        title: "7-Day Mood Boost Challenge",
        description: "Track your mood daily and aim for 4+ average",
        type: "mood_tracking",
        target: { value: 7, unit: "days" },
        rewards: { badges: ["Mood Master"], points: 100, title: "Mood Tracker" }
      },
      {
        title: "Mindful Minutes Marathon",
        description: "Complete 150 minutes of mindfulness this week",
        type: "mindfulness",
        target: { value: 150, unit: "minutes" },
        rewards: { badges: ["Zen Master"], points: 200, title: "Mindfulness Guru" }
      },
      {
        title: "Break Champion Challenge",
        description: "Take 21 wellness breaks (3 per day)",
        type: "breaks",
        target: { value: 21, unit: "count" },
        rewards: { badges: ["Break Champion"], points: 150, title: "Rest Advocate" }
      },
      {
        title: "Gratitude Global Goal",
        description: "Share 14 gratitude moments this week",
        type: "gratitude",
        target: { value: 14, unit: "count" },
        rewards: { badges: ["Gratitude Guru"], points: 120, title: "Thankful Heart" }
      }
    ];

    return challenges.map(challenge => ({
      ...challenge,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      scope: 'global'
    }));
  }
}

export default CommunityChallengeService;