import { Phone, PhoneOff } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";

const IncomingCallModal = () => {
  const { incomingCall, acceptCall, rejectCall } = useCallStore();
  const { socket } = useAuthStore();

  if (!incomingCall) return null;

  const caller = incomingCall.callerId;

  const handleAccept = async () => {
    try {
      const { localStream } = await acceptCall(incomingCall, socket);
      // Answer will be sent via socket in the store
    } catch (error) {
      console.error("Failed to accept call:", error);
    }
  };

  const handleReject = () => {
    rejectCall(incomingCall._id);
    socket.emit("call:end", { to: caller._id, callId: incomingCall._id });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl animate-in zoom-in duration-500">
        {/* Animated rings around avatar */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
          <div className="avatar relative">
            <div className="w-28 h-28 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-base-100 shadow-xl">
              <img src={caller?.profilePic || "/avatar.png"} alt={caller?.fullName} />
            </div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {caller?.fullName}
        </h3>
        <p className="text-base-content/70 mb-2 text-lg">
          Incoming {incomingCall.type} call...
        </p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
          <span className="text-sm text-base-content/60">Ringing...</span>
        </div>

        <div className="flex gap-6 justify-center">
          <button
            onClick={handleReject}
            className="btn btn-circle btn-lg btn-error shadow-xl hover:scale-110 hover:rotate-12 transition-all"
            title="Reject"
          >
            <PhoneOff size={28} />
          </button>
          <button
            onClick={handleAccept}
            className="btn btn-circle btn-lg btn-success shadow-xl hover:scale-110 animate-pulse transition-all"
            title="Accept"
          >
            <Phone size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
