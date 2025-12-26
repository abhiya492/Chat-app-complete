import React, { useEffect } from 'react';

const GoogleAds = ({ 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block', width: '100%', height: '280px' }
}) => {
  useEffect(() => {
    try {
      // Load AdSense script if not already loaded
      if (!window.adsbygoogle) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      // Push ad to AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className="ad-container my-4">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
      <div className="text-xs text-gray-400 text-center mt-1">Advertisement</div>
    </div>
  );
};

// Different ad components for different placements
export const BannerAd = () => (
  <GoogleAds 
    adSlot="1234567890"
    style={{ display: 'block', width: '100%', height: '90px' }}
  />
);

export const SquareAd = () => (
  <GoogleAds 
    adSlot="0987654321"
    style={{ display: 'block', width: '300px', height: '250px', margin: '0 auto' }}
  />
);

export const VideoCallAd = () => (
  <div className="absolute bottom-4 left-4 right-4 z-40">
    <GoogleAds 
      adSlot="1122334455"
      style={{ display: 'block', width: '100%', height: '60px' }}
    />
  </div>
);

export default GoogleAds;