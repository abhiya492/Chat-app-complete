import mongoose from "mongoose";

const streakSchema = new mongoose.Schema(
  {
    user1Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    lastMessageDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

streakSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });

const Streak = mongoose.model("Streak", streakSchema);

export default Streak;
