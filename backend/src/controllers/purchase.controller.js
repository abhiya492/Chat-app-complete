import Purchase from "../models/purchase.model.js";
import Product from "../models/product.model.js";
import UserPurchases from "../models/userPurchases.model.js";
import User from "../models/user.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay only if credentials are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && 
    process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id') {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// Get all products
export const getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, sort = 'popularity' } = req.query;
        
        let filter = { isActive: true };
        
        if (category) filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        let sortOption = {};
        switch (sort) {
            case 'price_low': sortOption = { price: 1 }; break;
            case 'price_high': sortOption = { price: -1 }; break;
            case 'newest': sortOption = { createdAt: -1 }; break;
            case 'rating': sortOption = { 'rating.average': -1 }; break;
            default: sortOption = { popularity: -1 };
        }

        const products = await Product.find(filter).sort(sortOption);
        
        res.json({
            success: true,
            products,
            total: products.length
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get product by ID
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        res.json({ success: true, product });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Create Razorpay order
export const createOrder = async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(503).json({ 
                success: false, 
                message: "Payment service not configured" 
            });
        }

        const { productId, couponCode } = req.body;
        const userId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Check if user already owns this product
        const userPurchases = await UserPurchases.findOne({ userId });
        if (userPurchases?.ownedItems.some(item => item.productId.toString() === productId)) {
            return res.status(400).json({ success: false, message: "You already own this item" });
        }

        let finalPrice = product.price;
        let discountApplied = 0;

        // Apply seasonal discount
        if (product.seasonalOffer?.isActive && 
            new Date() >= product.seasonalOffer.startDate && 
            new Date() <= product.seasonalOffer.endDate) {
            discountApplied = (product.price * product.seasonalOffer.discountPercent) / 100;
            finalPrice = product.price - discountApplied;
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(finalPrice * 100), // Amount in paise
            currency: "INR",
            receipt: `order_${Date.now()}`,
            notes: {
                productId,
                userId: userId.toString(),
                couponCode: couponCode || '',
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order,
            product,
            finalPrice,
            discountApplied
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Verify payment and complete purchase
export const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            productId 
        } = req.body;
        const userId = req.user._id;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Get product details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Create purchase record
        const purchase = new Purchase({
            userId,
            productId,
            transactionId: razorpay_payment_id,
            paymentMethod: 'razorpay',
            amount: product.price,
            status: 'completed',
            paymentGatewayResponse: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature
            }
        });

        await purchase.save();

        // Update user purchases
        let userPurchases = await UserPurchases.findOne({ userId });
        if (!userPurchases) {
            userPurchases = new UserPurchases({ userId });
        }

        userPurchases.ownedItems.push({
            productId,
            purchaseId: purchase._id,
            purchaseDate: new Date(),
        });

        userPurchases.statistics.totalSpent += product.price;
        userPurchases.statistics.totalPurchases += 1;
        userPurchases.statistics.lastPurchaseDate = new Date();

        // Add loyalty points (1 point per ₹10 spent)
        const pointsEarned = Math.floor(product.price / 10);
        userPurchases.statistics.loyaltyPoints += pointsEarned;

        // Update VIP tier based on total spent
        const totalSpent = userPurchases.statistics.totalSpent;
        if (totalSpent >= 10000) userPurchases.statistics.vipTier = 'diamond';
        else if (totalSpent >= 5000) userPurchases.statistics.vipTier = 'platinum';
        else if (totalSpent >= 2000) userPurchases.statistics.vipTier = 'gold';
        else if (totalSpent >= 500) userPurchases.statistics.vipTier = 'silver';

        await userPurchases.save();

        // Update product statistics
        product.totalSales += 1;
        product.popularity += 1;
        await product.save();

        // Update user premium features
        const user = await User.findById(userId);
        switch (product.category) {
            case 'theme':
                user.premiumFeatures.hasCustomThemes = true;
                break;
            case 'emoji_pack':
                user.premiumFeatures.hasEmojiPacks = true;
                break;
            case 'voice_effect':
                user.premiumFeatures.hasVoiceEffects = true;
                break;
            case 'profile_badge':
                user.premiumFeatures.hasProfileBadges = true;
                break;
            case 'chat_background':
                user.premiumFeatures.hasChatBackgrounds = true;
                break;
        }

        user.purchases.totalSpent += product.price;
        user.purchases.totalItems += 1;
        user.purchases.lastPurchase = new Date();
        
        await user.save();

        res.json({
            success: true,
            message: "Purchase completed successfully!",
            purchase,
            pointsEarned,
            newVipTier: userPurchases.statistics.vipTier
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get user's purchases
export const getUserPurchases = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const userPurchases = await UserPurchases.findOne({ userId })
            .populate('ownedItems.productId')
            .populate('ownedItems.purchaseId');

        if (!userPurchases) {
            return res.json({
                success: true,
                purchases: {
                    ownedItems: [],
                    wallet: { balance: 0, transactions: [] },
                    statistics: { totalSpent: 0, totalPurchases: 0, loyaltyPoints: 0, vipTier: 'bronze' }
                }
            });
        }

        res.json({ success: true, purchases: userPurchases });
    } catch (error) {
        console.error("Error fetching user purchases:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Apply purchased item
export const applyPurchasedItem = async (req, res) => {
    try {
        const { productId, action } = req.body; // action: 'activate', 'deactivate'
        const userId = req.user._id;

        const userPurchases = await UserPurchases.findOne({ userId });
        if (!userPurchases) {
            return res.status(404).json({ success: false, message: "No purchases found" });
        }

        const ownedItem = userPurchases.ownedItems.find(
            item => item.productId.toString() === productId && item.isActive
        );

        if (!ownedItem) {
            return res.status(404).json({ success: false, message: "Item not owned or expired" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Apply the item based on category
        switch (product.category) {
            case 'theme':
                if (action === 'activate') {
                    userPurchases.preferences.currentTheme = productId;
                } else {
                    userPurchases.preferences.currentTheme = null;
                }
                break;
            case 'chat_background':
                if (action === 'activate') {
                    userPurchases.preferences.currentBackground = productId;
                } else {
                    userPurchases.preferences.currentBackground = null;
                }
                break;
            case 'profile_badge':
                if (action === 'activate') {
                    if (!userPurchases.preferences.activeBadges.includes(productId)) {
                        userPurchases.preferences.activeBadges.push(productId);
                    }
                } else {
                    userPurchases.preferences.activeBadges = userPurchases.preferences.activeBadges.filter(
                        badge => badge.toString() !== productId
                    );
                }
                break;
        }

        await userPurchases.save();

        res.json({
            success: true,
            message: `${product.name} ${action}d successfully!`,
            preferences: userPurchases.preferences
        });
    } catch (error) {
        console.error("Error applying purchased item:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Add money to wallet
export const addToWallet = async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(503).json({ 
                success: false, 
                message: "Payment service not configured" 
            });
        }

        const { amount } = req.body;
        const userId = req.user._id;

        if (amount < 10 || amount > 10000) {
            return res.status(400).json({ 
                success: false, 
                message: "Amount must be between ₹10 and ₹10,000" 
            });
        }

        // Create Razorpay order for wallet recharge
        const options = {
            amount: amount * 100, // Amount in paise
            currency: "INR",
            receipt: `wallet_${Date.now()}`,
            notes: {
                type: 'wallet_recharge',
                userId: userId.toString(),
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order,
            amount
        });
    } catch (error) {
        console.error("Error creating wallet recharge order:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Verify wallet recharge
export const verifyWalletRecharge = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            amount 
        } = req.body;
        const userId = req.user._id;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Update wallet
        let userPurchases = await UserPurchases.findOne({ userId });
        if (!userPurchases) {
            userPurchases = new UserPurchases({ userId });
        }

        userPurchases.wallet.balance += amount;
        userPurchases.wallet.transactions.push({
            type: 'credit',
            amount,
            description: 'Wallet recharge',
            referenceId: razorpay_payment_id,
        });

        await userPurchases.save();

        res.json({
            success: true,
            message: `₹${amount} added to wallet successfully!`,
            newBalance: userPurchases.wallet.balance
        });
    } catch (error) {
        console.error("Error verifying wallet recharge:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Purchase with wallet
export const purchaseWithWallet = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const userPurchases = await UserPurchases.findOne({ userId });
        if (!userPurchases || userPurchases.wallet.balance < product.price) {
            return res.status(400).json({ 
                success: false, 
                message: "Insufficient wallet balance" 
            });
        }

        // Check if user already owns this product
        if (userPurchases.ownedItems.some(item => item.productId.toString() === productId)) {
            return res.status(400).json({ success: false, message: "You already own this item" });
        }

        // Deduct from wallet
        userPurchases.wallet.balance -= product.price;
        userPurchases.wallet.transactions.push({
            type: 'debit',
            amount: product.price,
            description: `Purchased ${product.name}`,
            referenceId: productId,
        });

        // Create purchase record
        const purchase = new Purchase({
            userId,
            productId,
            transactionId: `wallet_${Date.now()}`,
            paymentMethod: 'wallet',
            amount: product.price,
            status: 'completed',
        });

        await purchase.save();

        // Add to owned items
        userPurchases.ownedItems.push({
            productId,
            purchaseId: purchase._id,
            purchaseDate: new Date(),
        });

        userPurchases.statistics.totalSpent += product.price;
        userPurchases.statistics.totalPurchases += 1;
        userPurchases.statistics.lastPurchaseDate = new Date();

        await userPurchases.save();

        res.json({
            success: true,
            message: "Purchase completed successfully!",
            purchase,
            newBalance: userPurchases.wallet.balance
        });
    } catch (error) {
        console.error("Error purchasing with wallet:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};