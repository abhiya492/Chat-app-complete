import React, { useState, useEffect } from 'react';
import GoogleAds, { BannerAd, SquareAd } from './GoogleAds';
import FacebookAds from './FacebookAds';
import { useAuthStore } from '../store/useAuthStore';

const AdManager = ({ placement, className = '' }) => {
  const [subscription, setSubscription] = useState(null);
  const [adNetwork, setAdNetwork] = useState('google'); // 'google', 'facebook', 'custom'
  const { authUser } = useAuthStore();

  useEffect(() => {
    checkSubscription();
    // Rotate ad networks for better revenue
    const networks = ['google', 'facebook'];
    setAdNetwork(networks[Math.floor(Math.random() * networks.length)]);
  }, []);

  const checkSubscription = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/upi/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt') || document.cookie.split('jwt=')[1]?.split(';')[0]}`
        }
      });
      const data = await res.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Failed to check subscription');
    }
  };

  // Don't show ads for Pro+ users
  if (!subscription || subscription.plan !== 'free') {
    return null;
  }

  const renderAd = () => {
    switch (placement) {
      case 'chat-sidebar':
        return adNetwork === 'google' ? 
          <SquareAd /> : 
          <FacebookAds placementId="YOUR_FB_PLACEMENT_ID_1" format="rectangle" />;
      
      case 'chat-bottom':
        return adNetwork === 'google' ? 
          <BannerAd /> : 
          <FacebookAds placementId="YOUR_FB_PLACEMENT_ID_2" format="banner" />;
      
      case 'video-call':
        return (
          <div className="absolute bottom-4 left-4 right-4 z-40 bg-black/80 rounded-lg p-2">
            {adNetwork === 'google' ? 
              <GoogleAds 
                adSlot="VIDEO_CALL_SLOT"
                style={{ display: 'block', width: '100%', height: '60px' }}
              /> : 
              <FacebookAds placementId="YOUR_FB_PLACEMENT_ID_3" format="banner" />
            }
          </div>
        );
      
      case 'game-interstitial':
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-md mx-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold">Game Sponsored by</h3>
              </div>
              {adNetwork === 'google' ? 
                <SquareAd /> : 
                <FacebookAds placementId="YOUR_FB_PLACEMENT_ID_4" format="rectangle" />
              }
              <button 
                onClick={() => document.querySelector('.game-interstitial')?.remove()}
                className="w-full mt-4 btn btn-sm btn-primary"
              >
                Continue Game
              </button>
            </div>
          </div>
        );
      
      default:
        return <BannerAd />;
    }
  };

  return (
    <div className={`ad-manager ${className}`}>
      {renderAd()}
    </div>
  );
};

// Revenue tracking component
export const AdRevenue = () => {
  const [revenue, setRevenue] = useState({ daily: 0, monthly: 0, total: 0 });

  useEffect(() => {
    // This would connect to your ad network APIs to get real revenue data
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    // Mock data - replace with real API calls
    setRevenue({
      daily: 150,    // ₹150/day
      monthly: 4500, // ₹4,500/month  
      total: 25000   // ₹25,000 total
    });
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-green-800 mb-2">📊 Ad Revenue</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-600">₹{revenue.daily}</div>
          <div className="text-sm text-green-700">Today</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">₹{revenue.monthly}</div>
          <div className="text-sm text-green-700">This Month</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">₹{revenue.total}</div>
          <div className="text-sm text-green-700">Total</div>
        </div>
      </div>
    </div>
  );
};

export default AdManager;