import React, { useState, useEffect } from 'react';
import { Crown, Users, MessageSquare, HardDrive, Zap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const SubscriptionStatus = () => {
  const [status, setStatus] = useState(null);
  const { authUser } = useAuthStore();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/upi/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt') || document.cookie.split('jwt=')[1]?.split(';')[0]}`
        }
      });
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch subscription status');
    }
  };

  if (!status) return null;

  const planColors = {
    free: 'bg-gray-100 text-gray-800 border-gray-300',
    pro: 'bg-blue-100 text-blue-800 border-blue-300',
    premium: 'bg-purple-100 text-purple-800 border-purple-300',
    enterprise: 'bg-gold-100 text-gold-800 border-gold-300'
  };

  const planFeatures = {
    free: { messages: 'Unlimited', storage: '100MB', users: '10', calls: '✅ With Ads', ads: '✅ Ads' },
    pro: { messages: 'Unlimited', storage: '10GB', users: '100', calls: '✅ Ad-free', ads: '❌ Ad-free' },
    enterprise: { messages: 'Unlimited', storage: '50GB', users: 'Unlimited', calls: '✅ Ad-free', ads: '❌ Ad-free' }
  };

  const features = planFeatures[status.subscription.plan];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold">Subscription Status</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${planColors[status.subscription.plan]}`}>
          {status.subscription.plan.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div className="text-center">
          <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <div className="text-sm text-gray-600">Messages</div>
          <div className="font-semibold">{features.messages}</div>
        </div>
        <div className="text-center">
          <HardDrive className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <div className="text-sm text-gray-600">Storage</div>
          <div className="font-semibold">{features.storage}</div>
        </div>
        <div className="text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <div className="text-sm text-gray-600">Users</div>
          <div className="font-semibold">{features.users}</div>
        </div>
        <div className="text-center">
          <Zap className="w-6 h-6 mx-auto mb-2 text-orange-500" />
          <div className="text-sm text-gray-600">Calls</div>
          <div className="font-semibold">{features.calls}</div>
        </div>
        <div className="text-center">
          <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
          <div className="text-sm text-gray-600">Experience</div>
          <div className="font-semibold">{features.ads}</div>
        </div>
      </div>

      {status.subscription.plan === 'free' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-800">Remove ads from calls & chat!</div>
              <div className="text-sm text-blue-600">Upgrade to Pro for ad-free experience</div>
            </div>
            <a href="/upi-payment" className="btn btn-sm btn-primary">
              Upgrade Now
            </a>
          </div>
        </div>
      )}

      {status.subscription.plan !== 'free' && status.subscription.endDate && (
        <div className="text-sm text-gray-600 text-center">
          Valid until: {new Date(status.subscription.endDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;