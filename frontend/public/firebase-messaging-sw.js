importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBvOoB02RdpYDWNVaUFhZSI4PiTHuGiAUw",
  authDomain: "chat-app-notifications.firebaseapp.com",
  projectId: "chat-app-notifications",
  storageBucket: "chat-app-notifications.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/chatty-icon.svg',
    badge: '/chatty-icon.svg',
    tag: 'chat-message',
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: 'reply',
        title: 'Reply',
        icon: '/reply-icon.png'
      },
      {
        action: 'view',
        title: 'View',
        icon: '/view-icon.png'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});