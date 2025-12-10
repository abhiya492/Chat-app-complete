import GameProgress from "../models/gameProgress.model.js";
import PlayerStats from "../models/playerStats.model.js";

const ACHIEVEMENTS = {
  first_blood: { name: "First Blood", desc: "Win your first game", xp: 50, gems: 50 },
  warrior: { name: "Warrior", desc: "Win 100 games", xp: 500, gems: 200 },
  unstoppable: { name: "Unstoppable", desc: "Win 10 games in a row", xp: 300, gems: 150 },
  social_butterfly: { name: "Social Butterfly", desc: "Play with 50 different opponents", xp: 200, gems: 100 },
  week_warrior: { name: "Week Warrior", desc: "Login 7 days in a row", xp: 250, gems: 100 },
};

const DAILY_QUESTS = [
  { id: "win_3", type: "wins", target: 3, reward: 150 },
  { id: "play_5", type: "games", target: 5, reward: 100 },
  { id: "fantasy_2", type: "fantasy", target: 2, reward: 120 },
  { id: "streak_3", type: "streak", target: 3, reward: 200 },
];

export const getProgress = async (req, res) => {
  try {
    let progress = await GameProgress.findOne({ userId: req.user._id });
    
    if (!progress) {
      progress = new GameProgress({ userId: req.user._id });
      await progress.save();
    }
    
    // Check daily login streak
    const today = new Date().toDateString();
    const lastLogin = progress.lastLoginDate ? new Date(progress.lastLoginDate).toDateString() : null;
    
    if (lastLogin !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastLogin === yesterday) {
        progress.dailyStreak += 1;
      } else if (lastLogin !== today) {
        progress.dailyStreak = 1;
      }
      progress.lastLoginDate = new Date();
      
      // Daily login rewards
      const streakReward = Math.min(progress.dailyStreak * 10, 100);
      progress.gems += streakReward;
      
      // Generate daily quests
      progress.dailyQuests = DAILY_QUESTS.map(q => ({
        ...q,
        progress: 0,
        completed: false,
        date: new Date()
      }));
      
      await progress.save();
    }
    
    res.json(progress);
  } catch (error) {
    console.error("Error getting progress:", error.message, error.stack);
    res.status(500).json({ message: error.message });
  }
};

export const addXP = async (req, res) => {
  try {
    const { amount, source } = req.body;
    const progress = await GameProgress.findOne({ userId: req.user._id });
    
    if (!progress) return res.status(404).json({ message: "Progress not found" });
    
    progress.xp += amount;
    
    // Level up logic
    const xpForNextLevel = progress.level < 10 ? 100 : progress.level < 25 ? 250 : progress.level < 50 ? 500 : 1000;
    
    let leveledUp = false;
    while (progress.xp >= xpForNextLevel) {
      progress.xp -= xpForNextLevel;
      progress.level += 1;
      progress.gems += 50;
      leveledUp = true;
    }
    
    await progress.save();
    
    res.json({ progress, leveledUp });
  } catch (error) {
    console.error("Error adding XP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGameResult = async (req, res) => {
  try {
    const { gameMode, won, opponentId } = req.body;
    const progress = await GameProgress.findOne({ userId: req.user._id });
    
    if (!progress) return res.status(404).json({ message: "Progress not found" });
    
    // Update stats
    progress.totalGamesPlayed += 1;
    if (won) {
      progress.totalWins += 1;
      progress.currentWinStreak += 1;
      progress.bestWinStreak = Math.max(progress.bestWinStreak, progress.currentWinStreak);
    } else {
      progress.totalLosses += 1;
      progress.currentWinStreak = 0;
    }
    
    // Update game mode stats
    const key = `${gameMode}Games`;
    if (!progress[key]) progress[key] = { played: 0, wins: 0 };
    progress[key].played += 1;
    if (won) progress[key].wins += 1;
    
    // XP rewards
    let xpGain = won ? 50 : 20;
    if (progress.currentWinStreak >= 3) xpGain += 25;
    progress.xp += xpGain;
    
    // Gems for wins
    if (won) progress.gems += 10;
    
    // Update daily quests
    progress.dailyQuests.forEach(quest => {
      if (quest.completed) return;
      
      if (quest.type === "games") quest.progress += 1;
      if (quest.type === "wins" && won) quest.progress += 1;
      if (quest.type === gameMode) quest.progress += 1;
      if (quest.type === "streak" && progress.currentWinStreak >= quest.target) quest.progress = quest.target;
      
      if (quest.progress >= quest.target) {
        quest.completed = true;
        progress.xp += quest.reward;
      }
    });
    
    // Check achievements
    const newAchievements = [];
    
    if (progress.totalWins === 1 && !progress.achievements.find(a => a.id === "first_blood")) {
      progress.achievements.push({ id: "first_blood", unlockedAt: new Date() });
      progress.xp += ACHIEVEMENTS.first_blood.xp;
      progress.gems += ACHIEVEMENTS.first_blood.gems;
      newAchievements.push(ACHIEVEMENTS.first_blood);
    }
    
    if (progress.totalWins === 100 && !progress.achievements.find(a => a.id === "warrior")) {
      progress.achievements.push({ id: "warrior", unlockedAt: new Date() });
      progress.xp += ACHIEVEMENTS.warrior.xp;
      progress.gems += ACHIEVEMENTS.warrior.gems;
      newAchievements.push(ACHIEVEMENTS.warrior);
    }
    
    if (progress.currentWinStreak === 10 && !progress.achievements.find(a => a.id === "unstoppable")) {
      progress.achievements.push({ id: "unstoppable", unlockedAt: new Date() });
      progress.xp += ACHIEVEMENTS.unstoppable.xp;
      progress.gems += ACHIEVEMENTS.unstoppable.gems;
      newAchievements.push(ACHIEVEMENTS.unstoppable);
    }
    
    if (progress.dailyStreak === 7 && !progress.achievements.find(a => a.id === "week_warrior")) {
      progress.achievements.push({ id: "week_warrior", unlockedAt: new Date() });
      progress.xp += ACHIEVEMENTS.week_warrior.xp;
      progress.gems += ACHIEVEMENTS.week_warrior.gems;
      newAchievements.push(ACHIEVEMENTS.week_warrior);
    }
    
    // Level up
    const xpForNextLevel = progress.level < 10 ? 100 : progress.level < 25 ? 250 : progress.level < 50 ? 500 : 1000;
    let leveledUp = false;
    
    while (progress.xp >= xpForNextLevel) {
      progress.xp -= xpForNextLevel;
      progress.level += 1;
      progress.gems += 50;
      leveledUp = true;
    }
    
    await progress.save();
    
    res.json({ progress, xpGain, newAchievements, leveledUp });
  } catch (error) {
    console.error("Error updating game result:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { type = "level" } = req.query;
    
    let sortField = {};
    if (type === "level") sortField = { level: -1, xp: -1 };
    else if (type === "wins") sortField = { totalWins: -1 };
    else if (type === "streak") sortField = { bestWinStreak: -1 };
    
    const leaderboard = await GameProgress.find()
      .sort(sortField)
      .limit(100)
      .populate("userId", "fullName profilePic")
      .select("userId level xp totalWins bestWinStreak rank");
    
    res.json(leaderboard);
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const purchaseCosmetic = async (req, res) => {
  try {
    const { type, item, cost } = req.body;
    const progress = await GameProgress.findOne({ userId: req.user._id });
    
    if (!progress) return res.status(404).json({ message: "Progress not found" });
    if (progress.gems < cost) return res.status(400).json({ message: "Not enough gems" });
    
    progress.gems -= cost;
    progress.cosmetics[type].push(item);
    await progress.save();
    
    res.json(progress);
  } catch (error) {
    console.error("Error purchasing cosmetic:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const equipCosmetic = async (req, res) => {
  try {
    const { type, item } = req.body;
    const progress = await GameProgress.findOne({ userId: req.user._id });
    
    if (!progress) return res.status(404).json({ message: "Progress not found" });
    if (!progress.cosmetics[type + "s"].includes(item)) {
      return res.status(400).json({ message: "Cosmetic not owned" });
    }
    
    progress.equipped[type] = item;
    await progress.save();
    
    res.json(progress);
  } catch (error) {
    console.error("Error equipping cosmetic:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
