import React, { useEffect, useRef } from 'react';

const FacebookAds = ({ placementId, format = 'banner' }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Load Facebook Audience Network SDK
    if (!window.fbAsyncInit) {
      window.fbAsyncInit = function() {
        FB.init({
          appId: 'YOUR_FB_APP_ID',
          xfbml: true,
          version: 'v18.0'
        });
      };

      // Load SDK
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      document.head.appendChild(script);
    }

    // Initialize ad after SDK loads
    const initAd = () => {
      if (window.FB && adRef.current) {
        try {
          window.FB.XFBML.parse(adRef.current);
        } catch (error) {
          console.error('Facebook Ads error:', error);
        }
      }
    };

    if (window.FB) {
      initAd();
    } else {
      window.addEventListener('fbAsyncInit', initAd);
    }

    return () => {
      window.removeEventListener('fbAsyncInit', initAd);
    };
  }, [placementId]);

  const getAdComponent = () => {
    switch (format) {
      case 'banner':
        return (
          <div 
            className="fb-ad" 
            data-placementid={placementId}
            data-format="auto"
            data-testmode="false"
          />
        );
      case 'rectangle':
        return (
          <div 
            className="fb-ad" 
            data-placementid={placementId}
            data-format="300x250"
            data-testmode="false"
          />
        );
      case 'interstitial':
        return (
          <div 
            className="fb-ad" 
            data-placementid={placementId}
            data-format="interstitial"
            data-testmode="false"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div ref={adRef} className="facebook-ad-container my-4">
      {getAdComponent()}
      <div className="text-xs text-gray-400 text-center mt-1">Sponsored</div>
    </div>
  );
};

export default FacebookAds;