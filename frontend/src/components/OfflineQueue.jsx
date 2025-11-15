import { useEffect, useState } from 'react';
import { WifiOff, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const OfflineQueue = () => {
  const [queuedMessages, setQueuedMessages] = useState([]);

  useEffect(() => {
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    setQueuedMessages(queue);

    const handleOnline = async () => {
      const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
      if (queue.length > 0) {
        toast.success(`Sending ${queue.length} queued message(s)...`);
        window.dispatchEvent(new CustomEvent('processOfflineQueue'));
        setQueuedMessages([]);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  if (queuedMessages.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-4 bg-warning text-warning-content p-3 rounded-lg shadow-lg z-50 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <WifiOff size={16} />
        <span className="font-semibold text-sm">Offline Mode</span>
      </div>
      <p className="text-xs">
        {queuedMessages.length} message(s) queued. Will send when online.
      </p>
    </div>
  );
};

export default OfflineQueue;
