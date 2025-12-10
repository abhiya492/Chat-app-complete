import mongoose from "mongoose";

const gameProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  rank: { type: String, default: "Bronze", enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Legend", "Mythic"] },
  rankPoints: { type: Number, default: 0 },
  
  dailyStreak: { type: Number, default: 0 },
  lastLoginDate: { type: Date },
  
  totalGamesPlayed: { type: Number, default: 0 },
  totalWins: { type: Number, default: 0 },
  totalLosses: { type: Number, default: 0 },
  currentWinStreak: { type: Number, default: 0 },
  bestWinStreak: { type: Number, default: 0 },
  
  achievements: {
    type: [{ 
      id: String, 
      unlockedAt: Date,
      progress: { type: Number, default: 0 }
    }],
    default: []
  },
  
  cosmetics: {
    skins: { type: [String], default: ["default"] },
    emotes: { type: [String], default: ["wave"] },
    borders: { type: [String], default: ["basic"] },
    titles: { type: [String], default: ["Newbie"] },
    effects: { type: [String], default: [] },
  },
  
  equipped: {
    skin: { type: String, default: "default" },
    border: { type: String, default: "basic" },
    title: { type: String, default: "Newbie" },
    effect: String,
  },
  
  dailyQuests: {
    type: [{
      id: String,
      type: String,
      target: Number,
      progress: { type: Number, default: 0 },
      reward: Number,
      completed: { type: Boolean, default: false },
      date: Date,
    }],
    default: []
  },
  
  battlePass: {
    tier: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    season: { type: Number, default: 1 },
  },
  
  fantasyGames: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
  triviaGames: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
  storyGames: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
  mysteryGames: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
  scifiGames: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
  debateGames: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
}, { timestamps: true });

const GameProgress = mongoose.model("GameProgress", gameProgressSchema);
export default GameProgress;
