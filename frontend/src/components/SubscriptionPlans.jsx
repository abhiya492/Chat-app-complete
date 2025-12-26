import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const SubscriptionPlans = () => {
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuthStore();

  const plans = {
    free: { price: 0, messages: '1,000', storage: '100MB', users: '10', popular: false },
    pro: { price: 299, messages: 'Unlimited', storage: '10GB', users: '100', popular: true },
    enterprise: { price: 999, messages: 'Unlimited', storage: '1TB', users: 'Unlimited', popular: false }
  };

  const handleUpgrade = async (planName) => {
    if (planName === 'free') return;
    
    setLoading(true);
    try {
      // Create order
      const orderRes = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName })
      });
      const order = await orderRes.json();

      // Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Chat App Pro',
        description: `${planName.toUpperCase()} Plan Subscription`,
        order_id: order.orderId,
        handler: async (response) => {
          // Verify payment
          const verifyRes = await fetch('/api/subscription/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              plan: planName
            })
          });
          
          if (verifyRes.ok) {
            toast.success('Subscription activated successfully!');
            window.location.reload();
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: authUser?.fullName,
          email: authUser?.email
        },
        theme: { color: '#3B82F6' },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to create payment order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600">Upgrade for unlimited messaging and premium features</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(plans).map(([planName, plan]) => (
          <div key={planName} className={`border rounded-lg p-6 relative ${plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Most Popular</span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-bold capitalize mb-2">{planName}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">₹{plan.price}</span>
                {plan.price > 0 && <span className="text-gray-500">/month</span>}
              </div>
              
              <ul className="space-y-2 mb-6 text-left">
                <li>📱 {plan.messages} messages/month</li>
                <li>💾 {plan.storage} storage</li>
                <li>👥 Up to {plan.users} users</li>
                {planName !== 'free' && <li>🔒 Advanced encryption</li>}
                {planName === 'enterprise' && <li>📊 Analytics dashboard</li>}
              </ul>
              
              <button
                onClick={() => handleUpgrade(planName)}
                disabled={loading || planName === 'free'}
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  planName === 'free' 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-800 text-white hover:bg-gray-900'
                } transition-colors`}
              >
                {planName === 'free' ? 'Current Plan' : loading ? 'Processing...' : 'Upgrade Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>💳 Secure payments via UPI, Cards, Net Banking & Wallets</p>
        <p>🔒 256-bit SSL encryption • 30-day money-back guarantee</p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;