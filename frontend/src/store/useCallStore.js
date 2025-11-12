import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { WebRTCService } from "../lib/webrtc";

export const useCallStore = create((set, get) => ({
  incomingCall: null,
  activeCall: null,
  callHistory: [],
  isCallActive: false,
  isMuted: false,
  isVideoOff: false,
  webrtcService: null,
  callStartTime: null,
  pendingOffer: null,

  initiateCall: async (receiverId, type, socket) => {
    try {
      if (window.analytics) {
        window.analytics.track('call_initiated', { type });
      }
      
      const res = await axiosInstance.post("/calls/initiate", {
        receiverId,
        type,
      });

      const webrtcService = new WebRTCService();
      await webrtcService.initializePeerConnection(socket, receiverId);
      const stream = await webrtcService.getLocalStream(type === "video");
      webrtcService.addLocalStreamToPeer();

      const offer = await webrtcService.createOffer();
      socket.emit("call:offer", {
        offer,
        to: receiverId,
        callId: res.data._id,
        type,
      });

      set({
        activeCall: res.data,
        isCallActive: true,
        webrtcService,
        callStartTime: Date.now(),
      });

      return { call: res.data, localStream: stream };
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to initiate call");
      throw error;
    }
  },

  acceptCall: async (call, socket) => {
    try {
      const webrtcService = new WebRTCService();
      await webrtcService.initializePeerConnection(socket, call.callerId._id);
      const stream = await webrtcService.getLocalStream(call.type === "video");
      webrtcService.addLocalStreamToPeer();

      set({
        activeCall: call,
        isCallActive: true,
        webrtcService,
        incomingCall: null,
        callStartTime: Date.now(),
      });

      await axiosInstance.put(`/calls/${call._id}/status`, {
        status: "accepted",
      });

      // Process pending offer if exists
      const { pendingOffer } = get();
      if (pendingOffer) {
        console.log('📥 Processing pending offer');
        await webrtcService.setRemoteDescription(pendingOffer.offer);
        const answer = await webrtcService.createAnswer();
        socket.emit("call:answer", { answer, to: pendingOffer.from, callId: call._id });
        set({ pendingOffer: null });
      }

      return { localStream: stream };
    } catch (error) {
      toast.error("Failed to accept call");
      throw error;
    }
  },

  rejectCall: async (callId) => {
    try {
      await axiosInstance.put(`/calls/${callId}/status`, {
        status: "rejected",
      });
      set({ incomingCall: null });
    } catch (error) {
      console.error("Failed to reject call:", error);
    }
  },

  endCall: async (socket, otherUserId) => {
    const { activeCall, webrtcService, callStartTime } = get();
    
    if (activeCall) {
      const duration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;
      
      try {
        await axiosInstance.put(`/calls/${activeCall._id}/status`, {
          status: "ended",
          duration,
        });
      } catch (error) {
        console.error("Failed to update call status:", error);
      }

      if (socket && otherUserId) {
        socket.emit("call:end", { to: otherUserId, callId: activeCall._id });
      }
    }

    if (webrtcService) {
      webrtcService.cleanup();
    }

    set({
      activeCall: null,
      isCallActive: false,
      webrtcService: null,
      isMuted: false,
      isVideoOff: false,
      callStartTime: null,
    });
  },

  toggleMute: () => {
    const { webrtcService, isMuted } = get();
    const newMutedState = !isMuted;
    if (webrtcService) {
      webrtcService.toggleAudio(newMutedState);
      set({ isMuted: newMutedState });
    }
  },

  toggleVideo: () => {
    const { webrtcService, isVideoOff } = get();
    const newVideoOffState = !isVideoOff;
    if (webrtcService) {
      webrtcService.toggleVideo(newVideoOffState);
      set({ isVideoOff: newVideoOffState });
    }
  },

  getCallHistory: async () => {
    try {
      const res = await axiosInstance.get("/calls/history");
      set({ callHistory: res.data });
    } catch (error) {
      console.error("Failed to fetch call history:", error);
    }
  },

  setIncomingCall: (call) => set({ incomingCall: call }),

  setupCallListeners: (socket) => {
    socket.on("incomingCall", (call) => {
      set({ incomingCall: call });
      const audio = new Audio("/notification.mp3");
      audio.play().catch(console.error);
    });

    socket.on("call:offer", async ({ offer, from, callId, type }) => {
      console.log('📥 Received offer from:', from);
      const { webrtcService } = get();
      if (webrtcService) {
        await webrtcService.setRemoteDescription(offer);
        const answer = await webrtcService.createAnswer();
        console.log('📤 Sending answer to:', from);
        socket.emit("call:answer", { answer, to: from, callId });
      } else {
        console.log('💾 Storing offer until call is accepted');
        set({ pendingOffer: { offer, from, callId } });
      }
    });

    socket.on("call:answer", async ({ answer, from }) => {
      console.log('📥 Received answer from:', from);
      const { webrtcService } = get();
      if (webrtcService) {
        await webrtcService.setRemoteDescription(answer);
      } else {
        console.error('❌ No webrtcService when receiving answer');
      }
    });

    socket.on("call:ice-candidate", async ({ candidate, from }) => {
      console.log('🧊 ICE candidate from:', from);
      const { webrtcService } = get();
      if (webrtcService) {
        await webrtcService.addIceCandidate(candidate);
      }
    });

    socket.on("call:ended", () => {
      get().endCall(null, null);
      toast("Call ended");
    });
  },

  cleanupCallListeners: (socket) => {
    socket.off("incomingCall");
    socket.off("call:offer");
    socket.off("call:answer");
    socket.off("call:ice-candidate");
    socket.off("call:ended");
  },
}));
