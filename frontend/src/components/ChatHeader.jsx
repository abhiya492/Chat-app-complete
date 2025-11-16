import { X, Search, Pin, Phone, Video, MoreVertical, UserX, Info, Trash2 } from "lucide-react";
import UserInfoModal from "./UserInfoModal";
import CallQualityIndicator from "./CallQualityIndicator";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { useState } from "react";
import StreakBadge from "./StreakBadge";

const ChatHeader = ({ onSearchClick, onPinnedClick }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, socket, authUser, blockUser } = useAuthStore();
  const { initiateCall } = useCallStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showQualityCheck, setShowQualityCheck] = useState(false);
  const [pendingCallType, setPendingCallType] = useState(null);

  const handleCall = (type) => {
    setPendingCallType(type);
    setShowQualityCheck(true);
  };

  const proceedWithCall = async () => {
    setShowQualityCheck(false);
    try {
      await initiateCall(selectedUser._id, pendingCallType, socket);
    } catch (error) {
      console.error("Failed to initiate call:", error);
    }
    setPendingCallType(null);
  };

  const handleBlock = async () => {
    await blockUser(selectedUser._id);
    setSelectedUser(null);
    setShowMenu(false);
  };

  const handleDeleteChat = async () => {
    if (confirm('Delete all messages with this user? This cannot be undone.')) {
      await useChatStore.getState().deleteChat(selectedUser._id);
      setShowMenu(false);
    }
  };

  const isBlocked = authUser?.blockedUsers?.includes(selectedUser._id);

  return (
    <div className="p-2 sm:p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Back button - mobile only */}
          <button 
            onClick={() => setSelectedUser(null)}
            className="btn btn-ghost btn-xs btn-circle sm:hidden flex-shrink-0"
          >
            <X size={16} />
          </button>
          
          {/* Avatar */}
          <div className="avatar flex-shrink-0">
            <div className="size-9 sm:size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <h3 className="font-medium text-sm sm:text-base truncate">{selectedUser.fullName}</h3>
              <div className="hidden sm:block flex-shrink-0">
                <StreakBadge userId={selectedUser._id} />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button 
            onClick={() => handleCall("voice")}
            className="btn btn-ghost btn-xs sm:btn-sm btn-circle"
            title="Voice call"
          >
            <Phone size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button 
            onClick={() => handleCall("video")}
            className="btn btn-ghost btn-xs sm:btn-sm btn-circle"
            title="Video call"
          >
            <Video size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button 
            onClick={onSearchClick}
            className="hidden md:flex btn btn-ghost btn-sm btn-circle"
            title="Search messages"
          >
            <Search size={18} />
          </button>
          <button 
            onClick={onPinnedClick}
            className="hidden md:flex btn btn-ghost btn-sm btn-circle"
            title="Pinned messages"
          >
            <Pin size={18} />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="btn btn-ghost btn-xs sm:btn-sm btn-circle"
            >
              <MoreVertical size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-base-100 rounded-lg shadow-xl border border-base-300 z-50">
                <button
                  onClick={() => {
                    onSearchClick();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 md:hidden text-sm"
                >
                  <Search size={16} />
                  Search
                </button>
                <button
                  onClick={() => {
                    onPinnedClick();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 md:hidden text-sm"
                >
                  <Pin size={16} />
                  Pinned
                </button>
                <button
                  onClick={() => {
                    setShowUserInfo(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 text-sm"
                >
                  <Info size={16} />
                  User Info
                </button>
                <button
                  onClick={handleDeleteChat}
                  className="w-full px-3 sm:px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 text-error text-sm"
                >
                  <Trash2 size={16} />
                  Delete Chat
                </button>
                <button
                  onClick={handleBlock}
                  className="w-full px-3 sm:px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 text-error text-sm"
                >
                  <UserX size={16} />
                  {isBlocked ? "Unblock" : "Block"}
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSelectedUser(null)}
            className="hidden sm:flex btn btn-ghost btn-sm btn-circle"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      {showUserInfo && (
        <UserInfoModal user={selectedUser} onClose={() => setShowUserInfo(false)} />
      )}
      {showQualityCheck && (
        <CallQualityIndicator 
          onProceed={proceedWithCall} 
          onCancel={() => { setShowQualityCheck(false); setPendingCallType(null); }} 
        />
      )}
    </div>
  );
};
export default ChatHeader;