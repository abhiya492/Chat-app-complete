import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const OfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing messages...');
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You\'re offline. Messages will be sent when reconnected.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (message) => {
    setOfflineQueue(prev => [...prev, { ...message, timestamp: Date.now() }]);
  };

  const processOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;

    for (const queuedMessage of offlineQueue) {
      try {
        // Process queued message
        console.log('Processing offline message:', queuedMessage);
        // Add your message sending logic here
      } catch (error) {
        console.error('Failed to send queued message:', error);
      }
    }

    setOfflineQueue([]);
  };

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-16 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-warning text-warning-content p-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">You're offline</span>
          </div>
        </div>
      )}

      {/* Offline Queue Indicator */}
      {offlineQueue.length > 0 && (
        <div className="fixed bottom-20 right-4 bg-info text-info-content p-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span className="text-sm">
              {offlineQueue.length} message{offlineQueue.length > 1 ? 's' : ''} queued
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineSupport;