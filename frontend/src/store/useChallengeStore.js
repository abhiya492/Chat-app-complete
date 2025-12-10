import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChallengeStore = create((set, get) => ({
  onlinePlayers: [],
  playerStats: null,
  activeChallenge: null,
  pendingChallenges: [],
  gameState: null,
  isLoading: false,

  getOnlinePlayers: async (onlineUserIds) => {
    try {
      const res = await axiosInstance.post("/challenges/online-players", { onlineUserIds });
      set({ onlinePlayers: res.data });
    } catch (error) {
      toast.error("Failed to load online players");
    }
  },

  getPlayerStats: async (userId) => {
    try {
      const res = await axiosInstance.get(`/challenges/stats/${userId || ""}`);
      set({ playerStats: res.data });
    } catch (error) {
      console.error("Failed to load player stats:", error);
    }
  },

  createChallenge: async (opponentId, gameMode) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/challenges/create", { opponentId, gameMode });
      toast.success("Challenge sent!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send challenge");
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  respondToChallenge: async (challengeId, accept) => {
    try {
      const res = await axiosInstance.post(`/challenges/respond/${challengeId}`, { accept });
      
      if (accept) {
        set({ activeChallenge: res.data });
        toast.success("Challenge accepted!");
      } else {
        toast.success("Challenge declined");
      }
      
      set({ pendingChallenges: get().pendingChallenges.filter(c => c._id !== challengeId) });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to respond to challenge");
      return null;
    }
  },

  updateGameResult: async (challengeId, winnerId) => {
    try {
      await axiosInstance.post("/challenges/result", { challengeId, winnerId });
      set({ activeChallenge: null, gameState: null });
    } catch (error) {
      console.error("Failed to update game result:", error);
    }
  },

  setActiveChallenge: (challenge) => set({ activeChallenge: challenge }),
  setGameState: (state) => set({ gameState: state }),
  
  addPendingChallenge: (challenge) => {
    set({ pendingChallenges: [...get().pendingChallenges, challenge] });
  },

  removePendingChallenge: (challengeId) => {
    set({ pendingChallenges: get().pendingChallenges.filter(c => c._id !== challengeId) });
  },

  subscribeToChallenge: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("challenge:received", (challenge) => {
      console.log("Challenge received:", challenge);
      get().addPendingChallenge(challenge);
      toast.success(
        `🎮 ${challenge.challengerId.fullName} challenged you to ${challenge.gameMode}!`,
        { duration: 5000 }
      );
    });

    socket.on("challenge:accepted", (challenge) => {
      console.log("Challenge accepted:", challenge);
      set({ activeChallenge: challenge });
      toast.success("Challenge accepted! Starting game...");
    });

    socket.on("challenge:declined", () => {
      console.log("Challenge declined");
      toast.error("Challenge was declined");
    });
  },

  unsubscribeFromChallenge: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("challenge:received");
    socket.off("challenge:accepted");
    socket.off("challenge:declined");
  },
}));
