import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { getLastSeen } from "../lib/timeUtils";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-4 border-b border-base-300/50 bg-base-100/80 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-12 rounded-full relative ring-2 ring-primary/20">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
              {onlineUsers.includes(selectedUser._id) && (
                <span className="absolute bottom-0 right-0 size-3.5 bg-green-500 rounded-full ring-2 ring-base-100 animate-pulse"></span>
              )}
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-bold text-lg">{selectedUser.fullName}</h3>
            <p className="text-sm flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${onlineUsers.includes(selectedUser._id) ? "bg-green-500" : "bg-gray-400"}`}></span>
              <span className={onlineUsers.includes(selectedUser._id) ? "text-green-600 font-medium" : "text-base-content/60"}>
                {onlineUsers.includes(selectedUser._id) ? "Online" : `Last seen ${getLastSeen(selectedUser.updatedAt)}`}
              </span>
            </p>
          </div>
        </div>

        {/* Close button */}
        <button 
          onClick={() => setSelectedUser(null)}
          className="btn btn-sm btn-circle btn-ghost hover:bg-error/10 hover:text-error transition-all hover:rotate-90"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;