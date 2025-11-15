import { create } from "zustand";
import toast from "react-hot-toast";
import { WebRTCService } from "../lib/webrtc";

export const useRandomChatStore = create((set, get) => ({
  isSearching: false,
  isMatched: false,
  partner: null,
  sessionId: null,
  webrtcService: null,
  messages: [],
  localStream: null,
  remoteStream: null,

  joinRandomChat: async (socket) => {
    set({ isSearching: true, messages: [] });
    socket.emit("random:join");
  },

  handleMatched: async ({ sessionId, partner }, socket) => {
    console.log("Matched with:", partner);
    set({ isMatched: true, isSearching: false, partner, sessionId });
    
    // Initialize WebRTC
    const webrtcService = new WebRTCService();
    await webrtcService.initializePeerConnection(socket, partner._id);
    const stream = await webrtcService.getLocalStream(true); // video call
    webrtcService.addLocalStreamToPeer();
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const offer = await webrtcService.createOffer();
    socket.emit("call:offer", {
      offer,
      to: partner._id,
      callId: sessionId,
      type: "video",
    });
    
    set({ webrtcService, localStream: stream });
  },

  skipPartner: (socket) => {
    const { sessionId, webrtcService } = get();
    
    if (webrtcService) {
      webrtcService.cleanup();
    }
    
    socket.emit("random:skip", { sessionId });
    set({ 
      isMatched: false, 
      partner: null, 
      sessionId: null, 
      webrtcService: null,
      messages: [],
      localStream: null,
      remoteStream: null
    });
    
    // Rejoin queue
    get().joinRandomChat(socket);
  },

  leaveRandomChat: (socket) => {
    const { sessionId, webrtcService } = get();
    
    if (webrtcService) {
      webrtcService.cleanup();
    }
    
    socket.emit("random:leave", { sessionId });
    set({ 
      isSearching: false,
      isMatched: false, 
      partner: null, 
      sessionId: null, 
      webrtcService: null,
      messages: [],
      localStream: null,
      remoteStream: null
    });
  },

  sendMessage: (message, socket) => {
    const { sessionId } = get();
    socket.emit("random:message", { sessionId, message });
    set(state => ({ 
      messages: [...state.messages, { text: message, from: "me", timestamp: Date.now() }] 
    }));
  },

  receiveMessage: ({ message, from }) => {
    set(state => ({ 
      messages: [...state.messages, { text: message, from: "partner", timestamp: Date.now() }] 
    }));
  },

  setRemoteStream: (stream) => {
    set({ remoteStream: stream });
  },

  setupRandomChatListeners: (socket) => {
    socket.on("random:searching", () => {
      console.log("Searching for partner...");
    });

    socket.on("random:matched", (data) => {
      get().handleMatched(data, socket);
    });

    socket.on("random:partner-skipped", () => {
      toast("Partner skipped");
      get().leaveRandomChat(socket);
    });

    socket.on("random:partner-left", () => {
      toast("Partner left");
      get().leaveRandomChat(socket);
    });

    socket.on("random:partner-disconnected", () => {
      toast("Partner disconnected");
      get().leaveRandomChat(socket);
    });

    socket.on("random:message", (data) => {
      get().receiveMessage(data);
    });

    socket.on("random:error", ({ message }) => {
      toast.error(message);
      set({ isSearching: false });
    });
  },

  cleanupRandomChatListeners: (socket) => {
    socket.off("random:searching");
    socket.off("random:matched");
    socket.off("random:partner-skipped");
    socket.off("random:partner-left");
    socket.off("random:partner-disconnected");
    socket.off("random:message");
    socket.off("random:error");
  },
}));
