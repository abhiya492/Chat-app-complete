import { useEffect, useState } from "react";
import { useStoryStore } from "../store/useStoryStore";
import { useAuthStore } from "../store/useAuthStore";
import { Plus, Loader } from "lucide-react";
import StoryCreator from "./StoryCreator";
import StoryViewer from "./StoryViewer";
import { motion } from "framer-motion";
import Confetti from "./Confetti";

// Hide scrollbar
const style = document.createElement('style');
style.textContent = '.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }';
document.head.appendChild(style);

const StoryBar = () => {
  const { stories, myStories, fetchStories, fetchMyStories, setSelectedStory, isLoading } = useStoryStore();
  const { authUser } = useAuthStore();
  const [showCreator, setShowCreator] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchStories();
    fetchMyStories();
  }, [fetchStories, fetchMyStories]);

  const handleStoryClick = (userStories, index = 0) => {
    setSelectedStory(userStories, index);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader className="animate-spin" size={20} />
      </div>
    );
  }

  const handleStoryCreated = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  return (
    <>
      <Confetti trigger={showConfetti} />
      <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide border-b border-base-300">
        {/* User's own story */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer"
          onClick={() => setShowCreator(true)}
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px]">
              <img
                src={authUser.profilePic || "/avatar.png"}
                alt="Your story"
                className="w-full h-full rounded-full object-cover border-2 border-base-100"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-0.5">
              <Plus size={12} className="text-white" />
            </div>
          </div>
          <span className="text-[10px] font-medium truncate w-full text-center">You</span>
        </motion.div>

        {/* Other users' stories */}
        {stories.map((userStories) => (
          <motion.div
            key={userStories.user._id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer"
            onClick={() => handleStoryClick(userStories)}
          >
            <div className={`w-14 h-14 rounded-full p-[2px] ${
              userStories.hasUnviewed
                ? "bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500"
                : "bg-gray-400"
            }`}>
              <img
                src={userStories.user.profilePic || "/avatar.png"}
                alt={userStories.user.fullName}
                className="w-full h-full rounded-full object-cover border-2 border-base-100"
              />
            </div>
            <span className="text-[10px] font-medium truncate w-full text-center">
              {userStories.user.fullName.split(" ")[0]}
            </span>
          </motion.div>
        ))}
      </div>

      {showCreator && <StoryCreator onClose={() => setShowCreator(false)} />}
      <StoryViewer />
    </>
  );
};

export default StoryBar;
