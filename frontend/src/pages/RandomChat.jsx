import { useEffect, useRef, useState } from "react";
import { useRandomChatStore } from "../store/useRandomChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import { Shuffle, SkipForward, X, Send, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RandomChat = () => {
  const {
    isSearching,
    isMatched,
    partner,
    sessionId,
    webrtcService,
    messages,
    joinRandomChat,
    skipPartner,
    leaveRandomChat,
    sendMessage,
    setRemoteStream,
    setupRandomChatListeners,
    cleanupRandomChatListeners,
  } = useRandomChatStore();
  
  const { socket, authUser } = useAuthStore();
  const { setupCallListeners, cleanupCallListeners } = useCallStore();
  const navigate = useNavigate();
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [messageInput, setMessageInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (!socket) return;
    
    setupRandomChatListeners(socket);
    setupCallListeners(socket);
    
    // Handle WebRTC offer (for receiver)
    const handleOffer = async ({ offer, from, callId }) => {
      if (webrtcService && partner && from === partner._id) {
        await webrtcService.setRemoteDescription(offer);
        const answer = await webrtcService.createAnswer();
        socket.emit("call:answer", {
          answer,
          to: from,
          callId,
        });
        console.log('✅ Offer received, answer sent');
      }
    };
    
    // Handle WebRTC answer (for caller)
    const handleAnswer = async ({ answer, from }) => {
      if (webrtcService && partner && from === partner._id) {
        await webrtcService.setRemoteDescription(answer);
        console.log('✅ Answer received and set');
      }
    };
    
    socket.on("call:offer", handleOffer);
    socket.on("call:answer", handleAnswer);
    
    return () => {
      socket.off("call:offer", handleOffer);
      socket.off("call:answer", handleAnswer);
      cleanupRandomChatListeners(socket);
      cleanupCallListeners(socket);
      leaveRandomChat(socket);
    };
  }, [socket, webrtcService, partner]);

  useEffect(() => {
    if (webrtcService) {
      // Set local stream
      if (webrtcService.localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = webrtcService.localStream;
      }

      // Set remote stream callback
      webrtcService.setOnRemoteStream((stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.play().catch(console.error);
          setRemoteStream(stream);
        }
      });
    }
  }, [webrtcService]);

  const handleStart = () => {
    joinRandomChat(socket);
  };

  const handleSkip = () => {
    skipPartner(socket);
  };

  const handleLeave = () => {
    leaveRandomChat(socket);
    navigate("/");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput, socket);
      setMessageInput("");
    }
  };

  const toggleMute = () => {
    if (webrtcService) {
      webrtcService.toggleAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (webrtcService) {
      webrtcService.toggleVideo(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  if (!isSearching && !isMatched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20">
        <div className="text-center space-y-6 p-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-pulse">
            <Shuffle size={64} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold">Random Video Chat</h1>
          <p className="text-lg text-base-content/70">Connect with strangers around the world</p>
          <button onClick={handleStart} className="btn btn-primary btn-lg gap-2">
            <Shuffle size={24} />
            Start Chatting
          </button>
        </div>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <h2 className="text-2xl font-bold">Finding a stranger...</h2>
          <button onClick={handleLeave} className="btn btn-ghost">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-base-300 flex">
      {/* Video Section */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={false}
          className="w-full h-full object-cover bg-black"
        />
        
        {/* Local Video */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-4 right-4 w-48 h-36 rounded-xl border-4 border-white/20 object-cover shadow-2xl bg-gray-800"
        />

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
          <button onClick={toggleMute} className={`btn btn-circle ${isMuted ? "btn-error" : "btn-ghost bg-white/20"}`}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button onClick={toggleVideo} className={`btn btn-circle ${isVideoOff ? "btn-error" : "btn-ghost bg-white/20"}`}>
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
          <button onClick={handleSkip} className="btn btn-circle btn-warning">
            <SkipForward size={24} />
          </button>
          <button onClick={handleLeave} className="btn btn-circle btn-error">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-80 bg-base-200 flex flex-col">
        <div className="p-4 border-b border-base-300">
          <h3 className="font-bold">Chat with Stranger</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat ${msg.from === "me" ? "chat-end" : "chat-start"}`}>
              <div className="chat-bubble">{msg.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="input input-bordered flex-1"
            />
            <button type="submit" className="btn btn-primary">
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RandomChat;
