import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if dismissed recently (24 hours)
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
    return null;
  }

  if (!showInstall && !isIOS) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-primary text-primary-content p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-start gap-3">
        <Smartphone className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Install Chatty</h3>
          <p className="text-xs opacity-90 mt-1">
            {isIOS 
              ? "Tap Share → Add to Home Screen for the best experience"
              : "Install our app for faster access and notifications"
            }
          </p>
          {!isIOS && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="btn btn-sm btn-secondary"
              >
                <Download className="w-3 h-3" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="btn btn-sm btn-ghost"
              >
                Later
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="btn btn-ghost btn-xs btn-circle"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstall;