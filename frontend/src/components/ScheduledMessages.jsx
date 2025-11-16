import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Clock, Trash2 } from "lucide-react";

const ScheduledMessages = () => {
  const { scheduledMessages, getScheduledMessages, cancelScheduledMessage, showScheduled, setShowScheduled } = useChatStore();

  useEffect(() => {
    if (showScheduled) {
      getScheduledMessages();
    }
  }, [showScheduled, getScheduledMessages]);

  if (!showScheduled) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <Clock className="size-5" />
            <h2 className="text-lg font-semibold">Scheduled Messages</h2>
          </div>
          <button onClick={() => setShowScheduled(false)} className="btn btn-ghost btn-sm btn-circle">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {scheduledMessages.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              <Clock className="size-12 mx-auto mb-2 opacity-50" />
              <p>No scheduled messages</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledMessages.map((msg) => (
                <div key={msg._id} className="bg-base-200 rounded-lg p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={msg.receiverId.profilePic || "/avatar.png"}
                        alt={msg.receiverId.fullName}
                        className="size-6 rounded-full"
                      />
                      <span className="font-medium text-sm">{msg.receiverId.fullName}</span>
                    </div>
                    <p className="text-sm text-base-content/80 mb-2 break-words">
                      {msg.text || "Media message"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-base-content/60">
                      <Clock className="size-3" />
                      <span>{new Date(msg.scheduledFor).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => cancelScheduledMessage(msg._id)}
                    className="btn btn-ghost btn-sm btn-circle text-error"
                    title="Cancel"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduledMessages;
