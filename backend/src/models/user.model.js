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
},
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;