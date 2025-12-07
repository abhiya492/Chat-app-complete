import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { showNotification } from "../lib/notifications";
import { handleApiError } from "../lib/errorHandler";
import { encryptMessage, decryptMessage, getStoredKeys } from "../lib/encryption";
import { isImportantMessage } from "../lib/smartNotifications";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  hasMoreMessages: true,
  currentPage: 1,
  replyingTo: null,
  editingMessage: null,
  typingUsers: new Set(),
  searchQuery: "",
  searchResults: [],
  pinnedMessages: [],
  showPinned: false,
  forwardingMessage: null,
  scheduledMessages: [],
  showScheduled: false,

  // Helper function to decrypt a single message
  _decryptSingleMessage: async (message) => {
    // Skip if not encrypted or no text
    if (!message?.isEncrypted || !message.text) {
      return message;
    }

    const keys = getStoredKeys();
    
    // Check for private key
    if (!keys?.privateKey) {
      console.warn("No private key available for decryption");
      return message; // Return encrypted message as-is
    }

    try {
      const decryptedText = await decryptMessage(message.text, keys.privateKey);
      
      // Check if decryption actually succeeded
      if (decryptedText && decryptedText !== '[Decryption failed]') {
        return { 
          ...message, 
          text: decryptedText, 
          _decrypted: true // Mark as successfully decrypted
        };
      }
      
      console.error("Decryption failed for message:", message._id);
      return message; // Return encrypted message if decryption failed
    } catch (error) {
      console.error("Decryption error:", error);
      return message; // Return encrypted message on error
    }
  },

  // Helper function to decrypt messages in bulk
  _decryptMessages: async (messages) => {
    if (!messages?.length) return messages;

    const keys = getStoredKeys();
    if (!keys?.privateKey) {
      console.warn("No private key available for bulk decryption");
      return messages;
    }

    // Decrypt all messages in parallel
    const decryptPromises = messages.map(async (msg) => {
      if (msg.isEncrypted && msg.text) {
        try {
          const decryptedText = await decryptMessage(msg.text, keys.privateKey);
          if (decryptedText && decryptedText !== '[Decryption failed]') {
            return { ...msg, text: decryptedText, _decrypted: true };
          }
        } catch (error) {
          console.error("Failed to decrypt message:", msg._id, error);
        }
      }
      return msg;
    });

    return await Promise.all(decryptPromises);
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      handleApiError(error, 'Failed to load users');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId, page = 1) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}?page=${page}&limit=50`);
      const { messages: newMessages, hasMore } = res.data;
      
      // Decrypt all messages
      const decryptedMessages = await get()._decryptMessages(newMessages);
      
      if (page === 1) {
        set({ messages: decryptedMessages, hasMoreMessages: hasMore, currentPage: 1 });
      } else {
        set({ 
          messages: [...decryptedMessages, ...get().messages],
          hasMoreMessages: hasMore,
          currentPage: page
        });
      }
    } catch (error) {
      handleApiError(error, 'Failed to load messages');
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  loadMoreMessages: async () => {
    const { selectedUser, currentPage, hasMoreMessages, isMessagesLoading } = get();
    if (!hasMoreMessages || isMessagesLoading || !selectedUser) return;
    
    await get().getMessages(selectedUser._id, currentPage + 1);
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo } = get();
    const { authUser } = useAuthStore.getState();
    
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    
    const originalText = messageData.text;
    let encryptedText = messageData.text;
    let isEncrypted = false;
    
    // Encrypt with recipient's public key
    if (messageData.text && selectedUser.publicKey) {
      const encrypted = await encryptMessage(messageData.text, selectedUser.publicKey);
      if (encrypted) {
        encryptedText = encrypted;
        isEncrypted = true;
        console.log('📤 Sending encrypted message to server');
      }
    }
    
    // Optimistic update for non-scheduled messages
    const optimisticMessage = !messageData.scheduledFor ? {
      _id: `temp-${Date.now()}`,
      senderId: authUser._id,
      text: originalText, // Show unencrypted text immediately
      image: messageData.image,
      video: messageData.video,
      file: messageData.file,
      voice: messageData.voice,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      _decrypted: true, // Mark as decrypted so it displays correctly
    } : null;
    
    if (optimisticMessage) {
      set({ messages: [...messages, optimisticMessage], isSendingMessage: true });
    } else {
      set({ isSendingMessage: true });
    }
    
    try {
      const payload = { ...messageData, text: encryptedText, isEncrypted };
      if (replyingTo) payload.replyTo = replyingTo._id;
      
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      
      console.log('📥 Server response:', { 
        isEncrypted: res.data.isEncrypted, 
        hasOriginalText: !!originalText,
        textPreview: res.data.text?.substring(0, 50)
      });
      
      // For sent messages, keep the original plaintext (we encrypted it, so we know the plaintext)
      const serverMessage = { ...res.data };
      if (serverMessage.isEncrypted && originalText) {
        serverMessage.text = originalText;
        serverMessage._decrypted = true;
        console.log('📝 Using original plaintext for sent message:', originalText);
      } else {
        console.log('⚠️ Not replacing text:', { isEncrypted: serverMessage.isEncrypted, hasOriginal: !!originalText });
      }
      const decryptedMessage = serverMessage;
      
      // Replace optimistic message with real one
      if (optimisticMessage) {
        set({ 
          messages: messages
            .filter(m => m._id !== optimisticMessage._id)
            .concat(decryptedMessage),
          replyingTo: null 
        });
      } else {
        set({ replyingTo: null });
      }
      
      if (window.analytics) {
        window.analytics.track('message_sent', { 
          hasImage: !!messageData.image,
          hasFile: !!messageData.file,
          isReply: !!replyingTo,
          isEncrypted
        });
      }
    } catch (error) {
      if (optimisticMessage) {
        set({ messages: messages.filter(m => m._id !== optimisticMessage._id) });
      }
      
      if (!navigator.onLine) {
        const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        queue.push({ messageData, selectedUserId: selectedUser._id, timestamp: Date.now() });
        localStorage.setItem('offlineQueue', JSON.stringify(queue));
        toast.error('Message queued. Will send when online.');
      } else {
        handleApiError(error, 'Failed to send message');
      }
    } finally {
      set({ isSendingMessage: false });
    }
  },

  addReaction: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.post(`/messages/react/${messageId}`, { emoji });
      const decryptedMessage = await get()._decryptSingleMessage(res.data);
      set({
        messages: get().messages.map(m => m._id === messageId ? decryptedMessage : m)
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add reaction");
    }
  },

  removeReaction: async (messageId) => {
    try {
      const res = await axiosInstance.delete(`/messages/react/${messageId}`);
      const decryptedMessage = await get()._decryptSingleMessage(res.data);
      set({
        messages: get().messages.map(m => m._id === messageId ? decryptedMessage : m)
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove reaction");
    }
  },

  editMessage: async (messageId, text) => {
    const { selectedUser } = get();
    
    let encryptedText = text;
    let isEncrypted = false;
    
    if (text && selectedUser?.publicKey) {
      const encrypted = await encryptMessage(text, selectedUser.publicKey);
      if (encrypted) {
        encryptedText = encrypted;
        isEncrypted = true;
      }
    }
    
    const originalText = text;
    
    try {
      const res = await axiosInstance.put(`/messages/edit/${messageId}`, { 
        text: encryptedText,
        isEncrypted 
      });
      // Use original plaintext for edited message
      const updatedMessage = { ...res.data };
      if (updatedMessage.isEncrypted && originalText) {
        updatedMessage.text = originalText;
        updatedMessage._decrypted = true;
      }
      set({
        messages: get().messages.map(m => m._id === messageId ? updatedMessage : m),
        editingMessage: null
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const res = await axiosInstance.delete(`/messages/${messageId}`);
      const decryptedMessage = await get()._decryptSingleMessage(res.data);
      set({
        messages: get().messages.map(m => m._id === messageId ? decryptedMessage : m)
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  markAsRead: async (messageId) => {
    try {
      await axiosInstance.post(`/messages/read/${messageId}`);
      const { authUser } = useAuthStore.getState();
      set({
        messages: get().messages.map(m => 
          m._id === messageId 
            ? { ...m, readBy: [...(m.readBy || []), { userId: authUser._id, readAt: new Date() }] }
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
      const decryptedMessage = await get()._decryptSingleMessage(res.data);
      set({
        messages: get().messages.map(m => m._id === messageId ? decryptedMessage : m)
      });
      toast.success(decryptedMessage.isPinned ? "Message pinned" : "Message unpinned");
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
      const res = await axiosInstance.get(`/messages/search?query=${encodeURIComponent(query)}`);
      const decryptedResults = await get()._decryptMessages(res.data);
      set({ searchResults: decryptedResults, searchQuery: query });
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
    }
  },

  getPinnedMessages: async (userId) => {
    try {
      const res = await axiosInstance.get(`/messages/pinned/${userId}`);
      const decryptedPinned = await get()._decryptMessages(res.data);
      set({ pinnedMessages: decryptedPinned });
    } catch (error) {
      console.error("Failed to get pinned messages:", error);
    }
  },

  deleteChat: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/chat/${userId}`);
      set({ messages: [], selectedUser: null });
      await get().getUsers();
      toast.success('Chat deleted successfully');
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to delete chat');
      return false;
    }
  },

  getScheduledMessages: async () => {
    try {
      const res = await axiosInstance.get('/messages/scheduled');
      const decryptedScheduled = await get()._decryptMessages(res.data);
      set({ scheduledMessages: decryptedScheduled });
    } catch (error) {
      handleApiError(error, 'Failed to load scheduled messages');
    }
  },

  cancelScheduledMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/scheduled/${messageId}`);
      set({ scheduledMessages: get().scheduledMessages.filter(m => m._id !== messageId) });
      toast.success('Scheduled message cancelled');
    } catch (error) {
      handleApiError(error, 'Failed to cancel scheduled message');
    }
  },

  setForwardingMessage: (message) => set({ forwardingMessage: message }),
  setShowPinned: (show) => set({ showPinned: show }),
  setShowScheduled: (show) => set({ showScheduled: show }),
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
    if (!socket) return;

    socket.on("newMessage", async (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
      
      // Decrypt incoming message
      const decryptedMessage = await get()._decryptSingleMessage(newMessage);
      
      set({ messages: [...get().messages, decryptedMessage] });
      
      // Smart notifications - only notify for important messages
      if (document.hidden) {
        const prefs = JSON.parse(localStorage.getItem('notificationPrefs') || '{}');
        if (isImportantMessage(decryptedMessage, prefs)) {
          showNotification(`New message from ${selectedUser.fullName}`, {
            body: decryptedMessage.text || 'Sent an attachment',
            tag: 'new-message'
          });
        }
      }
    });

    socket.on("messageReaction", async (updatedMessage) => {
      const decryptedMessage = await get()._decryptSingleMessage(updatedMessage);
      set({
        messages: get().messages.map(m => m._id === decryptedMessage._id ? decryptedMessage : m)
      });
    });

    socket.on("messageEdited", async (updatedMessage) => {
      const decryptedMessage = await get()._decryptSingleMessage(updatedMessage);
      set({
        messages: get().messages.map(m => m._id === decryptedMessage._id ? decryptedMessage : m)
      });
    });

    socket.on("messageDeleted", async (updatedMessage) => {
      const decryptedMessage = await get()._decryptSingleMessage(updatedMessage);
      set({
        messages: get().messages.map(m => m._id === decryptedMessage._id ? decryptedMessage : m)
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

    socket.on("messagePinned", async (updatedMessage) => {
      const decryptedMessage = await get()._decryptSingleMessage(updatedMessage);
      set({
        messages: get().messages.map(m => m._id === decryptedMessage._id ? decryptedMessage : m)
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    socket.off("newMessage");
    socket.off("messageReaction");
    socket.off("messageEdited");
    socket.off("messageDeleted");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
    socket.off("messageRead");
    socket.off("messagePinned");
  },

  setSelectedUser: (selectedUser) => set({ 
    selectedUser, 
    messages: [], 
    currentPage: 1, 
    hasMoreMessages: true 
  }),
}));