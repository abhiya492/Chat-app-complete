import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ShoppingBag, 
    Filter, 
    Search, 
    Star, 
    Wallet, 
    Gift,
    Crown,
    Sparkles,
    Heart,
    Download
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { usePurchaseStore } from "../store/usePurchaseStore";
import ProductCard from "./ProductCard";
import PurchaseModal from "./PurchaseModal";
import WalletModal from "./WalletModal";
import toast from "react-hot-toast";

const Store = () => {
    const { authUser } = useAuthStore();
    const { 
        products, 
        userPurchases, 
        loading, 
        fetchProducts, 
        fetchUserPurchases 
    } = usePurchaseStore();

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("popularity");
    const [priceRange, setPriceRange] = useState([0, 500]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const categories = [
        { id: "all", name: "All Items", icon: "🛍️", count: 0 },
        { id: "theme", name: "Custom Themes", icon: "🎨", price: "₹29", count: 0 },
        { id: "emoji_pack", name: "Emoji Packs", icon: "😀", price: "₹19", count: 0 },
        { id: "voice_effect", name: "Voice Effects", icon: "🎤", price: "₹39", count: 0 },
        { id: "profile_badge", name: "Profile Badges", icon: "🏆", price: "₹49", count: 0 },
        { id: "chat_background", name: "Chat Backgrounds", icon: "🖼️", price: "₹25", count: 0 },
        { id: "bundle", name: "Bundle Deals", icon: "📦", price: "Save 30%", count: 0 },
    ];

    useEffect(() => {
        fetchProducts();
        if (authUser) {
            fetchUserPurchases();
        }
    }, [fetchProducts, fetchUserPurchases, authUser]);

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        return matchesCategory && matchesSearch && matchesPrice;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case "price_low": return a.price - b.price;
            case "price_high": return b.price - a.price;
            case "newest": return new Date(b.createdAt) - new Date(a.createdAt);
            case "rating": return b.rating.average - a.rating.average;
            default: return b.popularity - a.popularity;
        }
    });

    const handlePurchase = (product) => {
        if (!authUser) {
            toast.error("Please login to make purchases");
            return;
        }
        setSelectedProduct(product);
        setShowPurchaseModal(true);
    };

    const isOwned = (productId) => {
        return userPurchases?.ownedItems?.some(item => 
            item.productId._id === productId && item.isActive
        );
    };

    const getVipBadge = () => {
        const tier = userPurchases?.statistics?.vipTier || 'bronze';
        const badges = {
            bronze: { icon: "🥉", color: "text-amber-600" },
            silver: { icon: "🥈", color: "text-gray-400" },
            gold: { icon: "🥇", color: "text-yellow-500" },
            platinum: { icon: "💎", color: "text-blue-400" },
            diamond: { icon: "💠", color: "text-purple-500" }
        };
        return badges[tier];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Premium Store
                    </h1>
                    <p className="text-base-content/70">
                        Customize your chat experience with premium themes, emojis, and more!
                    </p>
                </div>
                
                {authUser && (
                    <div className="flex items-center gap-4 mt-4 lg:mt-0">
                        {/* VIP Badge */}
                        <div className="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                            <span className={`text-lg ${getVipBadge().color}`}>
                                {getVipBadge().icon}
                            </span>
                            <span className="font-medium capitalize">
                                {userPurchases?.statistics?.vipTier || 'Bronze'} VIP
                            </span>
                        </div>

                        {/* Wallet Balance */}
                        <button
                            onClick={() => setShowWalletModal(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all"
                        >
                            <Wallet size={18} />
                            <span>₹{userPurchases?.wallet?.balance || 0}</span>
                        </button>

                        {/* Loyalty Points */}
                        <div className="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                            <Star className="text-yellow-500" size={18} />
                            <span>{userPurchases?.statistics?.loyaltyPoints || 0} pts</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input input-bordered w-full pl-10"
                    />
                </div>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="select select-bordered"
                >
                    <option value="popularity">Most Popular</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="rating">Highest Rated</option>
                </select>

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-outline"
                >
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {/* Price Range Filter */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-base-200 p-4 rounded-lg mb-6"
                    >
                        <h3 className="font-semibold mb-3">Price Range</h3>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="500"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                className="range range-primary flex-1"
                            />
                            <span className="text-sm font-medium">₹0 - ₹{priceRange[1]}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                {categories.map((category) => (
                    <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-4 rounded-xl text-center transition-all ${
                            selectedCategory === category.id
                                ? "bg-primary text-primary-content shadow-lg"
                                : "bg-base-200 hover:bg-base-300"
                        }`}
                    >
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <div className="text-sm font-medium">{category.name}</div>
                        {category.price && (
                            <div className="text-xs opacity-70 mt-1">{category.price}</div>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        isOwned={isOwned(product._id)}
                        onPurchase={() => handlePurchase(product)}
                    />
                ))}
            </div>

            {/* Empty State */}
            {sortedProducts.length === 0 && (
                <div className="text-center py-12">
                    <ShoppingBag className="mx-auto text-base-content/30 mb-4" size={64} />
                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                    <p className="text-base-content/70">Try adjusting your search or filters</p>
                </div>
            )}

            {/* Modals */}
            <PurchaseModal
                product={selectedProduct}
                isOpen={showPurchaseModal}
                onClose={() => {
                    setShowPurchaseModal(false);
                    setSelectedProduct(null);
                }}
            />

            <WalletModal
                isOpen={showWalletModal}
                onClose={() => setShowWalletModal(false)}
            />
        </div>
    );
};

export default Store;