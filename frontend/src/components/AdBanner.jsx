import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const AdBanner = ({ placement = 'bottom' }) => {
  const [showAd, setShowAd] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const { authUser } = useAuthStore();

  useEffect(() => {
    checkSubscription();
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
  if (!subscription || subscription.plan !== 'free' || !showAd) {
    return null;
  }

  const ads = [
    {
      title: "Upgrade to Pro - Remove Ads!",
      description: "Get ad-free experience + voice/video calls",
      cta: "Upgrade Now",
      link: "/upi-payment",
      color: "bg-blue-500"
    },
    {
      title: "🎮 Play Games Ad-Free",
      description: "Enjoy uninterrupted gaming experience",
      cta: "Go Pro",
      link: "/upi-payment", 
      color: "bg-purple-500"
    },
    {
      title: "📞 Make Voice & Video Calls",
      description: "Connect with friends through calls",
      cta: "Upgrade",
      link: "/upi-payment",
      color: "bg-green-500"
    }
  ];

  const randomAd = ads[Math.floor(Math.random() * ads.length)];

  const positionClasses = {
    bottom: 'fixed bottom-4 left-4 right-4 z-50',
    top: 'mb-4',
    sidebar: 'mb-4'
  };

  return (
    <div className={`${positionClasses[placement]} max-w-sm mx-auto`}>
      <div className={`${randomAd.color} text-white rounded-lg p-4 shadow-lg relative`}>
        <button
          onClick={() => setShowAd(false)}
          className="absolute top-2 right-2 text-white/80 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="pr-6">
          <h4 className="font-semibold text-sm mb-1">{randomAd.title}</h4>
          <p className="text-xs text-white/90 mb-3">{randomAd.description}</p>
          
          <a
            href={randomAd.link}
            className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-medium transition-colors"
          >
            {randomAd.cta}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        
        <div className="absolute bottom-1 right-2 text-xs text-white/60">
          Ad
        </div>
      </div>
    </div>
  );
};

export default AdBanner;