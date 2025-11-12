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
