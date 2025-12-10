import mongoose from "mongoose";

const playerStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  totalGames: {
    type: Number,
    default: 0,
  },
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  draws: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  xp: {
    type: Number,
    default: 0,
  },
  gameModeStats: {
    battle_royale: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
    fantasy: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
    mystery: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
    scifi: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
    debate: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
    trivia: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
    story: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
  },
  achievements: [{
    type: String,
  }],
  lastPlayed: {
    type: Date,
  },
}, { timestamps: true });

const PlayerStats = mongoose.model("PlayerStats", playerStatsSchema);

export default PlayerStats;
