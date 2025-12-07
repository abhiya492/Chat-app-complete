import { useEffect, useRef, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, FlipHorizontal, RotateCw, Sparkles } from "lucide-react";

const FILTERS = [
  { name: "None", value: "none" },
  { name: "Grayscale", value: "grayscale(100%)" },
  { name: "Sepia", value: "sepia(100%)" },
  { name: "Blur", value: "blur(3px)" },
  { name: "Brightness", value: "brightness(150%)" },
  { name: "Contrast", value: "contrast(150%)" },
];

const CallModal = () => {
  const {
    activeCall,
    isCallActive,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    endCall,
    webrtcService,
    callStartTime,
  } = useCallStore();
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

  const isVideo = activeCall?.type === "video";
  const otherUser =
    activeCall?.callerId?._id === authUser?._id
      ? activeCall?.receiverId
      : activeCall?.callerId;

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
        remoteVideoRef.current.volume = 1.0;
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.autoplay = true;
        remoteVideoRef.current.playsInline = true;
        
        stream.getAudioTracks().forEach(track => track.enabled = true);
        setRemoteStreamReady(true);
        
        if (remoteVideoRef.current.setSinkId) {
          remoteVideoRef.current.setSinkId('').catch(console.error);
        }
        
        remoteVideoRef.current.play()
          .then(() => setAudioInitialized(true))
          .catch(() => document.addEventListener('click', () => remoteVideoRef.current?.play(), { once: true }));
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
  }, [isCallActive, webrtcService, audioInitialized]);

  useEffect(() => {
    if (!callStartTime) return;
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [callStartTime]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFlip = () => setIsFlipped(!isFlipped);
  const handleRotate = () => setRotation((rotation + 90) % 360);
  const handleFilter = (filterValue) => {
    setFilter(filterValue);
    setShowControls(false);
  };

  if (!isCallActive || !authUser) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-base-300 via-base-200 to-base-300 flex flex-col overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-2">
              <img src={otherUser?.profilePic || "/avatar.png"} alt={otherUser?.fullName} />
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold">{otherUser?.fullName}</h3>
            <p className="text-white/70 text-sm">{formatDuration(callDuration)}</p>
          </div>
        </div>
        {remoteStreamReady && (
          <div className="badge badge-success gap-2 animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Connected
          </div>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {isVideo ? (
          <>
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {!isVideoOff ? (
              <div className="absolute bottom-24 sm:bottom-20 right-2 sm:right-4 group">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-24 h-20 sm:w-40 sm:h-32 rounded-lg sm:rounded-2xl border-2 sm:border-4 border-white/20 object-cover shadow-2xl transition-all"
                  style={{
                    transform: `scaleX(${isFlipped ? -1 : 1}) rotate(${rotation}deg)`,
                    filter: filter
                  }}
                />
                
                {/* Camera Controls */}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleFlip}
                    className="btn btn-xs btn-circle bg-black/50 border-none text-white hover:bg-black/70"
                    title="Flip camera"
                  >
                    <FlipHorizontal size={12} />
                  </button>
                  <button
                    onClick={handleRotate}
                    className="btn btn-xs btn-circle bg-black/50 border-none text-white hover:bg-black/70"
                    title="Rotate camera"
                  >
                    <RotateCw size={12} />
                  </button>
                  <button
                    onClick={() => setShowControls(!showControls)}
                    className="btn btn-xs btn-circle bg-black/50 border-none text-white hover:bg-black/70"
                    title="Filters"
                  >
                    <Sparkles size={12} />
                  </button>
                </div>

                {/* Filter Menu */}
                {showControls && (
                  <div className="absolute top-8 right-0 bg-base-100 rounded-lg shadow-xl p-2 min-w-[120px] z-20">
                    {FILTERS.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => handleFilter(f.value)}
                        className={`btn btn-sm btn-ghost w-full justify-start ${filter === f.value ? 'btn-active' : ''}`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute bottom-24 sm:bottom-20 right-2 sm:right-4 w-24 h-20 sm:w-40 sm:h-32 rounded-lg sm:rounded-2xl border-2 sm:border-4 border-white/20 bg-gradient-to-br from-base-300 to-base-200 flex flex-col items-center justify-center shadow-2xl">
                <VideoOff size={24} className="sm:w-10 sm:h-10 text-base-content/50 mb-1 sm:mb-2" />
                <span className="text-[10px] sm:text-xs text-base-content/50">Camera Off</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 transition-all duration-300" style={{ opacity: 0.3 + (audioLevel / 200), transform: `scale(${1 + audioLevel / 500})` }}></div>
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              {[...Array(20)].map((_, i) => {
                const barHeight = Math.max(10, audioLevel * (0.5 + Math.random() * 0.5));
                return (
                  <div key={i} className="w-2 bg-gradient-to-t from-primary to-secondary rounded-full transition-all duration-100" style={{ height: `${barHeight}%`, opacity: audioInitialized ? 0.7 : 0.2, transform: `scaleY(${audioInitialized ? 1 : 0.3})` }}></div>
                );
              })}
            </div>
            <div className="text-center z-10">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl transition-all duration-300" style={{ transform: `scale(${1 + audioLevel / 100})`, opacity: audioLevel / 100 }}></div>
                <div className="avatar relative">
                  <div className="w-40 h-40 rounded-full ring-4 ring-primary ring-offset-8 ring-offset-base-300 transition-all duration-300" style={{ boxShadow: `0 0 ${audioLevel}px rgba(var(--p), ${audioLevel / 100})` }}>
                    <img src={otherUser?.profilePic || "/avatar.png"} alt={otherUser?.fullName} />
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">{otherUser?.fullName}</h2>
              <p className="text-lg text-base-content/70 mb-4">{formatDuration(callDuration)}</p>
            </div>
            <audio ref={remoteVideoRef} autoPlay playsInline className="hidden" />
          </div>
        )}
      </div>

      <div className="p-3 sm:p-6 bg-gradient-to-t from-black/70 via-black/50 to-transparent backdrop-blur-md">
        <div className="flex justify-center items-center gap-3 sm:gap-6">
          <div className="relative group">
            <button onClick={toggleMute} className={`btn btn-circle btn-md sm:btn-lg shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 ${isMuted ? "btn-error animate-pulse" : "bg-white/20 hover:bg-white/30 border-white/30 text-white"}`}>
              {isMuted ? <MicOff size={20} className="sm:w-7 sm:h-7" /> : <Mic size={20} className="sm:w-7 sm:h-7" />}
            </button>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {isMuted ? "Unmute" : "Mute"}
            </div>
          </div>

          {isVideo && (
            <div className="relative group">
              <button onClick={toggleVideo} className={`btn btn-circle btn-md sm:btn-lg shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 ${isVideoOff ? "btn-error animate-pulse" : "bg-white/20 hover:bg-white/30 border-white/30 text-white"}`}>
                {isVideoOff ? <VideoOff size={20} className="sm:w-7 sm:h-7" /> : <Video size={20} className="sm:w-7 sm:h-7" />}
              </button>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {isVideoOff ? "Turn on camera" : "Turn off camera"}
              </div>
            </div>
          )}

          <div className="relative group">
            <button onClick={() => endCall(socket, otherUser?._id)} className="btn btn-circle btn-md sm:btn-lg btn-error shadow-2xl hover:scale-110 hover:rotate-12 active:scale-95 transition-all duration-200">
              <PhoneOff size={20} className="sm:w-7 sm:h-7" />
            </button>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              End call
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
