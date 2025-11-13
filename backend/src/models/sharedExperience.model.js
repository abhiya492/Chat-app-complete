import mongoose from "mongoose";

const sharedExperienceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['game', 'cursor'],
    required: true
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    required: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  data: {

    
    // Games
    gameType: { type: String, enum: ['tictactoe', 'chess', 'trivia'] },
    gameState: mongoose.Schema.Types.Mixed,
    currentPlayer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // Cursor Share
    cursors: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      x: Number,
      y: Number,
      timestamp: Date
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Auto-expire inactive sessions after 24 hours
sharedExperienceSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

const SharedExperience = mongoose.model("SharedExperience", sharedExperienceSchema);
export default SharedExperience;