import { useState, useEffect } from "react";
import { useContactStore } from "../store/useContactStore";
import { Check, X, Users } from "lucide-react";

const ContactNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const { acceptContactRequest, rejectContactRequest } = useContactStore();

  useEffect(() => {
    // Listen for contact request notifications
    const handleContactRequest = (requestData) => {
      const notification = {
        id: requestData._id,
        type: "contact_request",
        title: "New Contact Request",
        message: `${requestData.requester.fullName} wants to add you as a contact`,
        avatar: requestData.requester.profilePic,
        requestData,
        timestamp: Date.now(),
      };

      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 notifications

      // Auto-remove after 10 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 10000);
    };

    // Add event listener (this would be connected to socket events)
    window.addEventListener('contactRequest', handleContactRequest);

    return () => {
      window.removeEventListener('contactRequest', handleContactRequest);
    };
  }, []);

  const handleAccept = async (notification) => {
    try {
      await acceptContactRequest(notification.requestData._id);
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    } catch (error) {
      // Error handled in store
    }
  };

  const handleReject = async (notification) => {
    try {
      await rejectContactRequest(notification.requestData._id);
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    } catch (error) {
      // Error handled in store
    }
  };

  const handleDismiss = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="alert alert-info shadow-lg max-w-sm animate-slide-in-right"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <img
                  src={notification.avatar || "/avatar.png"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-xs opacity-80 truncate">{notification.message}</p>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => handleAccept(notification)}
                className="btn btn-xs btn-success"
                title="Accept"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleReject(notification)}
                className="btn btn-xs btn-error"
                title="Reject"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactNotification;