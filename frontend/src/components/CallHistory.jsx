import { useEffect } from "react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
import { formatMessageTime } from "../lib/utils";

const CallHistory = () => {
  const { callHistory, getCallHistory } = useCallStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    getCallHistory();
  }, [getCallHistory]);

  const getCallIcon = (call) => {
    const isIncoming = call.receiverId._id === authUser._id;
    const Icon = call.type === "video" ? Video : Phone;
    
    if (call.status === "missed") {
      return <PhoneMissed className="text-error" size={20} />;
    }
    return isIncoming ? (
      <PhoneIncoming className="text-success" size={20} />
    ) : (
      <PhoneOutgoing className="text-info" size={20} />
    );
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "Not connected";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Call History</h2>
      <div className="space-y-2">
        {callHistory.length === 0 ? (
          <p className="text-center text-base-content/70 py-8">No call history</p>
        ) : (
          callHistory.map((call) => {
            const otherUser =
              call.callerId._id === authUser._id
                ? call.receiverId
                : call.callerId;

            return (
              <div
                key={call._id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <img
                      src={otherUser.profilePic || "/avatar.png"}
                      alt={otherUser.fullName}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{otherUser.fullName}</h3>
                  <p className="text-sm text-base-content/70">
                    {formatMessageTime(call.createdAt)} • {formatDuration(call.duration)}
                  </p>
                </div>
                <div>{getCallIcon(call)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CallHistory;
