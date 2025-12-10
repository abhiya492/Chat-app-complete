import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useGameProgressStore = create((set, get) => ({
  progress: null,
  leaderboard: [],
  isLoading: false,
  showLevelUp: false,
  showAchievement: null,

  getProgress: async () => {
    try {
      const res = await axiosInstance.get("/game-progress");
      set({ progress: res.data });
      
      // Show daily streak notification
      if (res.data.dailyStreak > 1) {
        toast.success(`🔥 ${res.data.dailyStreak} day streak! Keep it up!`);
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
    }
  },

  updateGameResult: async (gameMode, won, opponentId) => {
    try {
      const res = await axiosInstance.post("/game-progress/game-result", {
        gameMode,
        won,
        opponentId
      });
      
      set({ progress: res.data.progress });
      
      // Show XP gain
      toast.success(`+${res.data.xpGain} XP!`);
      
      // Show level up
      if (res.data.leveledUp) {
        set({ showLevelUp: true });
        setTimeout(() => set({ showLevelUp: false }), 3000);
      }
      
      // Show achievements
      if (res.data.newAchievements?.length > 0) {
        res.data.newAchievements.forEach((achievement, idx) => {
          setTimeout(() => {
            set({ showAchievement: achievement });
            setTimeout(() => set({ showAchievement: null }), 3000);
          }, idx * 3500);
        });
      }
      
      return res.data;
    } catch (error) {
      console.error("Failed to update game result:", error);
    }
  },

  getLeaderboard: async (type = "level") => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/game-progress/leaderboard?type=${type}`);
      set({ leaderboard: res.data });
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  purchaseCosmetic: async (type, item, cost) => {
    try {
      const res = await axiosInstance.post("/game-progress/cosmetic/purchase", {
        type,
        item,
        cost
      });
      set({ progress: res.data });
      toast.success(`Purchased ${item}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Purchase failed");
    }
  },

  equipCosmetic: async (type, item) => {
    try {
      const res = await axiosInstance.post("/game-progress/cosmetic/equip", {
        type,
        item
      });
      set({ progress: res.data });
      toast.success(`Equipped ${item}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Equip failed");
    }
  },
}));
