import { useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationSetup = () => {
  const { permission, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (permission === 'granted' || dismissed) return null;

  return (
    <div className="fixed top-20 right-4 bg-primary text-primary-content p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Enable Notifications</h3>
          <p className="text-xs opacity-90 mt-1">
            Get notified when you receive new messages
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={requestPermission}
              className="btn btn-sm btn-secondary"
            >
              Enable
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="btn btn-sm btn-ghost"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="btn btn-ghost btn-xs btn-circle"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationSetup;