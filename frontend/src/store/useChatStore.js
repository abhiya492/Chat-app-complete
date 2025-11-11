import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set,get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  replyingTo: null,
  editingMessage: null,
  typingUsers: new Set(),
  searchQuery: "",
  searchResults: [],
  pinnedMessages: [],
  showPinned: false,
  forwardingMessage: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo } = get();
    try {
      const payload = { ...messageData };
      if (replyingTo) payload.replyTo = replyingTo._id;
      
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      set({ messages: [...messages, res.data], replyingTo: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  addReaction: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.post(`/messages/react/${messageId}`, { emoji });
      set({
        messages: get().messages.map(m => m._id === messageId ? res.data : m)
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add reaction");
    }
  },

  removeReaction: async (messageId) => {
    try {
      const res = await axiosInstance.delete(`/messages/react/${messageId}`);
      set({
        messages: get().messages.map(m => m._id === messageId ? res.data : m)
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove reaction");
    }
  },

  editMessage: async (messageId, text) => {
    try {
      const res = await axiosInstance.put(`/messages/edit/${messageId}`, { text });
      set({
        messages: get().messages.map(m => m._id === messageId ? res.data : m),
        editingMessage: null
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const res = await axiosInstance.delete(`/messages/${messageId}`);
      set({
        messages: get().messages.map(m => m._id === messageId ? res.data : m)
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  markAsRead: async (messageId) => {
    try {
      await axiosInstance.post(`/messages/read/${messageId}`);
      set({
        messages: get().messages.map(m => 
          m._id === messageId 
            ? { ...m, readBy: [...(m.readBy || []), { userId: useAuthStore.getState().authUser._id, readAt: new Date() }] }
            : m
        )
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  },

  pinMessage: async (messageId) => {
    try {
      const res = await axiosInstance.post(`/messages/pin/${messageId}`);
      set({
        messages: get().messages.map(m => m._id === messageId ? res.data : m)
      });
      toast.success(res.data.isPinned ? "Message pinned" : "Message unpinned");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to pin message");
    }
  },

  forwardMessage: async (messageId, receiverIds) => {
    try {
      await axiosInstance.post(`/messages/forward/${messageId}`, { receiverIds });
      toast.success("Message forwarded");
      set({ forwardingMessage: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to forward message");
    }
  },

  searchMessages: async (query) => {
    try {
      const res = await axiosInstance.get(`/messages/search?query=${query}`);
      set({ searchResults: res.data, searchQuery: query });
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
    }
  },

  getPinnedMessages: async (userId) => {
    try {
      const res = await axiosInstance.get(`/messages/pinned/${userId}`);
      set({ pinnedMessages: res.data });
    } catch (error) {
      console.error("Failed to get pinned messages:", error);
    }
  },

  setForwardingMessage: (message) => set({ forwardingMessage: message }),
  setShowPinned: (show) => set({ showPinned: show }),
  clearSearch: () => set({ searchQuery: "", searchResults: [] }),

  setReplyingTo: (message) => set({ replyingTo: message }),
  setEditingMessage: (message) => set({ editingMessage: message }),
  
  emitTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });
    }
  },

  emitStopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (socket && selectedUser) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
      set({ messages: [...get().messages, newMessage] });
    });

    socket.on("messageReaction", (updatedMessage) => {
      set({
        messages: get().messages.map(m => m._id === updatedMessage._id ? updatedMessage : m)
      });
    });

    socket.on("messageEdited", (updatedMessage) => {
      set({
        messages: get().messages.map(m => m._id === updatedMessage._id ? updatedMessage : m)
      });
    });

    socket.on("messageDeleted", (updatedMessage) => {
      set({
        messages: get().messages.map(m => m._id === updatedMessage._id ? updatedMessage : m)
      });
    });

    socket.on("userTyping", ({ userId }) => {
      if (userId === selectedUser._id) {
        set({ typingUsers: new Set([...get().typingUsers, userId]) });
      }
    });

    socket.on("userStoppedTyping", ({ userId }) => {
      const typingUsers = new Set(get().typingUsers);
      typingUsers.delete(userId);
      set({ typingUsers });
    });

    socket.on("messageRead", ({ messageId, userId }) => {
      set({
        messages: get().messages.map(m => 
          m._id === messageId 
            ? { ...m, readBy: [...(m.readBy || []), { userId, readAt: new Date() }] }
            : m
        )
      });
    });

    socket.on("messagePinned", (updatedMessage) => {
      set({
        messages: get().messages.map(m => m._id === updatedMessage._id ? updatedMessage : m)
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageReaction");
    socket.off("messageEdited");
    socket.off("messageDeleted");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
    socket.off("messageRead");
    socket.off("messagePinned");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));