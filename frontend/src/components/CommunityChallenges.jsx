import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import { Globe, Trophy, Users, Calendar, Target, Medal, TrendingUp } from 'lucide-react';

const CommunityChallenges = () => {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchActiveChallenges();
    fetchUserChallenges();
    fetchGlobalStats();
  }, []);

  const fetchActiveChallenges = async () => {
    try {
      const res = await axiosInstance.get('/community-challenges/active');
      setActiveChallenges(res.data);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      const res = await axiosInstance.get('/community-challenges/my-challenges');
      setUserChallenges(res.data);
    } catch (error) {
      console.error('Failed to fetch user challenges:', error);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const res = await axiosInstance.get('/community-challenges/global-stats');
      setGlobalStats(res.data);
    } catch (error) {
      console.error('Failed to fetch global stats:', error);
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      await axiosInstance.post(`/community-challenges/join/${challengeId}`);
      fetchActiveChallenges();
      fetchUserChallenges();
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  const viewLeaderboard = async (challengeId) => {
    try {
      const res = await axiosInstance.get(`/community-challenges/leaderboard/${challengeId}`);
      setLeaderboard(res.data.leaderboard);
      setSelectedChallenge(res.data.challengeInfo);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const getChallengeIcon = (type) => {
    const icons = {
      mood_tracking: '😊',
      stress_reduction: '😌',
      mindfulness: '🧘',
      breaks: '☕',
      positivity: '✨',
      gratitude: '🙏'
    };
    return icons[type] || '🎯';
  };

  const getProgressColor = (progress, target) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return 'progress-success';
    if (percentage >= 75) return 'progress-info';
    if (percentage >= 50) return 'progress-warning';
    return 'progress-error';
  };

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-6 h-6" />
            <h2 className="card-title">Global Wellness Community</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat">
              <div className="stat-title text-primary-content/80">Active Challenges</div>
              <div className="stat-value text-2xl">{globalStats?.activeChallenges || 0}</div>
            </div>
            <div className="stat">
              <div className="stat-title text-primary-content/80">Total Participants</div>
              <div className="stat-value text-2xl">{globalStats?.totalParticipants?.toLocaleString() || 0}</div>
            </div>
            <div className="stat">
              <div className="stat-title text-primary-content/80">Your Challenges</div>
              <div className="stat-value text-2xl">{userChallenges.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title text-primary-content/80">Completed</div>
              <div className="stat-value text-2xl">
                {userChallenges.filter(c => c.userCompleted).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title mb-4">🌍 Global Challenges</h3>
          
          <div className="grid gap-4">
            {activeChallenges.map(challenge => {
              const userParticipation = userChallenges.find(uc => uc.challengeId === challenge.challengeId);
              const isJoined = !!userParticipation;
              
              return (
                <div key={challenge.challengeId} className="border border-base-300 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getChallengeIcon(challenge.type)}</span>
                      <div>
                        <h4 className="font-semibold">{challenge.title}</h4>
                        <p className="text-sm text-base-content/70">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="badge badge-primary">{challenge.globalStats?.totalParticipants || 0} participants</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Target className="w-4 h-4" />
                      <span>Goal: {challenge.target?.value} {challenge.target?.unit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Ends: {new Date(challenge.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {isJoined && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Your Progress</span>
                        <span>{userParticipation.userProgress?.current || 0}/{challenge.target?.value}</span>
                      </div>
                      <progress 
                        className={`progress w-full ${getProgressColor(userParticipation.userProgress?.current || 0, challenge.target?.value)}`}
                        value={userParticipation.userProgress?.current || 0} 
                        max={challenge.target?.value}
                      ></progress>
                      {userParticipation.userRank && (
                        <div className="text-xs text-success mt-1">
                          🏆 Rank #{userParticipation.userRank} globally
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!isJoined ? (
                      <button 
                        onClick={() => joinChallenge(challenge.challengeId)}
                        className="btn btn-primary btn-sm"
                      >
                        Join Challenge
                      </button>
                    ) : (
                      <div className="badge badge-success">Joined</div>
                    )}
                    
                    <button 
                      onClick={() => viewLeaderboard(challenge.challengeId)}
                      className="btn btn-ghost btn-sm"
                    >
                      <Trophy className="w-4 h-4" />
                      Leaderboard
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{selectedChallenge.title} Leaderboard</h3>
              <button 
                onClick={() => setSelectedChallenge(null)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry, index) => (
                <div key={entry.userId} className={`flex items-center justify-between p-3 rounded-lg ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-100 to-yellow-50' : 'bg-base-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' : 'bg-base-300'
                    }`}>
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : entry.rank}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{entry.username}</div>
                      <div className="text-xs text-base-content/60">{entry.country}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{entry.score}</div>
                    <div className="text-xs text-base-content/60">points</div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setSelectedChallenge(null)}
              className="btn btn-primary w-full mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityChallenges;