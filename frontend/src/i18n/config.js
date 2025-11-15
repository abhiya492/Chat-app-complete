import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      login: "Login",
      signup: "Sign Up",
      logout: "Logout",
      profile: "Profile",
      settings: "Settings",
      chats: "Chats",
      calls: "Calls",
      search: "Search",
      typeMessage: "Type a message...",
      send: "Send",
      online: "Online",
      offline: "Offline",
      voiceCall: "Voice Call",
      videoCall: "Video Call",
      blockUser: "Block User",
      unblockUser: "Unblock User",
      userInfo: "User Info",
      bio: "Bio",
      status: "Status",
      theme: "Theme",
      privacy: "Privacy",
      blocked: "Blocked",
      offlineMessage: "You are offline. Some features may be unavailable.",
    }
  },
  es: {
    translation: {
      welcome: "Bienvenido",
      login: "Iniciar sesión",
      signup: "Registrarse",
      logout: "Cerrar sesión",
      profile: "Perfil",
      settings: "Configuración",
      chats: "Chats",
      calls: "Llamadas",
      search: "Buscar",
      typeMessage: "Escribe un mensaje...",
      send: "Enviar",
      online: "En línea",
      offline: "Desconectado",
      voiceCall: "Llamada de voz",
      videoCall: "Videollamada",
      blockUser: "Bloquear usuario",
      unblockUser: "Desbloquear usuario",
      userInfo: "Info del usuario",
      bio: "Biografía",
      status: "Estado",
      theme: "Tema",
      privacy: "Privacidad",
      blocked: "Bloqueados",
      offlineMessage: "Estás desconectado. Algunas funciones pueden no estar disponibles.",
    }
  },
  hi: {
    translation: {
      welcome: "स्वागत है",
      login: "लॉगिन",
      signup: "साइन अप",
      logout: "लॉगआउट",
      profile: "प्रोफाइल",
      settings: "सेटिंग्स",
      chats: "चैट्स",
      calls: "कॉल्स",
      search: "खोजें",
      typeMessage: "एक संदेश टाइप करें...",
      send: "भेजें",
      online: "ऑनलाइन",
      offline: "ऑफलाइन",
      voiceCall: "वॉयस कॉल",
      videoCall: "वीडियो कॉल",
      blockUser: "यूजर को ब्लॉक करें",
      unblockUser: "यूजर को अनब्लॉक करें",
      userInfo: "यूजर जानकारी",
      bio: "बायो",
      status: "स्टेटस",
      theme: "थीम",
      privacy: "गोपनीयता",
      blocked: "ब्लॉक किए गए",
      offlineMessage: "आप ऑफलाइन हैं। कुछ सुविधाएं अनुपलब्ध हो सकती हैं।",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
