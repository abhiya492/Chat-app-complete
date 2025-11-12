import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { requestNotificationPermission, isNotificationSupported } from "../lib/notifications";

const NotificationPrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isNotificationSupported() && Notification.permission === 'default') {
      setTimeout(() => setShow(true), 3000);
    }
  }, []);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-base-100 rounded-lg shadow-xl border border-base-300 p-4 max-w-sm animate-in slide-in-from-bottom">
      <button
        onClick={() => setShow(false)}
        className="absolute top-2 right-2 btn btn-ghost btn-xs btn-circle"
      >
        <X size={14} />
      </button>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">Enable Notifications</h4>
          <p className="text-sm text-base-content/70 mb-3">
            Get notified when you receive new messages
          </p>
          <button onClick={handleEnable} className="btn btn-primary btn-sm">
            Enable
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
