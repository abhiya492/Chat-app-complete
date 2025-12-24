import CommunityChallengeService from '../services/communityChallenge.service.js';
import CommunityChallenge from '../models/communityChallenge.model.js';

export const getActiveChallenges = async (req, res) => {
  try {
    const challenges = await CommunityChallengeService.getActiveChallenges();
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.user;
    
    const challenge = await CommunityChallengeService.joinChallenge(challengeId, userId);
    res.json({ message: 'Successfully joined challenge', challenge });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateChallengeProgress = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.user;
    const { progress } = req.body;
    
    const challenge = await CommunityChallengeService.updateProgress(challengeId, userId, progress);
    res.json({ message: 'Progress updated', challenge });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getChallengeLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.params;
    
    const challenge = await CommunityChallenge.findOne({ challengeId })
      .select('leaderboard globalStats title type');
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    res.json({
      leaderboard: challenge.leaderboard,
      globalStats: challenge.globalStats,
      challengeInfo: {
        title: challenge.title,
        type: challenge.type
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserChallenges = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const challenges = await CommunityChallenge.find({
      'participants.userId': userId,
      isActive: true
    }).select('challengeId title type target participants globalStats startDate endDate');
    
    const userChallenges = challenges.map(challenge => {
      const userParticipation = challenge.participants.find(p => p.userId.toString() === userId);
      return {
        ...challenge.toObject(),
        userProgress: userParticipation?.progress,
        userCompleted: userParticipation?.completed,
        userRank: challenge.leaderboard?.find(l => l.userId.toString() === userId)?.rank
      };
    });
    
    res.json(userChallenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGlobalStats = async (req, res) => {
  try {
    const totalChallenges = await CommunityChallenge.countDocuments({ isActive: true });
    const activeChallenges = await CommunityChallenge.countDocuments({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    const globalParticipants = await CommunityChallenge.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$globalStats.totalParticipants' } } }
    ]);
    
    res.json({
      totalChallenges,
      activeChallenges,
      totalParticipants: globalParticipants[0]?.total || 0,
      upcomingChallenges: await CommunityChallengeService.getUpcomingChallenges()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};