import { useState, useEffect } from "react";
import { useChallengeStore } from "../store/useChallengeStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGameProgressStore } from "../store/useGameProgressStore";
import { Swords, Gamepad2, X, Trophy, Star, Flame, Zap, Crown, Target } from "lucide-react";
import ChallengeModal from "../components/ChallengeModal";
import GameRoom from "../components/GameRoom";
import Confetti from "react-confetti";

const GAME_MODES = [
  { id: 'battle_royale', name: 'Battle Royale', icon: '🔥', desc: '3D Free Fire style combat' },
  { id: 'fantasy', name: 'Fantasy Adventure', icon: '⚔️', desc: 'Epic quests and battles' },
  { id: 'mystery', name: 'Mystery Detective', icon: '🔍', desc: 'Solve puzzles together' },
  { id: 'scifi', name: 'Sci-Fi Survival', icon: '🚀', desc: 'Space adventures' },
  { id: 'debate', name: 'Debate Battle', icon: '💬', desc: 'Argue your point' },
  { id: 'trivia', name: 'Trivia Quest', icon: '🧠', desc: 'Test your knowledge' },
  { id: 'story', name: 'Story Builder', icon: '📖', desc: 'Create stories together' },
];

const Challenge = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { onlineUsers } = useAuthStore();
  const { 
    onlinePlayers, 
    playerStats, 
    activeChallenge,
    getOnlinePlayers, 
    getPlayerStats,
    subscribeToChallenge,
    unsubscribeFromChallenge 
  } = useChallengeStore();
  const { progress, getProgress, showLevelUp, showAchievement } = useGameProgressStore();

  useEffect(() => {
    getPlayerStats();
    getProgress();
    subscribeToChallenge();
    return () => unsubscribeFromChallenge();
  }, []);

  useEffect(() => {
    if (onlineUsers.length > 0) {
      getOnlinePlayers(onlineUsers);
    }
  }, [onlineUsers]);

  useEffect(() => {
    if (showLevelUp) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [showLevelUp]);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setShowModal(true);
  };

  if (activeChallenge) {
    return <GameRoom challenge={activeChallenge} />;
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
        
        {showLevelUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
            <div className="card bg-gradient-to-br from-primary to-secondary p-8 shadow-2xl animate-in zoom-in">
              <div className="text-center">
                <Crown className="w-20 h-20 mx-auto mb-4 text-warning animate-bounce" />
                <h2 className="text-4xl font-bold text-white mb-2">LEVEL UP!</h2>
                <p className="text-2xl text-white">Level {progress?.level}</p>
                <p className="text-white/80 mt-2">+50 Gems Earned!</p>
              </div>
            </div>
          </div>
        )}

        {showAchievement && (
          <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right">
            <div className="alert alert-success shadow-lg">
              <Trophy className="w-6 h-6" />
              <div>
                <h3 className="font-bold">{showAchievement.name}</h3>
                <p className="text-sm">{showAchievement.desc}</p>
                <p className="text-xs">+{showAchievement.xp} XP, +{showAchievement.gems} Gems</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Swords className="w-10 h-10 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Challenge Arena
            </h1>
          </div>
          <p className="text-base-content/70">Challenge online players to multiplayer role-play games</p>
        </div>

        {progress && (
          <div className="card bg-gradient-to-br from-base-200 to-base-300 shadow-xl mb-8 border-2 border-primary/20">
            <div className="card-body">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="avatar placeholder">
                    <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-20 ring ring-primary ring-offset-2">
                      <span className="text-3xl font-bold">{progress.level}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      {progress.equipped?.title || "Warrior"}
                      {progress.dailyStreak >= 7 && <Flame className="w-5 h-5 text-orange-500 animate-pulse" />}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <progress className="progress progress-primary w-32" value={progress.xp} max={progress.level < 10 ? 100 : progress.level < 25 ? 250 : 500}></progress>
                      <span className="text-sm font-bold">{progress.xp} XP</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="badge badge-warning gap-1"><Trophy className="w-3 h-3" />{progress.totalWins}W</span>
                      <span className="badge badge-error gap-1">{progress.totalLosses}L</span>
                      <span className="badge badge-info gap-1"><Flame className="w-3 h-3" />{progress.dailyStreak}d</span>
                      <span className="badge badge-success gap-1"><Zap className="w-3 h-3" />{progress.gems} Gems</span>
                    </div>
                  </div>
                </div>
                <div className="stats shadow">
                  <div className="stat place-items-center p-4">
                    <div className="stat-title text-xs">Win Rate</div>
                    <div className="stat-value text-2xl text-success">
                      {progress.totalGamesPlayed > 0 ? Math.round((progress.totalWins / progress.totalGamesPlayed) * 100) : 0}%
                    </div>
                  </div>
                  <div className="stat place-items-center p-4">
                    <div className="stat-title text-xs">Streak</div>
                    <div className="stat-value text-2xl text-warning flex items-center gap-1">
                      <Flame className="w-6 h-6" />{progress.currentWinStreak}
                    </div>
                  </div>
                  <div className="stat place-items-center p-4">
                    <div className="stat-title text-xs">Rank</div>
                    <div className="stat-value text-2xl text-primary">{progress.rank}</div>
                  </div>
                </div>
              </div>
              
              {progress.dailyQuests?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-base-300">
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Daily Quests
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {progress.dailyQuests.map((quest, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-2 rounded ${quest.completed ? 'bg-success/20' : 'bg-base-100'}`}>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{quest.type === 'wins' ? 'Win Games' : quest.type === 'games' ? 'Play Games' : 'Complete Mode'}</p>
                          <progress className="progress progress-primary w-full h-1" value={quest.progress} max={quest.target}></progress>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-xs">{quest.progress}/{quest.target}</p>
                          <p className="text-xs text-success">+{quest.reward} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6" />
            Select Game Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GAME_MODES.map((mode) => (
              <div
                key={mode.id}
                onClick={() => handleModeSelect(mode)}
                className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-all hover:scale-105 shadow-lg"
              >
                <div className="card-body">
                  <div className="text-4xl mb-2">{mode.icon}</div>
                  <h3 className="card-title">{mode.name}</h3>
                  <p className="text-sm text-base-content/70">{mode.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Online Players ({onlinePlayers.length})</h2>
          {onlinePlayers.length === 0 ? (
            <div className="text-center py-12 text-base-content/50">
              No online players available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {onlinePlayers.map((player) => (
                <div key={player._id} className="card bg-base-200 shadow-lg">
                  <div className="card-body flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img src={player.profilePic || "/avatar.png"} alt={player.fullName} />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold">{player.fullName}</h3>
                        <p className="text-sm text-base-content/70">
                          Level {player.stats?.level || 1} • {player.stats?.totalGames || 0} games
                        </p>
                      </div>
                    </div>
                    <div className="badge badge-success gap-1">
                      <div className="w-2 h-2 rounded-full bg-success-content animate-pulse" />
                      Active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ChallengeModal
          gameMode={selectedMode}
          players={onlinePlayers}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Challenge;
