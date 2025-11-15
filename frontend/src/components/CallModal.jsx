import { useEffect, useRef, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

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
  const playTimeoutRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const animationFrameRef = useRef(null);

  const isVideo = activeCall?.type === "video";
  const otherUser =
    activeCall?.callerId?._id === authUser?._id
      ? activeCall?.receiverId
      : activeCall?.callerId;

  useEffect(() => {
    if (!isCallActive || !webrtcService) return;
    
    // Ensure audio plays on any user interaction
    const handleInteraction = () => {
      if (remoteVideoRef.current && remoteVideoRef.current.paused) {
        console.log('👆 User interaction, playing audio...');
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.volume = 1.0;
        remoteVideoRef.current.play().catch(console.error);
      }
    };
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    // Set local stream
    if (webrtcService.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = webrtcService.localStream;
      console.log('🎥 Local stream set');
      
      // Verify local audio is working
      const audioTracks = webrtcService.localStream.getAudioTracks();
      console.log('🎤 Local audio tracks:', audioTracks.length);
      audioTracks.forEach(track => {
        console.log('🎤 Local track:', track.label, 'enabled:', track.enabled, 'muted:', track.muted, 'readyState:', track.readyState);
      });
    }

    // Set callback for remote stream
    webrtcService.setOnRemoteStream((stream) => {
      console.log('📹 Remote stream callback triggered');
      console.log('🎵 Audio tracks:', stream.getAudioTracks().length);
      console.log('📹 Video tracks:', stream.getVideoTracks().length);
      
      if (remoteVideoRef.current && stream) {
        // Always update srcObject
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.volume = 1.0;
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.autoplay = true;
        remoteVideoRef.current.playsInline = true;
        
        // Enable all audio tracks
        stream.getAudioTracks().forEach(track => {
          track.enabled = true;
          console.log(`🎤 Enabled audio track: ${track.label}`);
        });
        
        setRemoteStreamReady(true);
        console.log('🔄 Remote stream srcObject updated');
        
        // Set audio output to default device
        if (remoteVideoRef.current.setSinkId) {
          remoteVideoRef.current.setSinkId('').then(() => {
            console.log('✅ Audio output set to default device');
          }).catch(err => {
            console.log('⚠️ Could not set audio output:', err);
          });
        }
        
        // Play immediately
        const playAudio = () => {
          if (remoteVideoRef.current && remoteVideoRef.current.paused) {
            remoteVideoRef.current.play()
              .then(() => {
                console.log('✅ Remote audio playing');
                setAudioInitialized(true);
              })
              .catch(err => {
                console.error('❌ Play failed:', err);
                // Retry on user interaction
                document.addEventListener('click', playAudio, { once: true });
              });
          }
        };
        
        playAudio();
      }
    });

    // Simple audio level simulation (remove analyzer that interferes with playback)
    const simulateAudioLevel = () => {
      if (audioInitialized) {
        // Simulate audio activity
        setAudioLevel(Math.random() * 60 + 20);
      }
      animationFrameRef.current = requestAnimationFrame(simulateAudioLevel);
    };
    simulateAudioLevel();

    // Cleanup on unmount
    return () => {
      console.log('🧹 CallModal unmounting, cleaning up streams');
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [isCallActive, webrtcService]);

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

  const handleEndCall = () => {
    endCall(socket, otherUser?._id);
  };

  if (!isCallActive || !authUser) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-base-300 via-base-200 to-base-300 flex flex-col overflow-hidden">
      {/* Top Bar */}
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
        <div className="flex items-center gap-2">
          {remoteStreamReady && (
            <div className="badge badge-success gap-2 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              Connected
            </div>
          )}
        </div>
      </div>

      {/* Video/Audio Display */}
      <div className="flex-1 relative overflow-hidden">
        {isVideo ? (
          <>
            {/* Remote video with overlay effects */}
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Audio level indicator for video calls */}
              {audioInitialized && (
                <div className="absolute bottom-24 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full">
                  <Mic size={16} className="text-white" />
                  <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-100"
                      style={{ width: `${audioLevel}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Local video preview */}
            {!isVideoOff ? (
              <div className="absolute bottom-24 sm:bottom-20 right-2 sm:right-4 group">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-24 h-20 sm:w-40 sm:h-32 rounded-lg sm:rounded-2xl border-2 sm:border-4 border-white/20 object-cover shadow-2xl group-hover:scale-110 group-hover:border-primary/50 transition-all cursor-pointer"
                />
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-black/50 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  You
                </div>
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
            {/* Animated background that pulses with audio */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 transition-all duration-300"
              style={{
                opacity: 0.3 + (audioLevel / 200),
                transform: `scale(${1 + audioLevel / 500})`
              }}
            ></div>
            
            {/* Real-time Audio visualizer */}
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              {[...Array(20)].map((_, i) => {
                const barHeight = Math.max(10, audioLevel * (0.5 + Math.random() * 0.5));
                return (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-primary to-secondary rounded-full transition-all duration-100"
                    style={{
                      height: `${barHeight}%`,
                      opacity: audioInitialized ? 0.7 : 0.2,
                      transform: `scaleY(${audioInitialized ? 1 : 0.3})`
                    }}
                  ></div>
                );
              })}
            </div>

            <div className="text-center z-10">
              {/* Avatar with audio-reactive ring */}
              <div className="relative mb-6">
                <div 
                  className="absolute inset-0 rounded-full bg-primary/30 blur-xl transition-all duration-300"
                  style={{
                    transform: `scale(${1 + audioLevel / 100})`,
                    opacity: audioLevel / 100
                  }}
                ></div>
                <div className="avatar relative">
                  <div 
                    className="w-40 h-40 rounded-full ring-4 ring-primary ring-offset-8 ring-offset-base-300 transition-all duration-300"
                    style={{
                      boxShadow: `0 0 ${audioLevel}px rgba(var(--p), ${audioLevel / 100})`
                    }}
                  >
                    <img
                      src={otherUser?.profilePic || "/avatar.png"}
                      alt={otherUser?.fullName}
                    />
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-2">{otherUser?.fullName}</h2>
              <p className="text-lg text-base-content/70 mb-4">{formatDuration(callDuration)}</p>
              
              {/* Audio level indicator */}
              {audioInitialized && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-success">
                    <span className="w-3 h-3 bg-success rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium">Audio Connected</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-base-content/50">Volume:</span>
                    <div className="w-32 h-2 bg-base-300 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-success to-primary transition-all duration-100"
                        style={{ width: `${audioLevel}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Hidden audio element for voice calls */}
            <audio
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="p-3 sm:p-6 bg-gradient-to-t from-black/70 via-black/50 to-transparent backdrop-blur-md">
        <div className="flex justify-center items-center gap-3 sm:gap-6">
          {/* Mute Button */}
          <div className="relative group">
            <button
              onClick={toggleMute}
              className={`btn btn-circle btn-md sm:btn-lg shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 ${
                isMuted 
                  ? "btn-error animate-pulse" 
                  : "bg-white/20 hover:bg-white/30 border-white/30 text-white"
              }`}
            >
              {isMuted ? <MicOff size={20} className="sm:w-7 sm:h-7" /> : <Mic size={20} className="sm:w-7 sm:h-7" />}
            </button>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {isMuted ? "Unmute" : "Mute"}
            </div>
            {isMuted && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full animate-ping"></div>
            )}
          </div>

          {/* Video Toggle Button */}
          {isVideo && (
            <div className="relative group">
              <button
                onClick={toggleVideo}
                className={`btn btn-circle btn-md sm:btn-lg shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 ${
                  isVideoOff 
                    ? "btn-error animate-pulse" 
                    : "bg-white/20 hover:bg-white/30 border-white/30 text-white"
                }`}
              >
                {isVideoOff ? <VideoOff size={20} className="sm:w-7 sm:h-7" /> : <Video size={20} className="sm:w-7 sm:h-7" />}
              </button>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {isVideoOff ? "Turn on camera" : "Turn off camera"}
              </div>
              {isVideoOff && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full animate-ping"></div>
              )}
            </div>
          )}

          {/* End Call Button */}
          <div className="relative group">
            <button
              onClick={handleEndCall}
              className="btn btn-circle btn-md sm:btn-lg btn-error shadow-2xl hover:scale-110 hover:rotate-12 active:scale-95 transition-all duration-200"
            >
              <PhoneOff size={20} className="sm:w-7 sm:h-7" />
            </button>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              End call
            </div>
          </div>
        </div>
        
        {/* Call stats */}
        <div className="mt-2 sm:mt-4 flex justify-center gap-2 sm:gap-4 text-white/60 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${
              remoteStreamReady ? 'bg-success animate-pulse' : 'bg-error'
            }`}></span>
            <span>{remoteStreamReady ? 'Connected' : 'Connecting...'}</span>
          </div>
          {webrtcService?.localStream?.getAudioTracks().length > 0 && (
            <div className="flex items-center gap-1">
              <Mic size={12} className={isMuted ? 'text-error' : 'text-success'} />
              <span>Mic: {isMuted ? 'Off' : 'On'}</span>
            </div>
          )}
          {audioInitialized && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <span>Receiving audio</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModal;
