import { useState, useEffect } from 'react';
import { messaging, getToken, onMessage } from '../lib/firebase';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [token, setToken] = useState(null);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: 'BKagOny0KF_8pLdVs6gSh1EiSAgLbpJYBP8YjQIFv0-TGqJwbI8p6TSreVs-4-_aCnsoTrNdQkMv3b5a9e8Nkz4'
        });
        
        if (token) {
          setToken(token);
          // Send token to backend
          await axiosInstance.post('/notifications/token', { token });
          toast.success('Notifications enabled!');
        }
      }
    } catch (error) {
      console.error('Error getting notification permission:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const showNotification = (title, options = {}) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/chatty-icon.svg',
        badge: '/chatty-icon.svg',
        ...options
      });
    }
  };

  useEffect(() => {
    if (permission === 'granted') {
      // Listen for foreground messages
      const unsubscribe = onMessage(messaging, (payload) => {
        showNotification(
          payload.notification.title,
          {
            body: payload.notification.body,
            tag: 'chat-message'
          }
        );
      });

      return unsubscribe;
    }
  }, [permission]);

  return {
    permission,
    token,
    requestPermission,
    showNotification
  };
};