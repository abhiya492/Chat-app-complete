import React, { useState, useEffect } from 'react';
import { X, Crown } from 'lucide-react';

const VideoCallAd = ({ isVisible, onClose, subscription }) => {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    if (isVisible && subscription?.plan === 'free') {
      // Show ad after 30 seconds of call
      const timer = setTimeout(() => {
        setShowAd(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, subscription]);

  // Don't show for Pro+ users
  if (!showAd || subscription?.plan !== 'free') {
    return null;
  }

  const handleUpgrade = () => {
    window.open('/upi-payment', '_blank');
    setShowAd(false);
  };

  const handleClose = () => {
    setShowAd(false);
    // Show again after 2 minutes
    setTimeout(() => setShowAd(true), 120000);
  };

  return (
    <div className="absolute top-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-4 shadow-lg max-w-xs animate-slide-in">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="pr-6">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4" />
          <h4 className="font-semibold text-sm">Upgrade to Pro</h4>
        </div>
        
        <p className="text-xs text-white/90 mb-3">
          Enjoy ad-free video calls with crystal clear quality!
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleUpgrade}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-medium transition-colors flex-1"
          >
            Upgrade ₹199
          </button>
          <button
            onClick={handleClose}
            className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-xs transition-colors"
          >
            Later
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-1 right-2 text-xs text-white/60">
        Ad
      </div>
    </div>
  );
};

export default VideoCallAd;