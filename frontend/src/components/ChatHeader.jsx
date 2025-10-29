import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { getLastSeen } from "../lib/timeUtils";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-4 border-b border-base-300/50 glass-effect shadow-md relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="size-12 rounded-full relative ring-2 ring-primary/30 shadow-lg hover:scale-110 hover:ring-primary/50 transition-all duration-300">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} className="rounded-full" />
              {onlineUsers.includes(selectedUser._id) && (
                <span className="absolute bottom-0 right-0 size-3.5 bg-gradient-to-br from-green-400 to-green-500 rounded-full ring-2 ring-base-100 animate-pulse shadow-lg shadow-green-500/50"></span>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg bg-gradient-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">{selectedUser.fullName}</h3>
            <p className="text-sm flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${onlineUsers.includes(selectedUser._id) ? "bg-gradient-to-r from-green-400 to-green-500 shadow-sm shadow-green-500/50" : "bg-gray-400"}`}></span>
              <span className={onlineUsers.includes(selectedUser._id) ? "text-green-600 font-semibold" : "text-base-content/60"}>
                {onlineUsers.includes(selectedUser._id) ? "Online" : `Last seen ${getLastSeen(selectedUser.updatedAt)}`}
              </span>
            </p>
          </div>
        </div>

        <button 
          onClick={() => setSelectedUser(null)}
          className="btn btn-sm btn-circle btn-ghost hover:bg-error/10 hover:text-error transition-all hover:rotate-90 hover:scale-110 shadow-md hover:shadow-lg"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;