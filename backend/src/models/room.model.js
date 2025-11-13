import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ['tech', 'music', 'gaming', 'casual', 'other'],
      default: 'casual',
    },
    maxParticipants: {
      type: Number,
      default: 20,
      max: 20,
    },
    maxSpeakers: {
      type: Number,
      default: 6,
      max: 6,
    },
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    peakParticipants: {
      type: Number,
      default: 0,
    },
    totalJoins: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

roomSchema.index({ status: 1, createdAt: -1 });
roomSchema.index({ createdBy: 1, status: 1 });

const Room = mongoose.model("Room", roomSchema);

export default Room;
