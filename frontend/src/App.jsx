//import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Settings from './pages/Setting'
import Profile from './pages/Profile'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Rooms from './pages/Rooms'
import RoomView from './pages/RoomView'
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
import { useStoryStore } from './store/useStoryStore'

const App = () => {
  const { authUser,checkAuth,isCheckingAuth,onlineUsers,socket } = useAuthStore();
  const { theme } = useThemeStore();
  const { setupCallListeners, cleanupCallListeners } = useCallStore();
  const { subscribeToStoryEvents, unsubscribeFromStoryEvents } = useStoryStore();

  console.log({ onlineUsers})

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle browser back/forward cache (bfcache)
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        // Page was restored from bfcache, re-check auth
        checkAuth();
      }
    };
    
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [checkAuth]);

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  useEffect(() => {
    if (socket && authUser) {
      setupCallListeners(socket);
      subscribeToStoryEvents();
      return () => {
        cleanupCallListeners(socket);
        unsubscribeFromStoryEvents();
      };
    }
  }, [socket, authUser, setupCallListeners, cleanupCallListeners, subscribeToStoryEvents, unsubscribeFromStoryEvents]);


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
        <Route path="/rooms" element={authUser ? <Rooms /> : <Navigate to="/login" />} />
        <Route path="/room/:id" element={authUser ? <RoomView /> : <Navigate to="/login" />} />
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
