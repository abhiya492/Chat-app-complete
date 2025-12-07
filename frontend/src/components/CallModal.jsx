import { useEffect, useRef, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { PhoneOff, Mic, MicOff, Video, VideoOff, FlipHorizontal, RotateCw, Sparkles, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";

const FILTERS = [
  { name: "None", value: "none", icon: "✨" },
  { name: "Grayscale", value: "grayscale(100%)", icon: "⚫" },
  { name: "Sepia", value: "sepia(100%)", icon: "🟤" },
  { name: "Blur", value: "blur(3px)", icon: "🌫️" },
  { name: "Brightness", value: "brightness(150%)", icon: "☀️" },
  { name: "Contrast", value: "contrast(150%)", icon: "🔆" },
  { name: "Saturate", value: "saturate(200%)", icon: "🎨" },
  { name: "Invert", value: "invert(100%)", icon: "🔄" },
];

const CallModal = () => {
  const { activeCall, isCallActive, isMuted, isVideoOff, toggleMute, toggleVideo, endCall, webrtcService, callStartTime } = useCallStore();
  const { socket, authUser } = useAuthStore();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteStreamReady, setRemoteStreamReady] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const animationFrameRef = useRef(null);
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [filter, setFilter] = useState("none");
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [particles, setParticles] = useState([]);

  const isVideo = activeCall?.type === "video";
  const otherUser = activeCall?.callerId?._id === authUser?._id ? activeCall?.receiverId : activeCall?.callerId;

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (!isCallActive || !webrtcService) return;
    
    const handleInteraction = () => {
      if (remoteVideoRef.current && remoteVideoRef.current.paused) {
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.volume = 1.0;
        remoteVideoRef.current.play().catch(console.error);
      }
    };
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    if (webrtcService.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = webrtcService.localStream;
    }

    webrtcService.setOnRemoteStream((stream) => {
      if (remoteVideoRef.current && stream) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.volume = isSpeakerOn ? 1.0 : 0;
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.autoplay = true;
        remoteVideoRef.current.playsInline = true;
        stream.getAudioTracks().forEach(track => track.enabled = true);
        setRemoteStreamReady(true);
        if (remoteVideoRef.current.setSinkId) remoteVideoRef.current.setSinkId('').catch(console.error);
        remoteVideoRef.current.play().then(() => setAudioInitialized(true)).catch(() => document.addEventListener('click', () => remoteVideoRef.current?.play(), { once: true }));
      }
    });

    const simulateAudioLevel = () => {
      if (audioInitialized) setAudioLevel(Math.random() * 60 + 20);
      animationFrameRef.current = requestAnimationFrame(simulateAudioLevel);
    };
    simulateAudioLevel();

    return () => {
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [isCallActive, webrtcService, audioInitialized, isSpeakerOn]);

  useEffect(() => {
    if (!callStartTime) return;
    const interval = setInterval(() => setCallDuration(Math.floor((Date.now() - callStartTime) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [callStartTime]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.volume = isSpeakerOn ? 1.0 : 0;
    }
  }, [isSpeakerOn]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!isCallActive || !authUser) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden">
      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Glassmorphism header */}
      <div className="absolute top-0 left-0 right-0 z-20 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="avatar">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ring-2 ring-primary/50 ring-offset-2 ring-offset-transparent">
                  <img src={otherUser?.profilePic || "/avatar.png"} alt={otherUser?.fullName} className="rounded-2xl" />
                </div>
              </div>
              {remoteStreamReady && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg sm:text-xl">{otherUser?.fullName}</h3>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-mono">{formatDuration(callDuration)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {remoteStreamReady && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                <span className="text-green-300 text-sm font-medium">Connected</span>
              </div>
            )}
            <button onClick={toggleFullscreen} className="btn btn-ghost btn-circle text-white/70 hover:text-white hover:bg-white/10">
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden mt-20 sm:mt-24 group">
        {isVideo ? (
          <>
            {/* Video call UI */}
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                className="w-full h-full object-cover"
                style={{ transform: `scaleX(${isFlipped ? -1 : 1}) rotate(${rotation}deg)`, filter: filter }}
              />
              
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {/* Audio visualizer overlay */}
              {audioInitialized && (
                <div className="absolute bottom-32 left-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
                  <Mic size={18} className="text-green-400" />
                  <div className="flex items-center gap-1">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-green-400 to-green-600 rounded-full transition-all duration-100"
                        style={{ height: `${Math.max(4, (audioLevel / 100) * 24 * (0.5 + Math.random()))}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-white/70 text-sm font-medium">{Math.round(audioLevel)}%</span>
                </div>
              )}

              {/* Camera controls */}
              <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button onClick={() => setIsFlipped(!isFlipped)} className="btn btn-circle bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60 hover:scale-110 transition-all" title="Flip">
                  <FlipHorizontal size={20} />
                </button>
                <button onClick={() => setRotation((rotation + 90) % 360)} className="btn btn-circle bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60 hover:scale-110 transition-all" title="Rotate">
                  <RotateCw size={20} />
                </button>
                <button onClick={() => setShowControls(!showControls)} className="btn btn-circle bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60 hover:scale-110 transition-all" title="Filters">
                  <Sparkles size={20} />
                </button>
              </div>

              {/* Filter menu */}
              {showControls && (
                <div className="absolute top-6 right-24 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-2 min-w-[160px] shadow-2xl animate-in fade-in slide-in-from-right-5 duration-300">
                  <div className="grid grid-cols-2 gap-2">
                    {FILTERS.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => { setFilter(f.value); setShowControls(false); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                          filter === f.value 
                            ? 'bg-primary text-white shadow-lg scale-105' 
                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">{f.icon}</span>
                        <span className="text-xs font-medium">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Local video preview - Picture in Picture */}
            {!isVideoOff ? (
              <div className="absolute bottom-32 right-6 group/pip">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-primary/50">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-32 h-24 sm:w-48 sm:h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/pip:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover/pip:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">You</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-32 right-6 w-32 h-24 sm:w-48 sm:h-36 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-white/10 flex flex-col items-center justify-center shadow-2xl">
                <VideoOff size={32} className="text-white/40 mb-2" />
                <span className="text-white/40 text-xs">Camera Off</span>
              </div>
            )}
          </>
        ) : (
          /* Voice call UI */
          <div className="flex items-center justify-center h-full relative">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 animate-pulse" style={{ animationDuration: '3s' }} />
            
            {/* Circular audio visualizer */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96">
                {[...Array(40)].map((_, i) => {
                  const angle = (i / 40) * 360;
                  const barHeight = Math.max(20, audioLevel * (0.5 + Math.random() * 0.5));
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 origin-bottom"
                      style={{
                        transform: `translate(-50%, -100%) rotate(${angle}deg) translateY(-140px)`,
                        width: '4px',
                        height: `${barHeight}px`,
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-t from-primary via-secondary to-accent rounded-full opacity-70 transition-all duration-100" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center avatar */}
            <div className="relative z-10">
              <div className="relative mb-8">
                {/* Pulsing rings */}
                {[1, 2, 3].map((ring) => (
                  <div
                    key={ring}
                    className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"
                    style={{
                      animationDuration: `${2 + ring}s`,
                      animationDelay: `${ring * 0.3}s`,
                      transform: `scale(${1 + ring * 0.2})`,
                    }}
                  />
                ))}
                
                <div className="avatar relative">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full ring-4 ring-primary/50 ring-offset-8 ring-offset-transparent shadow-2xl transition-all duration-300"
                    style={{ boxShadow: `0 0 ${audioLevel * 2}px rgba(var(--p), ${audioLevel / 100})` }}>
                    <img src={otherUser?.profilePic || "/avatar.png"} alt={otherUser?.fullName} className="rounded-full" />
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">{otherUser?.fullName}</h2>
                <p className="text-2xl text-white/70 font-mono">{formatDuration(callDuration)}</p>
                
                {audioInitialized && (
                  <div className="flex flex-col items-center gap-3 mt-6">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-300 font-medium">Audio Connected</span>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
                      <Mic size={16} className="text-white/70" />
                      <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 transition-all duration-100 rounded-full" style={{ width: `${audioLevel}%` }} />
                      </div>
                      <span className="text-white/70 text-sm font-mono">{Math.round(audioLevel)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <audio ref={remoteVideoRef} autoPlay playsInline className="hidden" />
          </div>
        )}
      </div>

      {/* Glassmorphism control bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 backdrop-blur-2xl bg-black/30 border-t border-white/10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center items-center gap-4 sm:gap-8">
            {/* Mute button */}
            <div className="relative group">
              <button
                onClick={toggleMute}
                className={`btn btn-circle btn-lg sm:btn-xl shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                  isMuted 
                    ? "bg-red-500 hover:bg-red-600 border-red-400 animate-pulse" 
                    : "bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-xl"
                }`}
              >
                {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
              </button>
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-xl text-white text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none border border-white/10">
                {isMuted ? "Unmute" : "Mute"}
              </div>
              {isMuted && <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />}
            </div>

            {/* Speaker button */}
            <div className="relative group">
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`btn btn-circle btn-lg sm:btn-xl shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                  !isSpeakerOn 
                    ? "bg-red-500 hover:bg-red-600 border-red-400" 
                    : "bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-xl"
                }`}
              >
                {isSpeakerOn ? <Volume2 size={24} className="text-white" /> : <VolumeX size={24} className="text-white" />}
              </button>
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-xl text-white text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none border border-white/10">
                {isSpeakerOn ? "Mute Speaker" : "Unmute Speaker"}
              </div>
            </div>

            {/* Video toggle */}
            {isVideo && (
              <div className="relative group">
                <button
                  onClick={toggleVideo}
                  className={`btn btn-circle btn-lg sm:btn-xl shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isVideoOff 
                      ? "bg-red-500 hover:bg-red-600 border-red-400 animate-pulse" 
                      : "bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-xl"
                  }`}
                >
                  {isVideoOff ? <VideoOff size={24} className="text-white" /> : <Video size={24} className="text-white" />}
                </button>
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-xl text-white text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none border border-white/10">
                  {isVideoOff ? "Turn on camera" : "Turn off camera"}
                </div>
                {isVideoOff && <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />}
              </div>
            )}

            {/* End call button */}
            <div className="relative group">
              <button
                onClick={() => endCall(socket, otherUser?._id)}
                className="btn btn-circle btn-lg sm:btn-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-none shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
              >
                <PhoneOff size={24} className="text-white" />
              </button>
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-xl text-white text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none border border-white/10">
                End call
              </div>
            </div>
          </div>
          
          {/* Call stats */}
          <div className="mt-6 flex justify-center gap-6 text-white/50 text-xs sm:text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full ${remoteStreamReady ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span>{remoteStreamReady ? 'Connected' : 'Connecting...'}</span>
            </div>
            {audioInitialized && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm">
                <Mic size={14} className="text-green-400" />
                <span>Audio Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
      `}</style>
    </div>
  );
};

export default CallModal;
