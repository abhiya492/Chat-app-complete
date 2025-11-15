import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import UserSkeleton from "./UserSkeleton";
import { Users, UserPlus, Phone } from "lucide-react";
import InviteModal from "./InviteModal";
import SearchBar from "./SearchBar";
import CallHistory from "./CallHistory";
import { useTranslation } from "react-i18next";

const Sidebar = () => {
  const { t } = useTranslation();
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chats");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOnline = showOnlineOnly ? onlineUsers.includes(user._id) : true;
      return matchesSearch && matchesOnline;
    });

  if (isUsersLoading) return (
    <aside className="h-full w-full sm:w-20 md:w-24 lg:w-80 border-r border-base-300/50 flex flex-col">
      <div className="border-b border-base-300/50 p-5">
        <div className="h-8 bg-base-300 rounded animate-pulse w-32" />
      </div>
      <UserSkeleton />
    </aside>
  );

  return (
    <aside className="h-full w-full sm:w-20 md:w-24 lg:w-80 border-r border-base-300/50 flex flex-col transition-all duration-200 bg-gradient-to-b from-base-100/80 via-base-100/60 to-base-100/80 backdrop-blur-xl flex-shrink-0 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      <div className="border-b border-base-300/50 w-full p-2 sm:p-2 md:p-3 lg:p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative z-10">
        <div className="flex flex-row items-center justify-between gap-2 sm:flex-col lg:flex-row lg:gap-3">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="p-1.5 md:p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-md hover:shadow-lg hover:scale-105 transition-all">
              {activeTab === "chats" ? <Users className="size-4 md:size-5 text-primary" /> : <Phone className="size-4 md:size-5 text-primary" />}
            </div>
            <span className="font-bold text-sm sm:hidden lg:block lg:text-lg bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">{activeTab === "chats" ? t('chats') : t('calls')}</span>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-xs sm:btn-xs md:btn-sm btn-circle btn-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 hover:scale-110 hover:rotate-12 transition-all"
            title="Invite Friends"
          >
            <UserPlus className="size-3 md:size-4" />
          </button>
        </div>
        <div className="mt-2 sm:mt-3 flex gap-1 sm:gap-2 justify-center sm:justify-center lg:justify-start">
          <button
            onClick={() => setActiveTab("chats")}
            className={`btn btn-xs sm:btn-xs lg:btn-sm ${activeTab === "chats" ? "btn-primary" : "btn-ghost"}`}
          >
            <Users className="size-3 lg:size-4" />
            <span className="hidden sm:hidden lg:inline">{t('chats')}</span>
          </button>
          <button
            onClick={() => setActiveTab("calls")}
            className={`btn btn-xs sm:btn-xs lg:btn-sm ${activeTab === "calls" ? "btn-primary" : "btn-ghost"}`}
          >
            <Phone className="size-3 lg:size-4" />
            <span className="hidden sm:hidden lg:inline">{t('calls')}</span>
          </button>
        </div>
        {activeTab === "chats" && (
          <div className="mt-2 sm:mt-3 lg:mt-4 flex items-center justify-between gap-2 glass-effect p-2 sm:p-3 rounded-xl hover:border-primary/30 transition-all">
          <label className="cursor-pointer flex items-center gap-1 sm:gap-2 flex-1">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-xs sm:checkbox-sm checkbox-primary"
            />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">{t('online')}</span>
            <span className="text-xs font-medium sm:hidden">Online</span>
          </label>
          <span className="text-[10px] sm:text-xs font-bold text-primary-content bg-gradient-to-r from-primary to-primary/80 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md animate-pulse">{onlineUsers.length - 1}</span>
          </div>
        )}
      </div>

      {activeTab === "chats" && <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}

      <div className="overflow-y-auto w-full py-1 md:py-2 flex-1">
        {activeTab === "calls" ? (
          <div className="hidden lg:block">
            <CallHistory />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center text-base-content/60 py-8 sm:py-12 px-2 md:px-4 animate-fade-in">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center animate-bounce-subtle">
              <Users className="size-8 md:size-10 text-primary/50" />
            </div>
            <p className="font-semibold text-sm md:text-base lg:text-lg mb-2">{t('search')}</p>
            <p className="text-xs md:text-sm text-base-content/40 hidden sm:hidden lg:block">{t('search')}</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 sm:p-2 md:p-3 lg:p-4 flex items-center justify-start sm:justify-center lg:justify-start gap-3 mx-1 sm:mx-1 md:mx-2 lg:mx-3 my-1 rounded-xl
              hover:bg-primary/10 hover:shadow-md hover:scale-[1.02] transition-all duration-200 group
              ${selectedUser?._id === user._id ? "bg-gradient-to-r from-primary/20 via-primary/15 to-primary/10 shadow-lg border-l-4 sm:border-l-0 lg:border-l-4 border-primary scale-[1.02]" : ""}
            `}
          >
            <div className="relative flex-shrink-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 sm:size-11 md:size-12 lg:size-14 object-cover rounded-full ring-2 ring-base-300 group-hover:ring-primary/60 group-hover:scale-110 transition-all duration-300 shadow-md"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 sm:size-2.5 md:size-3 lg:size-3.5 bg-gradient-to-br from-green-400 to-green-500 
                  rounded-full ring-2 ring-base-100 animate-pulse shadow-lg shadow-green-500/50"
                />
              )}
            </div>

            {/* User info - visible on mobile and large screens, hidden on sm/md */}
            <div className="flex sm:hidden lg:flex text-left min-w-0 flex-1 items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate text-sm lg:text-base flex items-center gap-2">
                  {user.fullName}
                  {Math.random() > 0.8 && (
                    <span className="badge badge-xs badge-primary">New</span>
                  )}
                </div>
                <div className="text-xs lg:text-sm flex items-center gap-1.5 mt-0.5">
                  <span className={`size-2 rounded-full ${onlineUsers.includes(user._id) ? "bg-green-500" : "bg-gray-400"}`}></span>
                  <span className={onlineUsers.includes(user._id) ? "text-green-600 font-medium" : "text-base-content/60"}>
                    {onlineUsers.includes(user._id) ? t('online') : t('offline')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Unread badge - visible on all screens */}
            {selectedUser?._id !== user._id && Math.random() > 0.7 && (
              <div className="badge badge-primary badge-xs sm:badge-sm lg:badge-md font-bold shadow-md shadow-primary/30 animate-bounce-subtle">3</div>
            )}
          </button>
          ))
        )}
      </div>

      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </aside>
  );
};
export default Sidebar;