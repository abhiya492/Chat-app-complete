import mongoose from "mongoose";

const communityChallenge = new mongoose.Schema({
  challengeId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: ['mood_tracking', 'stress_reduction', 'mindfulness', 'breaks', 'positivity', 'gratitude'],
    required: true,
  },
  scope: {
    type: String,
    enum: ['global', 'regional', 'corporate', 'team'],
    default: 'global',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  target: {
    value: Number,
    unit: String, // 'days', 'points', 'minutes', 'count'
  },
  rewards: {
    badges: [String],
    points: Number,
    title: String,
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    joinedAt: Date,
    progress: {
      current: { type: Number, default: 0 },
      lastUpdate: Date,
    },
    completed: { type: Boolean, default: false },
    completedAt: Date,
  }],
  leaderboard: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: String,
    country: String,
    score: Number,
    rank: Number,
  }],
  globalStats: {
    totalParticipants: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    avgProgress: { type: Number, default: 0 },
    topCountries: [{
      country: String,
      participants: Number,
      avgScore: Number,
    }],
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

communityChallenge.index({ challengeId: 1 });
communityChallenge.index({ type: 1, isActive: 1 });
communityChallenge.index({ startDate: 1, endDate: 1 });

const CommunityChallenge = mongoose.model("CommunityChallenge", communityChallenge);
export default CommunityChallenge;