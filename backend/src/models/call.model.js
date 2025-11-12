import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["voice", "video"],
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "ringing", "accepted", "rejected", "missed", "ended"],
      default: "initiated",
    },
    duration: {
      type: Number,
      default: 0,
    },
    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

const Call = mongoose.model("Call", callSchema);

export default Call;
