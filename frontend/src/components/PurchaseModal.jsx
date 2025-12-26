import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    CreditCard, 
    Wallet, 
    Smartphone, 
    Shield, 
    X, 
    Check,
    AlertCircle,
    Gift,
    Percent
} from "lucide-react";
import { usePurchaseStore } from "../store/usePurchaseStore";
import toast from "react-hot-toast";

const PurchaseModal = ({ product, isOpen, onClose }) => {
    const { 
        userPurchases, 
        createOrder, 
        verifyPayment, 
        purchaseWithWallet,
        loading 
    } = usePurchaseStore();

    const [paymentMethod, setPaymentMethod] = useState("razorpay");
    const [couponCode, setCouponCode] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const walletBalance = userPurchases?.wallet?.balance || 0;
    const hasDiscount = product?.seasonalOffer?.isActive && 
        new Date() >= new Date(product.seasonalOffer.startDate) && 
        new Date() <= new Date(product.seasonalOffer.endDate);

    const discountedPrice = hasDiscount 
        ? product?.price - (product?.price * product.seasonalOffer.discountPercent / 100)
        : product?.price || 0;

    const finalPrice = Math.round(discountedPrice);
    const canPayWithWallet = walletBalance >= finalPrice;

    useEffect(() => {
        if (isOpen) {
            setPaymentMethod(canPayWithWallet ? "wallet" : "razorpay");
            setCouponCode("");
            setShowConfirmation(false);
        }
    }, [isOpen, canPayWithWallet]);

    const handleRazorpayPayment = async () => {
        try {
            setIsProcessing(true);
            
            // Create order
            const orderData = await createOrder({
                productId: product._id,
                couponCode
            });

            if (!orderData.success) {
                throw new Error(orderData.message);
            }

            // Initialize Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: "Chat App Store",
                description: `Purchase ${product.name}`,
                order_id: orderData.order.id,
                handler: async (response) => {
                    try {
                        const verifyData = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            productId: product._id
                        });

                        if (verifyData.success) {
                            toast.success("Purchase successful! 🎉");
                            setShowConfirmation(true);
                            setTimeout(() => {
                                onClose();
                            }, 2000);
                        } else {
                            throw new Error(verifyData.message);
                        }
                    } catch (error) {
                        toast.error(error.message || "Payment verification failed");
                    }
                },
                prefill: {
                    name: "User",
                    email: "user@example.com"
                },
                theme: {
                    color: "#3B82F6"
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            toast.error(error.message || "Failed to create order");
            setIsProcessing(false);
        }
    };

    const handleWalletPayment = async () => {
        try {
            setIsProcessing(true);
            
            const result = await purchaseWithWallet({
                productId: product._id
            });

            if (result.success) {
                toast.success("Purchase successful! 🎉");
                setShowConfirmation(true);
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            toast.error(error.message || "Wallet payment failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePurchase = () => {
        if (paymentMethod === "wallet") {
            handleWalletPayment();
        } else {
            handleRazorpayPayment();
        }
    };

    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-base-100 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                    >
                        {showConfirmation ? (
                            // Success Screen
                            <div className="p-6 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <Check className="text-white" size={32} />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-green-600 mb-2">Purchase Successful!</h3>
                                <p className="text-base-content/70 mb-4">
                                    {product.name} has been added to your collection
                                </p>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        You can now use this item in your profile settings
                                    </p>
                                </div>
                            </div>
                        ) : (
                            // Purchase Form
                            <>
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-base-300">
                                    <h2 className="text-xl font-bold">Complete Purchase</h2>
                                    <button 
                                        onClick={onClose}
                                        className="btn btn-sm btn-circle btn-ghost"
                                        disabled={isProcessing}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Product Summary */}
                                    <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl">
                                            {product.category === 'theme' && '🎨'}
                                            {product.category === 'emoji_pack' && '😀'}
                                            {product.category === 'voice_effect' && '🎤'}
                                            {product.category === 'profile_badge' && '🏆'}
                                            {product.category === 'chat_background' && '🖼️'}
                                            {product.category === 'bundle' && '📦'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{product.name}</h3>
                                            <p className="text-sm text-base-content/70 line-clamp-2">
                                                {product.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Discount Info */}
                                    {hasDiscount && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                                <Percent size={16} />
                                                <span className="font-medium">
                                                    {product.seasonalOffer.offerName || 'Special Offer'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                                Save {product.seasonalOffer.discountPercent}% on this item!
                                            </p>
                                        </div>
                                    )}

                                    {/* Payment Methods */}
                                    <div>
                                        <h3 className="font-semibold mb-3">Payment Method</h3>
                                        <div className="space-y-3">
                                            {/* Wallet Payment */}
                                            <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                paymentMethod === "wallet" 
                                                    ? "border-primary bg-primary/10" 
                                                    : "border-base-300 hover:border-base-400"
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="wallet"
                                                    checked={paymentMethod === "wallet"}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="radio radio-primary"
                                                    disabled={!canPayWithWallet}
                                                />
                                                <Wallet className="text-green-500" size={20} />
                                                <div className="flex-1">
                                                    <div className="font-medium">Wallet Balance</div>
                                                    <div className="text-sm text-base-content/70">
                                                        Available: ₹{walletBalance}
                                                        {!canPayWithWallet && (
                                                            <span className="text-red-500 ml-2">
                                                                (Insufficient balance)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {canPayWithWallet && (
                                                    <div className="badge badge-success">Instant</div>
                                                )}
                                            </label>

                                            {/* Razorpay Payment */}
                                            <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                paymentMethod === "razorpay" 
                                                    ? "border-primary bg-primary/10" 
                                                    : "border-base-300 hover:border-base-400"
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="razorpay"
                                                    checked={paymentMethod === "razorpay"}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="radio radio-primary"
                                                />
                                                <CreditCard className="text-blue-500" size={20} />
                                                <div className="flex-1">
                                                    <div className="font-medium">Card / UPI / Net Banking</div>
                                                    <div className="text-sm text-base-content/70">
                                                        Secure payment via Razorpay
                                                    </div>
                                                </div>
                                                <div className="badge badge-info">Secure</div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="bg-base-200 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span>Item Price</span>
                                            <span>₹{product.price}</span>
                                        </div>
                                        {hasDiscount && (
                                            <div className="flex justify-between items-center mb-2 text-green-600">
                                                <span>Discount ({product.seasonalOffer.discountPercent}%)</span>
                                                <span>-₹{Math.round(product.price - discountedPrice)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-base-300 pt-2 mt-2">
                                            <div className="flex justify-between items-center font-bold text-lg">
                                                <span>Total</span>
                                                <span className="text-primary">₹{finalPrice}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Notice */}
                                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <Shield className="text-blue-500 mt-0.5" size={16} />
                                        <div className="text-sm text-blue-700 dark:text-blue-300">
                                            <p className="font-medium mb-1">Secure Payment</p>
                                            <p>Your payment information is encrypted and secure. We don't store your card details.</p>
                                        </div>
                                    </div>

                                    {/* Purchase Button */}
                                    <button
                                        onClick={handlePurchase}
                                        disabled={isProcessing || loading}
                                        className="btn btn-primary w-full"
                                    >
                                        {isProcessing || loading ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            `Pay ₹${finalPrice}`
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PurchaseModal;