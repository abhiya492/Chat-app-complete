import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBvOoB02RdpYDWNVaUFhZSI4PiTHuGiAUw",
  authDomain: "chat-app-notifications.firebaseapp.com",
  projectId: "chat-app-notifications",
  storageBucket: "chat-app-notifications.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };