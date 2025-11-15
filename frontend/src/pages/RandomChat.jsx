import { useEffect, useRef, useState } from "react";
import { useRandomChatStore } from "../store/useRandomChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import { Shuffle, SkipForward, X, Send, Mic, MicOff, Video, VideoOff, Globe, Smile, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RandomChat = () => {
  const {
    isSearching,
    isMatched,
    partner,
    sessionId,
    webrtcService,
    messages,
    localStream,
    remoteStream,
    joinRandomChat,
    skipPartner,
    leaveRandomChat,
    sendMessage,
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
  const [selectedLanguage, setSelectedLanguage] = useState('any');
  const [interests, setInterests] = useState([]);
  const [chatDuration, setChatDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const messagesEndRef = useRef(null);

  const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👋', '🎉', '❤️', '🔥', '✨', '💯', '🙌', '👏', '🤝'];
  const trendingGifs = [
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
    'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
  ];

  const languages = [
    { code: 'any', name: 'Any Language' },
    { code: 'english', name: 'English' },
    { code: 'hindi', name: 'हिन्दी (Hindi)' },
    { code: 'spanish', name: 'Español' },
    { code: 'french', name: 'Français' },
    { code: 'german', name: 'Deutsch' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isMatched) {
      setChatDuration(0);
      return;
    }
    const timer = setInterval(() => setChatDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isMatched]);

  useEffect(() => {
    if (!socket) return;
    
    setupRandomChatListeners(socket);
    setupCallListeners(socket);
    
    return () => {
      cleanupRandomChatListeners(socket);
      cleanupCallListeners(socket);
      leaveRandomChat(socket);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !webrtcService || !partner) return;
    
    console.log('🔧 Setting up WebRTC handlers for partner:', partner._id);
    
    // Handle WebRTC offer (for receiver)
    const handleOffer = async ({ offer, from, callId }) => {
      console.log('📥 Received offer from:', from, 'expected:', partner._id);
      if (from === partner._id) {
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
      console.log('📥 Received answer from:', from, 'expected:', partner._id);
      if (from === partner._id) {
        await webrtcService.setRemoteDescription(answer);
        console.log('✅ Answer received and set');
      }
    };
    
    // Handle ICE candidates
    const handleIceCandidate = ({ candidate, from }) => {
      console.log('🧊 Received ICE candidate from:', from);
      if (from === partner._id) {
        webrtcService.addIceCandidate(candidate);
      }
    };
    
    socket.on("call:offer", handleOffer);
    socket.on("call:answer", handleAnswer);
    socket.on("call:ice-candidate", handleIceCandidate);
    
    return () => {
      socket.off("call:offer", handleOffer);
      socket.off("call:answer", handleAnswer);
      socket.off("call:ice-candidate", handleIceCandidate);
    };
  }, [socket, webrtcService, partner]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      console.log('✅ Local video set:', localStream.getTracks().map(t => t.kind));
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('🎬 Attaching remote stream to video element');
      console.log('Video element exists:', !!remoteVideoRef.current);
      console.log('Stream tracks:', remoteStream.getTracks().map(t => `${t.kind}: ${t.readyState}`));
      
      remoteVideoRef.current.srcObject = remoteStream;
      
      // Force play
      remoteVideoRef.current.play()
        .then(() => console.log('✅ Remote video playing'))
        .catch(err => console.error('❌ Remote video play failed:', err));
      
      console.log('✅ Remote video set:', remoteStream.getTracks().map(t => t.kind));
    }
  }, [remoteStream]);

  const handleStart = () => {
    joinRandomChat(socket, selectedLanguage);
  };

  const handleSkip = () => {
    skipPartner(socket, selectedLanguage);
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
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessageInput(messageInput + emoji);
  };

  const handleGifClick = (gifUrl) => {
    sendMessage(gifUrl, socket, 'gif');
    setShowGifPicker(false);
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
          
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Globe size={18} />
                  Select Language
                </span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Interests (optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., music, sports, coding"
                className="input input-bordered w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    setInterests([...interests, e.target.value.trim()]);
                    e.target.value = '';
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {interests.map((interest, idx) => (
                  <span key={idx} className="badge badge-primary gap-2">
                    {interest}
                    <button onClick={() => setInterests(interests.filter((_, i) => i !== idx))} className="text-xs">×</button>
                  </span>
                ))}
              </div>
            </div>
            
            <button onClick={handleStart} className="btn btn-primary btn-lg gap-2 w-full">
              <Shuffle size={24} />
              Start Chatting
            </button>
          </div>
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
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Chat with Stranger</h3>
            <span className="text-xs text-base-content/60">{Math.floor(chatDuration / 60)}:{(chatDuration % 60).toString().padStart(2, '0')}</span>
          </div>
          {partner?.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {partner.interests.map((interest, idx) => (
                <span key={idx} className="badge badge-xs badge-ghost">{interest}</span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && (
            <div className="text-center text-base-content/50 text-sm mt-8">
              Say hi to start the conversation! 👋
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat ${msg.from === "me" ? "chat-end" : "chat-start"}`}>
              <div className="chat-bubble">
                {msg.type === 'gif' ? (
                  <img src={msg.text} alt="gif" className="max-w-full rounded" />
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300">
          {showEmojiPicker && (
            <div className="mb-2 p-2 bg-base-100 rounded-lg grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
              {emojis.map((emoji, idx) => (
                <button key={idx} type="button" onClick={() => handleEmojiClick(emoji)} className="text-2xl hover:scale-125 transition-transform">
                  {emoji}
                </button>
              ))}
            </div>
          )}
          {showGifPicker && (
            <div className="mb-2 p-2 bg-base-100 rounded-lg">
              <input
                type="text"
                placeholder="Search GIFs..."
                value={gifSearch}
                onChange={(e) => setGifSearch(e.target.value)}
                className="input input-sm input-bordered w-full mb-2"
              />
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {trendingGifs.map((gif, idx) => (
                  <img key={idx} src={gif} alt="gif" onClick={() => handleGifClick(gif)} className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80" />
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }} className="btn btn-ghost btn-sm">
              <Smile size={20} />
            </button>
            <button type="button" onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }} className="btn btn-ghost btn-sm">
              <ImageIcon size={20} />
            </button>
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
