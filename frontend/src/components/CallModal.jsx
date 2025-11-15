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

  const isVideo = activeCall?.type === "video";
  const otherUser =
    activeCall?.callerId?._id === authUser?._id
      ? activeCall?.receiverId
      : activeCall?.callerId;

  useEffect(() => {
    if (!isCallActive || !webrtcService) return;

    // Set local stream
    if (webrtcService.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = webrtcService.localStream;
      console.log('🎥 Local stream set');
    }

    // Set callback for remote stream
    webrtcService.setOnRemoteStream((stream) => {
      console.log('📹 Remote stream callback triggered');
      console.log('🎵 Audio tracks:', stream.getAudioTracks().length);
      console.log('📹 Video tracks:', stream.getVideoTracks().length);
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.volume = 1.0; // Ensure full volume
        remoteVideoRef.current.muted = false; // Explicitly unmute
        setRemoteStreamReady(true);
        
        // Ensure audio plays (handle autoplay policy)
        remoteVideoRef.current.play().then(() => {
          console.log('✅ Remote stream playing successfully');
          setAudioInitialized(true);
        }).catch(err => {
          console.error('❌ Failed to play remote stream:', err);
          // Try to play again on user interaction
          const playOnClick = () => {
            remoteVideoRef.current?.play().then(() => {
              console.log('✅ Remote stream playing after user interaction');
              setAudioInitialized(true);
            }).catch(console.error);
          };
          document.addEventListener('click', playOnClick, { once: true });
        });
        
        // Log audio track status
        stream.getAudioTracks().forEach(track => {
          console.log(`🎤 Remote audio track: ${track.label}, enabled: ${track.enabled}, muted: ${track.muted}, readyState: ${track.readyState}`);
        });
      }
    });

    // Check if remote stream already exists
    if (webrtcService.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = webrtcService.remoteStream;
      remoteVideoRef.current.volume = 1.0;
      remoteVideoRef.current.muted = false;
      setRemoteStreamReady(true);
      remoteVideoRef.current.play().then(() => {
        setAudioInitialized(true);
      }).catch(console.error);
    }

    // Cleanup on unmount
    return () => {
      console.log('🧹 CallModal unmounting, cleaning up streams');
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
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
    <div className="fixed inset-0 z-50 bg-base-300 flex flex-col">
      <div className="flex-1 relative">
        {isVideo ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={false}
              className="w-full h-full object-cover"
            />
            {!isVideoOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute top-4 right-4 w-32 h-24 rounded-lg border-2 border-base-100 object-cover"
              />
            ) : (
              <div className="absolute top-4 right-4 w-32 h-24 rounded-lg border-2 border-base-100 bg-base-300 flex items-center justify-center">
                <VideoOff size={32} className="text-base-content/50" />
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="avatar mb-4">
                <div className="w-32 rounded-full">
                  <img
                    src={otherUser?.profilePic || "/avatar.png"}
                    alt={otherUser?.fullName}
                  />
                </div>
              </div>
              <h2 className="text-2xl font-semibold">{otherUser?.fullName}</h2>
              <p className="text-base-content/70 mt-2">{formatDuration(callDuration)}</p>
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

      <div className="p-6 bg-base-200 flex justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`btn btn-circle btn-lg ${isMuted ? "btn-error" : "btn-ghost"}`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {isVideo && (
          <button
            onClick={toggleVideo}
            className={`btn btn-circle btn-lg ${isVideoOff ? "btn-error" : "btn-ghost"}`}
            title={isVideoOff ? "Turn on video" : "Turn off video"}
          >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
        )}

        <button
          onClick={handleEndCall}
          className="btn btn-circle btn-lg btn-error"
          title="End call"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export default CallModal;
