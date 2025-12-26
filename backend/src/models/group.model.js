import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  description: {
    type: String,
    maxlength: 200,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "moderator", "member"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  settings: {
    isPrivate: { type: Boolean, default: false },
    allowMemberInvites: { type: Boolean, default: true },
    allowMemberMessages: { type: Boolean, default: true },
    maxMembers: { type: Number, default: 100 },
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Generate invite code before saving
groupSchema.pre('save', function(next) {
  if (!this.inviteCode && !this.settings.isPrivate) {
    this.inviteCode = Math.random().toString(36).substring(2, 15);
  }
  next();
});

const Group = mongoose.model("Group", groupSchema);
export default Group;