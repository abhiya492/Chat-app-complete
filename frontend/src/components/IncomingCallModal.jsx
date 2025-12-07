import { useEffect, useState } from "react";
import { Phone, PhoneOff, Video, Mic } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";

const IncomingCallModal = () => {
  const { incomingCall, acceptCall, rejectCall } = useCallStore();
  const { socket } = useAuthStore();
  const [particles, setParticles] = useState([]);

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

  if (!incomingCall) return null;

  const caller = incomingCall.callerId;
  const isVideo = incomingCall.type === "video";

  const handleAccept = async () => {
    console.log('🎯 Accept button clicked');
    console.log('📞 Incoming call:', incomingCall);
    console.log('🔌 Socket:', socket);
    
    try {
      const result = await acceptCall(incomingCall, socket);
      console.log('✅ Accept call result:', result);
    } catch (error) {
      console.error("❌ Failed to accept call:", error);
    }
  };

  const handleReject = () => {
    console.log('❌ Reject button clicked');
    rejectCall(incomingCall._id);
    socket.emit("call:end", { to: caller._id, callId: incomingCall._id });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-base-300 via-base-200 to-base-300 flex items-center justify-center overflow-hidden backdrop-blur-sm">
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-primary/20"
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

      <div className="relative z-10 max-w-md w-full mx-4 animate-in zoom-in fade-in duration-500">
        {/* Main card */}
        <div className="bg-base-100 rounded-3xl p-8 sm:p-10 shadow-2xl border border-base-300">
          {/* Call type badge */}
          <div className="flex justify-center mb-6">
            <div className="badge badge-lg badge-primary gap-2 px-6 py-4">
              {isVideo ? <Video size={18} className="animate-pulse" /> : <Mic size={18} className="animate-pulse" />}
              <span className="font-semibold uppercase tracking-wide">
                Incoming {isVideo ? "Video" : "Voice"} Call
              </span>
            </div>
          </div>

          {/* Avatar with pulsing rings */}
          <div className="relative flex justify-center mb-6">
            <div className="relative">
              {/* Pulsing rings */}
              {[1, 2, 3].map((ring) => (
                <div
                  key={ring}
                  className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"
                  style={{
                    animationDuration: `${2 + ring * 0.5}s`,
                    animationDelay: `${ring * 0.3}s`,
                  }}
                />
              ))}
              
              {/* Avatar */}
              <div className="avatar relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-base-100 shadow-xl">
                  <img 
                    src={caller?.profilePic || "/avatar.png"} 
                    alt={caller?.fullName}
                  />
                </div>
                
                {/* Online indicator */}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-success rounded-full border-4 border-base-100 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Caller info */}
          <div className="text-center mb-8 space-y-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {caller?.fullName}
            </h2>
            
            {/* Ringing indicator */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-base-content/70 font-medium">Ringing...</span>
            </div>

            {/* Connection quality */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 border border-success/30">
              <div className="flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-success rounded-full"
                    style={{ height: `${(i + 1) * 4}px` }}
                  />
                ))}
              </div>
              <span className="text-success text-sm font-medium">Good Connection</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-6">
            {/* Reject button */}
            <div className="relative group">
              <button
                onClick={handleReject}
                className="btn btn-circle btn-lg sm:w-20 sm:h-20 bg-error hover:bg-error/80 border-none shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
              >
                <PhoneOff size={28} className="text-white" />
              </button>
              
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-base-100 border border-base-300 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-lg">
                Decline
              </div>
              
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-base-content/60 text-xs font-medium">
                Decline
              </span>
            </div>

            {/* Accept button */}
            <div className="relative group">
              <button
                onClick={handleAccept}
                type="button"
                className="btn btn-circle btn-lg sm:w-20 sm:h-20 bg-success hover:bg-success/80 border-none shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse"
              >
                <Phone size={28} className="text-white" />
              </button>
              
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border-4 border-success animate-ping opacity-30 pointer-events-none" />
              
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-base-100 border border-base-300 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-lg">
                Accept
              </div>
              
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-base-content/60 text-xs font-medium">
                Accept
              </span>
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="mt-4 text-center">
          <p className="text-base-content/50 text-sm">
            Audio and video settings can be changed during the call
          </p>
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

export default IncomingCallModal;
