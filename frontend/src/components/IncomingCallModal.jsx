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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-base-100 rounded-lg p-8 max-w-sm w-full mx-4 text-center animate-in fade-in zoom-in duration-300">
        <div className="avatar mb-4">
          <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={caller?.profilePic || "/avatar.png"} alt={caller?.fullName} />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{caller?.fullName}</h3>
        <p className="text-base-content/70 mb-6">
          Incoming {incomingCall.type} call...
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReject}
            className="btn btn-circle btn-lg btn-error"
            title="Reject"
          >
            <PhoneOff size={24} />
          </button>
          <button
            onClick={handleAccept}
            className="btn btn-circle btn-lg btn-success"
            title="Accept"
          >
            <Phone size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
