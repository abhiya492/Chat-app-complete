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
  const [liveReaction, setLiveReaction] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const emojiCategories = {
    smileys: ['😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😎', '🤗', '🤔', '😏', '😜', '🤪', '😇', '🥳', '🤩'],
    gestures: ['👍', '👎', '👏', '🙌', '👋', '🤝', '✌️', '🤞', '🤟', '🤘', '👌', '💪', '🙏', '✋', '🤚', '👊'],
    hearts: ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💞', '💟', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍'],
    reactions: ['🔥', '✨', '💯', '⚡', '💥', '🌟', '⭐', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '👑', '💎', '🚀'],
    memes: ['😭', '💀', '🤡', '👻', '💩', '🤮', '🥴', '😵', '🤯', '😱', '🙄', '😤', '😠', '🤬', '😈', '👿']
  };
  const [activeEmojiTab, setActiveEmojiTab] = useState('smileys');
  
  const memeTemplates = [
    { url: 'https://i.imgflip.com/30b1gx.jpg', name: 'Drake' },
    { url: 'https://i.imgflip.com/1bij.jpg', name: 'Success Kid' },
    { url: 'https://i.imgflip.com/1g8my4.jpg', name: 'Distracted Boyfriend' },
    { url: 'https://i.imgflip.com/26am.jpg', name: 'Surprised Pikachu' },
    { url: 'https://i.imgflip.com/1ur9b0.jpg', name: 'Stonks' },
    { url: 'https://i.imgflip.com/4t0m5.jpg', name: 'Woman Yelling at Cat' },
    { url: 'https://i.imgflip.com/3lmzyx.jpg', name: 'Bernie Sanders' },
    { url: 'https://i.imgflip.com/1ihzfe.jpg', name: 'Expanding Brain' },
    { url: 'https://i.imgflip.com/5c7lwq.jpg', name: 'Trade Offer' },
    { url: 'https://i.imgflip.com/261o3j.jpg', name: 'Panik Kalm' },
    { url: 'https://i.imgflip.com/2fm6x.jpg', name: 'Disaster Girl' },
    { url: 'https://i.imgflip.com/1otk96.jpg', name: 'Mocking SpongeBob' },
    { url: 'https://i.imgflip.com/2kbn1e.jpg', name: 'Is This a Pigeon' },
    { url: 'https://i.imgflip.com/1c1uej.jpg', name: 'Leonardo DiCaprio' },
    { url: 'https://i.imgflip.com/3oevdk.jpg', name: 'Buff Doge vs Cheems' },
    { url: 'https://i.imgflip.com/4acd7j.jpg', name: 'Coffin Dance' },
    { url: 'https://i.imgflip.com/5gimtn.jpg', name: 'Gigachad' },
    { url: 'https://i.imgflip.com/5o32tt.jpg', name: 'Bing Chilling' },
    { url: 'https://i.imgflip.com/6eewtf.jpg', name: 'Breaking Bad' },
    { url: 'https://i.imgflip.com/7p4k5p.jpg', name: 'Barbie Oppenheimer' },
    { url: 'https://i.imgflip.com/1bh6de.jpg', name: 'Roll Safe' },
    { url: 'https://i.imgflip.com/1yxkcp.jpg', name: 'Monkey Puppet' },
    { url: 'https://i.imgflip.com/2ybua0.jpg', name: 'Surprised Pikachu HD' },
    { url: 'https://i.imgflip.com/3oqj4n.jpg', name: 'Doge' },
    { url: 'https://i.imgflip.com/4hiybr.jpg', name: 'Always Has Been' },
    { url: 'https://i.imgflip.com/5c7lwq.jpg', name: 'Trade Offer' },
    { url: 'https://i.imgflip.com/5kdc6d.jpg', name: 'Sigma Male' },
    { url: 'https://i.imgflip.com/6c8s1j.jpg', name: 'Gru Plan' },
    { url: 'https://i.imgflip.com/1e7ql7.jpg', name: 'Tuxedo Winnie' },
    { url: 'https://i.imgflip.com/2cp1.jpg', name: 'Bad Luck Brian' },
    { url: 'https://i.imgflip.com/1o00in.jpg', name: 'Boardroom Meeting' },
    { url: 'https://i.imgflip.com/1wz3as.jpg', name: 'Spiderman Pointing' },
    { url: 'https://i.imgflip.com/3umnxp.jpg', name: 'Anakin Padme' },
    { url: 'https://i.imgflip.com/4p3fy2.jpg', name: 'Wojak' },
    { url: 'https://i.imgflip.com/5xtog5.jpg', name: 'Squid Game' },
    { url: 'https://i.imgflip.com/6hl9v2.jpg', name: 'Wednesday Addams' },
    { url: 'https://i.imgflip.com/7kqcxo.jpg', name: 'Oppenheimer' },
    { url: 'https://i.imgflip.com/8g0ew4.jpg', name: 'Skibidi Toilet' },
    { url: 'https://i.imgflip.com/8jw6jn.jpg', name: 'Sigma Grindset' },
    { url: 'https://i.imgflip.com/1nck6k.jpg', name: 'Waiting Skeleton' },
    { url: 'https://i.imgflip.com/1h7in3.jpg', name: 'Two Buttons' },
    { url: 'https://i.imgflip.com/1bgw.jpg', name: 'Philosoraptor' },
    { url: 'https://i.imgflip.com/1bhk.jpg', name: 'First World Problems' },
    { url: 'https://i.imgflip.com/5xtog5.jpg', name: 'Pepe' },
    { url: 'https://i.imgflip.com/2d3al6.jpg', name: 'Thanos Snap' },
    { url: 'https://i.imgflip.com/3pnr0n.jpg', name: 'Baby Yoda' },
    { url: 'https://i.imgflip.com/4apmep.jpg', name: 'Coffin Dance Meme' },
    { url: 'https://i.imgflip.com/5c7lwq.jpg', name: 'Trade Offer 2' },
    { url: 'https://i.imgflip.com/6eewtf.jpg', name: 'Better Call Saul' },
  ];
  
  const trendingGifs = [
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
    'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
    'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
    'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
    'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
    'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif',
    'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.gif',
    'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif',
    'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif',
    'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif',
    'https://media.giphy.com/media/3o6Zt0hNCfak3QCqsw/giphy.gif',
    'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif',
    'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif',
    'https://media.giphy.com/media/l0MYGb8Y3odnQPJXa/giphy.gif',
    'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
    'https://media.giphy.com/media/26tPnAAJxXTvpLwJy/giphy.gif',
    'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif',
    'https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif',
    'https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/26tPqTOGf3MMAaJR6/giphy.gif',
    'https://media.giphy.com/media/3o7TKnO6Wve6502iJ2/giphy.gif',
    'https://media.giphy.com/media/26BRwW3ckGjcZmsxO/giphy.gif',
    'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif',
    'https://media.giphy.com/media/26tPo9rksWnfPo4HS/giphy.gif',
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif',
    'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif',
    'https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif',
    'https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif',
    'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif',
    'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.gif',
    'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif',
    'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif',
    'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif',
    'https://media.giphy.com/media/3o6Zt0hNCfak3QCqsw/giphy.gif',
    'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif',
    'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif',
    'https://media.giphy.com/media/l0MYGb8Y3odnQPJXa/giphy.gif',
    'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
    'https://media.giphy.com/media/26tPnAAJxXTvpLwJy/giphy.gif',
    'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif',
    'https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif',
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
      setIsTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
  };

  const handleEmojiClick = (emoji) => {
    setMessageInput(messageInput + emoji);
  };

  const handleGifClick = (gifUrl) => {
    sendMessage(gifUrl, socket, 'gif');
    setShowGifPicker(false);
    showLiveReaction(gifUrl, 'gif');
  };

  const handleMemeClick = (memeUrl) => {
    sendMessage(memeUrl, socket, 'meme');
    showLiveReaction(memeUrl, 'meme');
  };

  const showLiveReaction = (content, type) => {
    setLiveReaction({ content, type });
    setTimeout(() => setLiveReaction(null), 3000);
  };

  const sendQuickEmoji = (emoji) => {
    sendMessage(emoji, socket, 'emoji');
    showLiveReaction(emoji, 'emoji');
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
        {/* Live Reaction Overlay */}
        {liveReaction && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none animate-in fade-in zoom-in">
            {liveReaction.type === 'gif' || liveReaction.type === 'meme' ? (
              <img src={liveReaction.content} alt="reaction" className="max-w-lg max-h-[500px] rounded-xl shadow-2xl animate-bounce" />
            ) : (
              <span className="text-9xl drop-shadow-2xl animate-bounce">{liveReaction.content}</span>
            )}
          </div>
        )}
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

        {/* Quick Emoji Reactions */}
        <div className="absolute top-4 left-4 flex gap-2">
          {['👍', '❤️', '😂', '😮', '🔥'].map((emoji, idx) => (
            <button key={idx} onClick={() => sendQuickEmoji(emoji)} className="btn btn-circle btn-sm bg-white/20 hover:bg-white/40 backdrop-blur-sm text-2xl border-0 hover:scale-125 transition-transform shadow-lg">
              {emoji}
            </button>
          ))}
        </div>

        {/* Connection Quality Indicator */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connectionQuality === 'good' ? 'bg-green-500' : connectionQuality === 'medium' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></span>
          {connectionQuality === 'good' ? 'HD' : connectionQuality === 'medium' ? 'SD' : 'Poor'}
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl">
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
        <div className="p-4 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="avatar online placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <span className="text-xl">👤</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold">Stranger</h3>
                <div className="flex items-center gap-1 text-xs">
                  <span className={`badge badge-xs ${connectionQuality === 'good' ? 'badge-success' : connectionQuality === 'medium' ? 'badge-warning' : 'badge-error'}`}></span>
                  <span className="text-base-content/60">{Math.floor(chatDuration / 60)}:{(chatDuration % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </div>
          {partner?.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {partner.interests.map((interest, idx) => (
                <span key={idx} className="badge badge-xs badge-primary">{interest}</span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-base-200 to-base-300">
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <div className="text-6xl mb-4 animate-bounce">👋</div>
              <p className="text-base-content/70 font-medium">Say hi to start the conversation!</p>
              <p className="text-xs text-base-content/50 mt-2">Send a message, emoji, or GIF</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat ${msg.from === "me" ? "chat-end" : "chat-start"} animate-in slide-in-from-bottom-2`}>
              <div className={`chat-bubble ${msg.from === "me" ? 'chat-bubble-primary' : 'chat-bubble-secondary'} shadow-md`}>
                {msg.type === 'gif' || msg.type === 'meme' ? (
                  <img src={msg.text} alt={msg.type} className="max-w-full rounded-lg" />
                ) : (
                  <span className="text-sm">{msg.text}</span>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="chat chat-start animate-pulse">
              <div className="chat-bubble chat-bubble-secondary">
                <span className="loading loading-dots loading-sm"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-base-300">
          {showEmojiPicker && (
            <div className="bg-base-100 border-b border-base-300">
              <div className="flex gap-1 p-2 overflow-x-auto">
                {Object.keys(emojiCategories).map(cat => (
                  <button key={cat} type="button" onClick={() => setActiveEmojiTab(cat)} className={`btn btn-xs capitalize ${activeEmojiTab === cat ? 'btn-primary' : 'btn-ghost'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="p-3 grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                {emojiCategories[activeEmojiTab].map((emoji, idx) => (
                  <button key={idx} type="button" onClick={() => handleEmojiClick(emoji)} className="text-3xl hover:scale-125 transition-transform p-1">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          {showGifPicker && (
            <div className="bg-base-100 border-b border-base-300">
              <div className="flex gap-2 p-3 border-b">
                <button type="button" onClick={() => setGifSearch('')} className={`btn btn-sm flex-1 ${!gifSearch ? 'btn-primary' : 'btn-ghost'}`}>🎬 GIFs</button>
                <button type="button" onClick={() => setGifSearch('memes')} className={`btn btn-sm flex-1 ${gifSearch === 'memes' ? 'btn-primary' : 'btn-ghost'}`}>😂 Memes</button>
              </div>
              {gifSearch !== 'memes' ? (
                <div className="p-3">
                  <input
                    type="text"
                    placeholder="Search trending GIFs..."
                    value={gifSearch}
                    onChange={(e) => setGifSearch(e.target.value)}
                    className="input input-sm input-bordered w-full mb-3"
                  />
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {trendingGifs.map((gif, idx) => (
                      <img key={idx} src={gif} alt="gif" onClick={() => handleGifClick(gif)} className="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 hover:scale-105 transition-all shadow-md" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {memeTemplates.map((meme, idx) => (
                    <div key={idx} onClick={() => handleMemeClick(meme.url)} className="cursor-pointer hover:scale-105 transition-all">
                      <img src={meme.url} alt={meme.name} className="w-full h-28 object-cover rounded-lg shadow-md" />
                      <p className="text-xs text-center mt-1 font-medium">{meme.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="p-3">
            <div className="flex items-center gap-2 bg-base-100 rounded-full px-2 py-1 shadow-lg">
              <button type="button" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }} className="btn btn-circle btn-ghost btn-sm hover:bg-primary/20">
                <Smile size={22} />
              </button>
              <button type="button" onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }} className="btn btn-circle btn-ghost btn-sm hover:bg-primary/20">
                <ImageIcon size={22} />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                placeholder="Type a message..."
                className="input input-sm bg-transparent border-0 flex-1 focus:outline-none"
              />
              <button type="submit" disabled={!messageInput.trim()} className="btn btn-circle btn-primary btn-sm shadow-lg hover:scale-110 transition-transform disabled:opacity-50">
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RandomChat;
