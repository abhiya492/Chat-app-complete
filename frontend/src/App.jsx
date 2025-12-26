//import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Groups from './pages/Groups'
import ContactsPage from './pages/ContactsPage'
import Home from './pages/Home'
import Login from './pages/Login'
import Settings from './pages/Setting'
import Profile from './pages/Profile'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Rooms from './pages/Rooms'
import RoomView from './pages/RoomView'
import RandomChat from './pages/RandomChat'
import Challenge from './pages/Challenge'
import Wellness from './pages/Wellness'
import CorporateWellness from './pages/CorporateWellness'
import CommunityChallengePage from './pages/CommunityChallengePage'
import Store from './components/Store'
import UPIPayment from './components/UPIPayment'
import PrivacyTest from './components/PrivacyTest'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'
import { useEffect, useState } from 'react'

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
import ConnectionStatus from './components/ConnectionStatus'
import OfflineQueue from './components/OfflineQueue'
import PageTransition from './components/PageTransition'
import OnboardingTour from './components/OnboardingTour'
import EncryptionSetup from './components/EncryptionSetup'
import ScheduledMessages from './components/ScheduledMessages'
import ChallengeNotification from './components/ChallengeNotification'
import ContactNotification from './components/ContactNotification'
import ColdStartLoader from './components/ColdStartLoader'
import MoodTracker from './components/MoodTracker'
import BreakReminder from './components/BreakReminder'
import StressIndicator from './components/StressIndicator'
import MindfulnessModal from './components/MindfulnessModal'
import HealthBasedWellness from './components/HealthBasedWellness'
import SleepQualityIndicator from './components/SleepQualityIndicator'
import CircadianWellnessIndicator from './components/CircadianWellnessIndicator'
import CircadianThemeAdapter from './components/CircadianThemeAdapter'
import CircadianNotifications from './components/CircadianNotifications'
import CircadianBreakReminder from './components/CircadianBreakReminder'
import MoodMusicSuggestion from './components/MoodMusicSuggestion'
import MusicMoodAnalyzer from './components/MusicMoodAnalyzer'
import WellnessWidget from './components/WellnessWidget'
import AITherapistChat from './components/AITherapistChat'
import { useWellnessSocket } from './hooks/useWellnessSocket'
import { useWellnessWidget } from './hooks/useWellnessWidget'
import { useAccessibilityIntegration } from './hooks/useAccessibilityIntegration'

const App = () => {
  const { authUser,checkAuth,isCheckingAuth,onlineUsers,socket } = useAuthStore();
  const { theme } = useThemeStore();
  const { setupCallListeners, cleanupCallListeners } = useCallStore();
  const { subscribeToStoryEvents, unsubscribeFromStoryEvents } = useStoryStore();
  const [backendReady, setBackendReady] = useState(false);
  
  // Initialize wellness socket listeners
  useWellnessSocket();
  
  // Initialize wellness widget
  useWellnessWidget();
  
  // Initialize accessibility features
  useAccessibilityIntegration();

  console.log({ onlineUsers})

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth') === 'success') {
      window.history.replaceState({}, '', '/');
      checkAuth();
    }
  }, [checkAuth]);

  // Handle browser back/forward cache (bfcache)
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
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

  if (!backendReady) {
    return <ColdStartLoader onReady={() => setBackendReady(true)} />;
  }

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />    
      <PageTransition>
        <Routes>
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
        <Route path="/groups" element={authUser ? <Groups /> : <Navigate to="/login" />} />
        <Route path="/contacts" element={authUser ? <ContactsPage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!authUser ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/rooms" element={authUser ? <Rooms /> : <Navigate to="/login" />} />
        <Route path="/room/:id" element={authUser ? <RoomView /> : <Navigate to="/login" />} />
        <Route path="/random-chat" element={authUser ? <RandomChat /> : <Navigate to="/login" />} />
        <Route path="/challenge" element={authUser ? <Challenge /> : <Navigate to="/login" />} />
        <Route path="/wellness" element={authUser ? <Wellness /> : <Navigate to="/login" />} />
        <Route path="/store" element={<Store />} />
        <Route path="/upi-payment" element={authUser ? <UPIPayment /> : <Navigate to="/login" />} />
        <Route path="/privacy-test" element={authUser ? <PrivacyTest /> : <Navigate to="/login" />} />
        <Route path="/corporate-wellness" element={authUser ? <CorporateWellness /> : <Navigate to="/login" />} />
        <Route path="/community-challenges" element={authUser ? <CommunityChallengePage /> : <Navigate to="/login" />} />
        </Routes>
      </PageTransition>

      <Toaster />
      <ConnectionStatus />
      <OfflineQueue />
      <OfflineBanner />
      {authUser && <EncryptionSetup />}
      {authUser && <OnboardingTour />}
      {authUser && <NotificationPrompt />}
      {authUser && <ChatbotButton />}
      {authUser && <ScheduledMessages />}
      {authUser && <ChallengeNotification />}
      {authUser && <ContactNotification />}
      {authUser && <MoodTracker />}
      {authUser && <BreakReminder />}
      {authUser && <StressIndicator />}
      {authUser && <MindfulnessModal />}
      {authUser && <HealthBasedWellness />}
      {authUser && <SleepQualityIndicator />}
      {authUser && <CircadianWellnessIndicator />}
      {authUser && <CircadianThemeAdapter />}
      {authUser && <CircadianNotifications />}
      {authUser && <CircadianBreakReminder />}
      {authUser && <MoodMusicSuggestion />}
      {authUser && <MusicMoodAnalyzer />}
      {authUser && <WellnessWidget />}
      {authUser && <AITherapistChat />}
      <CallModal />
      <IncomingCallModal />
    </div>
  )
}

export default App
