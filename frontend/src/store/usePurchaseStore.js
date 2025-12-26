import { create } from "zustand";
import toast from "react-hot-toast";

const API_BASE = "/api/purchases";

export const usePurchaseStore = create((set, get) => ({
    products: [],
    userPurchases: null,
    loading: false,
    error: null,

    // Fetch all products
    fetchProducts: async (filters = {}) => {
        try {
            set({ loading: true, error: null });
            
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });
            
            const response = await fetch(`${API_BASE}/products?${queryParams}`);
            const data = await response.json();
            
            if (data.success) {
                set({ products: data.products });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            set({ error: error.message });
            toast.error(error.message || "Failed to fetch products");
        } finally {
            set({ loading: false });
        }
    },

    // Fetch user's purchases
    fetchUserPurchases: async () => {
        try {
            const response = await fetch(`${API_BASE}/my-purchases`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success) {
                set({ userPurchases: data.purchases });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("Error fetching user purchases:", error);
        }
    },

    // Create Razorpay order
    createOrder: async (orderData) => {
        try {
            set({ loading: true });
            
            const response = await fetch(`${API_BASE}/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(orderData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            return data;
        } catch (error) {
            toast.error(error.message || "Failed to create order");
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Verify payment
    verifyPayment: async (paymentData) => {
        try {
            set({ loading: true });
            
            const response = await fetch(`${API_BASE}/verify-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(paymentData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Refresh user purchases
                get().fetchUserPurchases();
                
                // Show success message with points earned
                if (data.pointsEarned) {
                    toast.success(`Purchase successful! Earned ${data.pointsEarned} loyalty points! 🎉`);
                }
                
                // Show VIP tier upgrade
                if (data.newVipTier) {
                    toast.success(`Congratulations! You're now ${data.newVipTier.toUpperCase()} VIP! 👑`);
                }
            } else {
                throw new Error(data.message);
            }
            
            return data;
        } catch (error) {
            toast.error(error.message || "Payment verification failed");
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Purchase with wallet
    purchaseWithWallet: async (purchaseData) => {
        try {
            set({ loading: true });
            
            const response = await fetch(`${API_BASE}/wallet/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(purchaseData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Refresh user purchases
                get().fetchUserPurchases();
                toast.success(`Purchase successful! New wallet balance: ₹${data.newBalance}`);
            } else {
                throw new Error(data.message);
            }
            
            return data;
        } catch (error) {
            toast.error(error.message || "Wallet purchase failed");
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Add money to wallet
    addToWallet: async (amount) => {
        try {
            set({ loading: true });
            
            const response = await fetch(`${API_BASE}/wallet/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ amount })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            return data;
        } catch (error) {
            toast.error(error.message || "Failed to create wallet recharge order");
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Verify wallet recharge
    verifyWalletRecharge: async (paymentData) => {
        try {
            set({ loading: true });
            
            const response = await fetch(`${API_BASE}/wallet/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(paymentData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Refresh user purchases to update wallet balance
                get().fetchUserPurchases();
                toast.success(`₹${paymentData.amount} added to wallet successfully! 💰`);
            } else {
                throw new Error(data.message);
            }
            
            return data;
        } catch (error) {
            toast.error(error.message || "Wallet recharge verification failed");
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Apply purchased item
    applyPurchasedItem: async (productId, action) => {
        try {
            set({ loading: true });
            
            const response = await fetch(`${API_BASE}/apply-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ productId, action })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Refresh user purchases
                get().fetchUserPurchases();
                toast.success(data.message);
            } else {
                throw new Error(data.message);
            }
            
            return data;
        } catch (error) {
            toast.error(error.message || "Failed to apply item");
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Get product by ID
    getProductById: (productId) => {
        const { products } = get();
        return products.find(product => product._id === productId);
    },

    // Check if user owns a product
    isProductOwned: (productId) => {
        const { userPurchases } = get();
        return userPurchases?.ownedItems?.some(item => 
            item.productId._id === productId && item.isActive
        ) || false;
    },

    // Get user's active theme
    getActiveTheme: () => {
        const { userPurchases } = get();
        return userPurchases?.preferences?.currentTheme;
    },

    // Get user's active background
    getActiveBackground: () => {
        const { userPurchases } = get();
        return userPurchases?.preferences?.currentBackground;
    },

    // Get user's active badges
    getActiveBadges: () => {
        const { userPurchases } = get();
        return userPurchases?.preferences?.activeBadges || [];
    },

    // Get wallet balance
    getWalletBalance: () => {
        const { userPurchases } = get();
        return userPurchases?.wallet?.balance || 0;
    },

    // Get loyalty points
    getLoyaltyPoints: () => {
        const { userPurchases } = get();
        return userPurchases?.statistics?.loyaltyPoints || 0;
    },

    // Get VIP tier
    getVipTier: () => {
        const { userPurchases } = get();
        return userPurchases?.statistics?.vipTier || 'bronze';
    },

    // Clear store
    clearStore: () => {
        set({
            products: [],
            userPurchases: null,
            loading: false,
            error: null
        });
    }
}));