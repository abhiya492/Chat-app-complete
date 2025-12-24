import { useState, useEffect } from 'react';
import { useWellnessStore } from '../store/useWellnessStore';
import WellnessWidgetService from '../lib/wellnessWidget.service';
import { Smartphone, Download, Home } from 'lucide-react';

const WellnessWidget = () => {
  const { moodScore, stressLevel, updateMood } = useWellnessStore();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Update widget when mood changes
    WellnessWidgetService.updateMoodWidget(moodScore, stressLevel);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [moodScore, stressLevel]);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // Register wellness widget after install
        setTimeout(() => {
          WellnessWidgetService.registerWidget();
        }, 2000);
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const quickMoodUpdate = (newMood) => {
    updateMood(newMood);
    WellnessWidgetService.updateMoodWidget(newMood, stressLevel);
  };

  return (
    <>
      {/* Quick Mood Widget */}
      <div className="fixed bottom-20 right-4 z-20">
        <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-3 text-primary-content shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4" />
            <span className="text-xs font-medium">Quick Mood</span>
          </div>
          
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(mood => (
              <button
                key={mood}
                onClick={() => quickMoodUpdate(mood)}
                className={`btn btn-xs ${moodScore === mood ? 'btn-accent' : 'btn-ghost'}`}
                title={`Mood ${mood}`}
              >
                {mood <= 1 ? '😢' : mood <= 2 ? '😔' : mood <= 3 ? '😐' : mood <= 4 ? '😊' : '😄'}
              </button>
            ))}
          </div>
          
          <div className="text-xs opacity-80 mt-1">
            Current: {moodScore}/5
          </div>
        </div>
      </div>

      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed top-4 left-4 right-4 z-40">
          <div className="alert alert-info shadow-lg max-w-md mx-auto">
            <Home className="w-5 h-5" />
            <div className="flex-1">
              <h3 className="font-bold text-sm">Add to Home Screen</h3>
              <p className="text-xs">Get a wellness widget for quick mood tracking!</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleInstallPWA}
                className="btn btn-sm btn-primary"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
              <button 
                onClick={() => setShowInstallPrompt(false)}
                className="btn btn-sm btn-ghost"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WellnessWidget;