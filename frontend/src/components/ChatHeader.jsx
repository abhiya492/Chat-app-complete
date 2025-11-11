import { X, Search, Pin } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";

const ChatHeader = ({ onSearchClick, onPinnedClick }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onSearchClick}
            className="btn btn-ghost btn-sm btn-circle"
            title="Search messages"
          >
            <Search size={18} />
          </button>
          <button 
            onClick={onPinnedClick}
            className="btn btn-ghost btn-sm btn-circle"
            title="Pinned messages"
          >
            <Pin size={18} />
          </button>
          <button 
            onClick={() => setSelectedUser(null)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;