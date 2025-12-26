import { motion } from "framer-motion";
import { 
    Star, 
    ShoppingCart, 
    Eye, 
    Download, 
    Crown,
    Sparkles,
    Heart,
    Gift,
    Check
} from "lucide-react";
import { useState } from "react";

const ProductCard = ({ product, isOwned, onPurchase }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const getCategoryIcon = (category) => {
        const icons = {
            theme: "🎨",
            emoji_pack: "😀",
            voice_effect: "🎤",
            profile_badge: "🏆",
            chat_background: "🖼️",
            bundle: "📦"
        };
        return icons[category] || "🛍️";
    };

    const getCategoryColor = (category) => {
        const colors = {
            theme: "from-purple-500 to-pink-500",
            emoji_pack: "from-yellow-500 to-orange-500",
            voice_effect: "from-blue-500 to-cyan-500",
            profile_badge: "from-green-500 to-emerald-500",
            chat_background: "from-indigo-500 to-purple-500",
            bundle: "from-red-500 to-pink-500"
        };
        return colors[category] || "from-gray-500 to-gray-600";
    };

    const hasDiscount = product.seasonalOffer?.isActive && 
        new Date() >= new Date(product.seasonalOffer.startDate) && 
        new Date() <= new Date(product.seasonalOffer.endDate);

    const discountedPrice = hasDiscount 
        ? product.price - (product.price * product.seasonalOffer.discountPercent / 100)
        : product.price;

    return (
        <motion.div
            className="bg-base-100 rounded-xl shadow-lg overflow-hidden border border-base-300 hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            {/* Product Image/Preview */}
            <div className={`relative h-48 bg-gradient-to-br ${getCategoryColor(product.category)} p-6`}>
                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                    {getCategoryIcon(product.category)} {product.category.replace('_', ' ').toUpperCase()}
                </div>

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{product.seasonalOffer.discountPercent}%
                    </div>
                )}

                {/* Owned Badge */}
                {isOwned && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Check size={12} />
                        OWNED
                    </div>
                )}

                {/* Product Preview */}
                <div className="flex items-center justify-center h-full">
                    {product.preview?.images?.[0] ? (
                        <img 
                            src={product.preview.images[0]} 
                            alt={product.name}
                            className="max-h-32 max-w-32 object-contain rounded-lg"
                        />
                    ) : (
                        <div className="text-6xl text-white/80">
                            {getCategoryIcon(product.category)}
                        </div>
                    )}
                </div>

                {/* Preview Button */}
                <motion.button
                    className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full opacity-0 hover:bg-white/30 transition-all"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    onClick={() => setShowPreview(true)}
                >
                    <Eye size={16} />
                </motion.button>
            </div>

            {/* Product Info */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm">{product.rating?.average?.toFixed(1) || '0.0'}</span>
                    </div>
                </div>

                <p className="text-base-content/70 text-sm mb-3 line-clamp-2">
                    {product.description}
                </p>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags.slice(0, 3).map((tag, index) => (
                            <span 
                                key={index}
                                className="bg-base-200 text-xs px-2 py-1 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Price and Purchase */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {hasDiscount ? (
                            <>
                                <span className="text-lg font-bold text-primary">
                                    ₹{Math.round(discountedPrice)}
                                </span>
                                <span className="text-sm text-base-content/50 line-through">
                                    ₹{product.price}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-primary">
                                ₹{product.price}
                            </span>
                        )}
                    </div>

                    {isOwned ? (
                        <button className="btn btn-sm btn-success" disabled>
                            <Check size={16} />
                            Owned
                        </button>
                    ) : (
                        <button 
                            onClick={onPurchase}
                            className="btn btn-sm btn-primary"
                        >
                            <ShoppingCart size={16} />
                            Buy Now
                        </button>
                    )}
                </div>

                {/* Popularity Indicator */}
                <div className="mt-3 flex items-center justify-between text-xs text-base-content/50">
                    <span>{product.totalSales || 0} sold</span>
                    <div className="flex items-center gap-1">
                        <Sparkles size={12} />
                        <span>Popularity: {product.popularity || 0}</span>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-base-100 rounded-xl p-6 max-w-md w-full"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">{product.name}</h3>
                            <button 
                                onClick={() => setShowPreview(false)}
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Preview Content */}
                        <div className="space-y-4">
                            {product.preview?.images && (
                                <div className="grid grid-cols-2 gap-2">
                                    {product.preview.images.map((image, index) => (
                                        <img 
                                            key={index}
                                            src={image} 
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                    ))}
                                </div>
                            )}

                            {product.preview?.video && (
                                <video 
                                    src={product.preview.video} 
                                    controls 
                                    className="w-full rounded-lg"
                                />
                            )}

                            <p className="text-sm text-base-content/70">
                                {product.description}
                            </p>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        setShowPreview(false);
                                        onPurchase();
                                    }}
                                    className="btn btn-primary flex-1"
                                    disabled={isOwned}
                                >
                                    {isOwned ? 'Already Owned' : `Buy for ₹${Math.round(discountedPrice)}`}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default ProductCard;