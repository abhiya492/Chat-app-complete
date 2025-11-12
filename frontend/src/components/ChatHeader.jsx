import { X, Search, Pin, Phone, Video, MoreVertical, UserX, Info } from "lucide-react";
import UserInfoModal from "./UserInfoModal";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { useState } from "react";

const ChatHeader = ({ onSearchClick, onPinnedClick }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, socket, authUser, blockUser } = useAuthStore();
  const { initiateCall } = useCallStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

  const handleCall = async (type) => {
    try {
      await initiateCall(selectedUser._id, type, socket);
    } catch (error) {
      console.error("Failed to initiate call:", error);
    }
  };

  const handleBlock = async () => {
    await blockUser(selectedUser._id);
    setSelectedUser(null);
    setShowMenu(false);
  };

  const isBlocked = authUser?.blockedUsers?.includes(selectedUser._id);

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
            onClick={() => handleCall("voice")}
            className="btn btn-ghost btn-sm btn-circle"
            title="Voice call"
          >
            <Phone size={18} />
          </button>
          <button 
            onClick={() => handleCall("video")}
            className="btn btn-ghost btn-sm btn-circle"
            title="Video call"
          >
            <Video size={18} />
          </button>
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
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-lg shadow-xl border border-base-300 z-50">
                <button
                  onClick={() => {
                    setShowUserInfo(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2"
                >
                  <Info size={16} />
                  User Info
                </button>
                <button
                  onClick={handleBlock}
                  className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 text-error"
                >
                  <UserX size={16} />
                  {isBlocked ? "Unblock User" : "Block User"}
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSelectedUser(null)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      {showUserInfo && (
        <UserInfoModal user={selectedUser} onClose={() => setShowUserInfo(false)} />
      )}
    </div>
  );
};
export default ChatHeader;