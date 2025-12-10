import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/useAuthStore";
import useSharedStore from "../../store/useSharedStore";
import { useChatStore } from "../../store/useChatStore";
import SimpleGames from "./SimpleGames";
import SimpleCursor from "./SimpleCursor";
import RockPaperScissors from "./RockPaperScissors";
import Chess from "./Chess";


const SharedExperiencePanel = () => {
  const [activeTab, setActiveTab] = useState("games");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const { socket } = useAuthStore();
  const { selectedUser } = useChatStore();
  const { 
    activeExperiences, 
    currentExperience,
    fetchActiveExperiences,
    setCurrentExperience 
  } = useSharedStore();

  useEffect(() => {
    if (selectedUser?._id) {
      fetchActiveExperiences(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!socket) return;

    // Listen for shared experience events
    socket.on("shared:started", (data) => {
      if (data.chatId === selectedUser?._id) {
        fetchActiveExperiences(selectedUser._id);
      }
    });

    socket.on("shared:ended", (data) => {
      if (data.chatId === selectedUser?._id) {
        fetchActiveExperiences(selectedUser._id);
        if (currentExperience?._id === data.experienceId) {
          setCurrentExperience(null);
        }
      }
    });

    return () => {
      socket.off("shared:started");
      socket.off("shared:ended");
    };
  }, [socket, selectedUser, currentExperience, fetchActiveExperiences, setCurrentExperience]);

  const tabs = [
    { id: "games", label: "🎯 Tic-Tac", component: SimpleGames },
    { id: "rps", label: "🪨 RPS", component: RockPaperScissors },
    { id: "chess", label: "♔ Chess", component: Chess },
    { id: "cursor", label: "👆 Cursor", component: SimpleCursor }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExpanded && !event.target.closest('.fixed')) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  if (!selectedUser) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.div 
        className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6"
        style={{ zIndex: 9999 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.button
          className="btn btn-circle btn-md sm:btn-lg bg-gradient-to-r from-purple-500 to-pink-500 border-0 shadow-lg hover:shadow-xl"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <span className="text-xl sm:text-2xl">🎮</span>
            )}
          </motion.div>
        </motion.button>
        
        {/* Activity indicator */}
        {activeExperiences.length > 0 && (
          <motion.div 
            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-success rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {activeExperiences.length}
          </motion.div>
        )}
      </motion.div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="fixed inset-x-2 bottom-40 sm:bottom-24 sm:right-6 sm:left-auto bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden"
            style={{ zIndex: 9998, maxWidth: '380px', maxHeight: '500px' }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 sm:p-4 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  🎮 <span className="hidden sm:inline">Shared Experiences</span><span className="sm:hidden">Games</span>
                </h2>
                <motion.button
                  className="btn btn-circle btn-xs sm:btn-sm bg-white/20 border-0 hover:bg-white/30"
                  onClick={() => setIsExpanded(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              {activeExperiences.length > 0 && (
                <div className="mt-2 text-xs sm:text-sm text-white/80">
                  {activeExperiences.length} active session{activeExperiences.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex bg-base-200 overflow-x-auto">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary bg-base-100'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-300'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Content */}
            <motion.div 
              className="p-3 sm:p-4 overflow-y-auto" 
              style={{ maxHeight: '300px' }}
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {ActiveComponent && <ActiveComponent />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SharedExperiencePanel;