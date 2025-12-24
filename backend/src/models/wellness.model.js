import mongoose from "mongoose";

const wellnessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  mood: {
    score: { type: Number, min: 1, max: 5 }, // 1=very sad, 5=very happy
    detected: { type: Boolean, default: false },
    manual: { type: Boolean, default: false },
  },
  stress: {
    level: { type: Number, min: 0, max: 100 },
    typingSpeed: Number,
    errorRate: Number,
    pauseFrequency: Number,
  },
  usage: {
    screenTime: Number, // minutes
    messageCount: Number,
    breaksTaken: Number,
    lastBreak: Date,
  },
  challenges: [{
    type: { type: String, enum: ['mindfulness', 'digital_detox', 'positive_messaging'] },
    completed: Boolean,
    date: Date,
  }],
  mindfulMoments: [{
    trigger: String,
    response: String,
    timestamp: Date,
  }],
}, { timestamps: true });

wellnessSchema.index({ userId: 1, date: -1 });

const Wellness = mongoose.model("Wellness", wellnessSchema);
export default Wellness;