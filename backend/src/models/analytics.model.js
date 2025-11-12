import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    sessionId: String,
    userAgent: String,
    ip: String,
  },
  { timestamps: true }
);

analyticsSchema.index({ userId: 1, createdAt: -1 });
analyticsSchema.index({ event: 1, createdAt: -1 });

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
