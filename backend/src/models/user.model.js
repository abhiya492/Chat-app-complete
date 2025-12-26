import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
    fullName: { 
        type: String, 
        required: true,
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
    },
    password: { 
        type: String, 
        required: false,
        minlength: 6,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local',
    },
    profilePic: { 
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
        maxlength: 200,
    },
    status: {
        type: String,
        default: "Hey there! I'm using this chat app",
        maxlength: 100,
    },
    privacy: {
        showLastSeen: { type: Boolean, default: true },
        showProfilePic: { type: Boolean, default: true },
        showStatus: { type: Boolean, default: true },
    },
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    resetPasswordOTP: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    publicKey: {
        type: String,
        default: null,
    },
    subscription: {
        plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
        status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
        startDate: Date,
        endDate: Date,
        paymentId: String,
    },
    paymentRequests: [{
        paymentId: String,
        plan: String,
        amount: Number,
        transactionId: String,
        screenshot: String,
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        createdAt: { type: Date, default: Date.now },
        verifiedAt: Date,
    }],
    premiumFeatures: {
        hasCustomThemes: { type: Boolean, default: false },
        hasEmojiPacks: { type: Boolean, default: false },
        hasVoiceEffects: { type: Boolean, default: false },
        hasProfileBadges: { type: Boolean, default: false },
        hasChatBackgrounds: { type: Boolean, default: false },
        maxFileSize: { type: Number, default: 10 }, // MB
        maxVoiceMessageDuration: { type: Number, default: 60 }, // seconds
        canCreateVoiceRooms: { type: Boolean, default: false },
        prioritySupport: { type: Boolean, default: false },
    },
    purchases: {
        totalSpent: { type: Number, default: 0 },
        totalItems: { type: Number, default: 0 },
        lastPurchase: Date,
        favoriteCategory: String,
    },
},
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;