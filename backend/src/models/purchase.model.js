import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'stripe', 'upi', 'wallet', 'google_pay', 'paytm'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending',
    },
    paymentGatewayResponse: {
        type: mongoose.Schema.Types.Mixed,
    },
    refundDetails: {
        refundId: String,
        refundAmount: Number,
        refundReason: String,
        refundDate: Date,
    },
    metadata: {
        discountApplied: Number,
        couponCode: String,
        bundleId: String,
        giftedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
}, {
    timestamps: true,
});

// Indexes for better query performance
purchaseSchema.index({ userId: 1, createdAt: -1 });
purchaseSchema.index({ transactionId: 1 });
purchaseSchema.index({ status: 1 });

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;