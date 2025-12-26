import mongoose from "mongoose";

const userPurchasesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    ownedItems: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        purchaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Purchase",
            required: true,
        },
        purchaseDate: {
            type: Date,
            default: Date.now,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        expiryDate: Date, // For time-limited items
    }],
    wallet: {
        balance: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: 'INR',
        },
        transactions: [{
            type: {
                type: String,
                enum: ['credit', 'debit', 'refund', 'bonus', 'referral'],
                required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
            description: String,
            referenceId: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
    },
    preferences: {
        currentTheme: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        currentBackground: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        activeBadges: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }],
        favoriteEmojis: [String],
    },
    statistics: {
        totalSpent: {
            type: Number,
            default: 0,
        },
        totalPurchases: {
            type: Number,
            default: 0,
        },
        favoriteCategory: String,
        lastPurchaseDate: Date,
        loyaltyPoints: {
            type: Number,
            default: 0,
        },
        vipTier: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
            default: 'bronze',
        },
    },
    referrals: {
        referralCode: {
            type: String,
            unique: true,
        },
        referredUsers: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            rewardEarned: Number,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        totalReferrals: {
            type: Number,
            default: 0,
        },
        totalRewards: {
            type: Number,
            default: 0,
        },
    },
}, {
    timestamps: true,
});

// Indexes
userPurchasesSchema.index({ userId: 1 });
userPurchasesSchema.index({ 'ownedItems.productId': 1 });
userPurchasesSchema.index({ 'referrals.referralCode': 1 });

const UserPurchases = mongoose.model("UserPurchases", userPurchasesSchema);
export default UserPurchases;