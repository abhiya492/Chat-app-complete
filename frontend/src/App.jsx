//import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Settings from './pages/Setting'
import Profile from './pages/Profile'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'
import { useEffect } from 'react'

import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import CallModal from './components/CallModal'
import IncomingCallModal from './components/IncomingCallModal'
import OfflineBanner from './components/OfflineBanner'
import NotificationPrompt from './components/NotificationPrompt'
import ChatbotButton from './components/ChatbotButton'
import { useCallStore } from './store/useCallStore'
import { trackPageView } from './lib/analytics'

const App = () => {
  const { authUser,checkAuth,isCheckingAuth,onlineUsers,socket } = useAuthStore();
  const { theme } = useThemeStore();
  const { setupCallListeners, cleanupCallListeners } = useCallStore();

  console.log({ onlineUsers})

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  useEffect(() => {
    if (socket && authUser) {
      setupCallListeners(socket);
      return () => cleanupCallListeners(socket);
    }
  }, [socket, authUser, setupCallListeners, cleanupCallListeners]);


  console.log(authUser);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />    
      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!authUser ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/login" />} />
      </Routes> 

      <Toaster />
      <OfflineBanner />
      {authUser && <NotificationPrompt />}
      {authUser && <ChatbotButton />}
      <CallModal />
      <IncomingCallModal />
    </div>
  )
}

export default App
