import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useRoomStore = create((set, get) => ({
  rooms: [],
  currentRoom: null,
  participants: [],
  speakers: [],
  handRaised: new Set(),
  isLoading: false,
  
  createRoom: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/rooms", data);
      toast.success("Room created!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create room");
    } finally {
      set({ isLoading: false });
    }
  },

  getActiveRooms: async (category = 'all') => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/rooms?category=${category}`);
      set({ rooms: res.data });
    } catch (error) {
      toast.error("Failed to load rooms");
    } finally {
      set({ isLoading: false });
    }
  },

  getRoom: async (roomId) => {
    try {
      const res = await axiosInstance.get(`/rooms/${roomId}`);
      set({ currentRoom: res.data });
      return res.data;
    } catch (error) {
      toast.error("Room not found");
    }
  },

  endRoom: async (roomId) => {
    try {
      await axiosInstance.delete(`/rooms/${roomId}`);
      toast.success("Room ended");
      set({ currentRoom: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to end room");
    }
  },

  joinRoom: (roomId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("room:join", { roomId });
    }
  },

  leaveRoom: (roomId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("room:leave", { roomId });
    }
    set({ currentRoom: null, participants: [], speakers: [] });
  },

  raiseHand: (roomId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("room:hand-raise", { roomId });
    }
  },

  lowerHand: (roomId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("room:hand-lower", { roomId });
    }
  },

  promoteToSpeaker: (roomId, targetUserId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("room:promote", { roomId, targetUserId });
    }
  },

  demoteToListener: (roomId, targetUserId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("room:demote", { roomId, targetUserId });
    }
  },

  subscribeToRoomEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("room:state", ({ participants, speakers }) => {
      set({ participants, speakers });
    });

    socket.on("room:participant-joined", ({ userId, participants }) => {
      set({ participants });
    });

    socket.on("room:participant-left", ({ userId }) => {
      set((state) => ({
        participants: state.participants.filter(p => p.userId !== userId),
        speakers: state.speakers.filter(s => s !== userId),
      }));
    });

    socket.on("room:hand-raised", ({ userId }) => {
      set((state) => ({
        handRaised: new Set([...state.handRaised, userId])
      }));
    });

    socket.on("room:hand-lowered", ({ userId }) => {
      set((state) => {
        const newHandRaised = new Set(state.handRaised);
        newHandRaised.delete(userId);
        return { handRaised: newHandRaised };
      });
    });

    socket.on("room:role-changed", ({ userId, role }) => {
      set((state) => ({
        participants: state.participants.map(p =>
          p.userId === userId ? { ...p, role } : p
        ),
        speakers: role === 'speaker' 
          ? [...state.speakers, userId]
          : state.speakers.filter(s => s !== userId)
      }));
    });

    socket.on("room:error", ({ message }) => {
      toast.error(message);
    });
  },

  unsubscribeFromRoomEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("room:state");
    socket.off("room:participant-joined");
    socket.off("room:participant-left");
    socket.off("room:hand-raised");
    socket.off("room:hand-lowered");
    socket.off("room:role-changed");
    socket.off("room:error");
  },
}));
