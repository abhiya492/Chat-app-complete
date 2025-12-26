import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Wallet, 
    Plus, 
    History, 
    CreditCard, 
    X,
    TrendingUp,
    TrendingDown,
    Gift,
    RefreshCw
} from "lucide-react";
import { usePurchaseStore } from "../store/usePurchaseStore";
import toast from "react-hot-toast";

const WalletModal = ({ isOpen, onClose }) => {
    const { 
        userPurchases, 
        addToWallet, 
        verifyWalletRecharge, 
        loading 
    } = usePurchaseStore();

    const [activeTab, setActiveTab] = useState("add");
    const [amount, setAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const walletBalance = userPurchases?.wallet?.balance || 0;
    const transactions = userPurchases?.wallet?.transactions || [];

    const quickAmounts = [50, 100, 200, 500, 1000, 2000];

    const handleAddMoney = async () => {
        const amountNum = parseInt(amount);
        
        if (!amountNum || amountNum < 10 || amountNum > 10000) {
            toast.error("Amount must be between ₹10 and ₹10,000");
            return;
        }

        try {
            setIsProcessing(true);
            
            // Create order for wallet recharge
            const orderData = await addToWallet(amountNum);
            
            if (!orderData.success) {
                throw new Error(orderData.message);
            }

            // Initialize Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: "Chat App Wallet",
                description: `Add ₹${amountNum} to wallet`,
                order_id: orderData.order.id,
                handler: async (response) => {
                    try {
                        const verifyData = await verifyWalletRecharge({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: amountNum
                        });

                        if (verifyData.success) {
                            setAmount("");
                            setActiveTab("history");
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
                    color: "#10B981"
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
            toast.error(error.message || "Failed to add money");
            setIsProcessing(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'credit': return <TrendingUp className="text-green-500" size={16} />;
            case 'debit': return <TrendingDown className="text-red-500" size={16} />;
            case 'refund': return <RefreshCw className="text-blue-500" size={16} />;
            case 'bonus': return <Gift className="text-purple-500" size={16} />;
            case 'referral': return <Gift className="text-orange-500" size={16} />;
            default: return <Wallet size={16} />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-base-100 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-base-300">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                    <Wallet className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">My Wallet</h2>
                                    <p className="text-sm text-base-content/70">Balance: ₹{walletBalance}</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-base-300">
                            <button
                                onClick={() => setActiveTab("add")}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                                    activeTab === "add" 
                                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                                        : "text-base-content/70 hover:text-base-content"
                                }`}
                            >
                                <Plus size={16} className="inline mr-2" />
                                Add Money
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                                    activeTab === "history" 
                                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                                        : "text-base-content/70 hover:text-base-content"
                                }`}
                            >
                                <History size={16} className="inline mr-2" />
                                History
                            </button>
                        </div>

                        <div className="p-6 max-h-96 overflow-y-auto">
                            {activeTab === "add" ? (
                                // Add Money Tab
                                <div className="space-y-6">
                                    {/* Current Balance */}
                                    <div className="text-center p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
                                        <div className="text-sm opacity-90 mb-1">Current Balance</div>
                                        <div className="text-3xl font-bold">₹{walletBalance}</div>
                                    </div>

                                    {/* Quick Amount Buttons */}
                                    <div>
                                        <label className="block text-sm font-medium mb-3">Quick Add</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {quickAmounts.map((quickAmount) => (
                                                <button
                                                    key={quickAmount}
                                                    onClick={() => setAmount(quickAmount.toString())}
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    ₹{quickAmount}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Amount */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Custom Amount</label>
                                        <input
                                            type="number"
                                            placeholder="Enter amount (₹10 - ₹10,000)"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="input input-bordered w-full"
                                            min="10"
                                            max="10000"
                                        />
                                    </div>

                                    {/* Payment Info */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                                            <CreditCard size={16} />
                                            <span className="font-medium">Secure Payment</span>
                                        </div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Pay securely using UPI, Cards, or Net Banking via Razorpay
                                        </p>
                                    </div>

                                    {/* Add Money Button */}
                                    <button
                                        onClick={handleAddMoney}
                                        disabled={!amount || isProcessing || loading}
                                        className="btn btn-primary w-full"
                                    >
                                        {isProcessing || loading ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            `Add ₹${amount || 0} to Wallet`
                                        )}
                                    </button>
                                </div>
                            ) : (
                                // Transaction History Tab
                                <div className="space-y-4">
                                    {transactions.length > 0 ? (
                                        transactions
                                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                            .map((transaction, index) => (
                                            <div 
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-base-200 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getTransactionIcon(transaction.type)}
                                                    <div>
                                                        <div className="font-medium capitalize">
                                                            {transaction.description || transaction.type}
                                                        </div>
                                                        <div className="text-sm text-base-content/70">
                                                            {formatDate(transaction.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`font-bold ${
                                                    transaction.type === 'credit' || transaction.type === 'refund' || transaction.type === 'bonus' || transaction.type === 'referral'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}>
                                                    {transaction.type === 'credit' || transaction.type === 'refund' || transaction.type === 'bonus' || transaction.type === 'referral' ? '+' : '-'}
                                                    ₹{transaction.amount}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <History className="mx-auto text-base-content/30 mb-4" size={48} />
                                            <h3 className="font-semibold mb-2">No transactions yet</h3>
                                            <p className="text-base-content/70 text-sm">
                                                Your wallet transactions will appear here
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default WalletModal;