import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "text"],
      required: true,
    },
    content: {
      url: String, // For image/video
      text: String, // For text stories
      backgroundColor: String, // For text stories
      textColor: String,
    },
    caption: {
      type: String,
      maxlength: 200,
    },
    duration: {
      type: Number,
      default: 5, // seconds
    },
    views: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
    },
    privacy: {
      type: String,
      enum: ["public", "contacts", "close_friends"],
      default: "contacts",
    },
    allowedViewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Auto-delete expired stories
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Get stories that haven't expired
storySchema.statics.getActiveStories = function () {
  return this.find({ expiresAt: { $gt: new Date() } });
};

const Story = mongoose.model("Story", storySchema);

export default Story;
