import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    text: {
      type: String,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
    video: {
      url: String,
      thumbnail: String,
      duration: Number,
    },
    voice: {
      url: String,
      duration: Number,
    },
    file: {
      url: String,
      name: String,
      size: Number,
      type: String,
    },
    reactions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      emoji: String,
    }],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    deliveredTo: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      deliveredAt: {
        type: Date,
        default: Date.now,
      },
    }],
    readBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
    disappearAfter: {
      type: Number, // seconds
      default: null,
    },
    expiresAt: {
      type: Date,
    },
    scheduledFor: {
      type: Date,
      default: null,
      index: true,
    },
    isSent: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-delete expired messages
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Set expiry before saving
messageSchema.pre('save', function(next) {
  if (this.disappearAfter && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + this.disappearAfter * 1000);
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;