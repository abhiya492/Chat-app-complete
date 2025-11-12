import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { motion } from "framer-motion";

const StreakBadge = ({ userId }) => {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await axiosInstance.get(`/streaks/${userId}`);
        setStreak(res.data);
      } catch (error) {
        console.error("Failed to fetch streak:", error);
      }
    };

    if (userId) {
      fetchStreak();
    }
  }, [userId]);

  if (!streak || streak.count === 0) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full text-white text-xs font-bold gradient-animate neon-glow">
      <Flame size={14} className="fire-animation" />
      <span>{streak.count} day{streak.count > 1 ? 's' : ''}</span>
    </div>
  );
};

export default StreakBadge;
