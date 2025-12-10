import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
  challengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  opponentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  gameMode: {
    type: String,
    enum: ['battle_royale', 'fantasy', 'mystery', 'scifi', 'debate', 'trivia', 'story'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired', 'active', 'completed'],
    default: 'pending',
  },
  gameRoomId: {
    type: String,
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  gameState: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
  },
}, { timestamps: true });

// Auto-expire challenges
challengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Challenge = mongoose.model("Challenge", challengeSchema);

export default Challenge;
