import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['theme', 'emoji_pack', 'voice_effect', 'profile_badge', 'chat_background', 'bundle'],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    preview: {
        images: [String],
        video: String,
        demo: String,
    },
    metadata: {
        // For themes
        themeConfig: {
            primary: String,
            secondary: String,
            accent: String,
            background: String,
            cssFile: String,
        },
        // For emoji packs
        emojiList: [String],
        // For voice effects
        effectType: String,
        audioSample: String,
        // For badges
        badgeIcon: String,
        badgeColor: String,
        badgeAnimation: String,
        // For chat backgrounds
        backgroundImage: String,
        backgroundType: String, // 'static', 'animated', 'video'
        // For bundles
        bundleItems: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            quantity: { type: Number, default: 1 },
        }],
    },
    tags: [String],
    popularity: {
        type: Number,
        default: 0,
    },
    totalSales: {
        type: Number,
        default: 0,
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
    },
    seasonalOffer: {
        isActive: { type: Boolean, default: false },
        discountPercent: Number,
        startDate: Date,
        endDate: Date,
        offerName: String,
    },
    createdBy: {
        type: String,
        default: 'admin',
    },
}, {
    timestamps: true,
});

// Indexes
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ popularity: -1 });
productSchema.index({ 'seasonalOffer.isActive': 1, 'seasonalOffer.endDate': 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;