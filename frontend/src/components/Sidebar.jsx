import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserPlus } from "lucide-react";
import InviteModal from "./InviteModal";
import SearchBar from "./SearchBar";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOnline = showOnlineOnly ? onlineUsers.includes(user._id) : true;
      return matchesSearch && matchesOnline;
    });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 md:w-24 lg:w-80 border-r border-base-300/50 flex flex-col transition-all duration-200 bg-gradient-to-b from-base-100/80 via-base-100/60 to-base-100/80 backdrop-blur-xl flex-shrink-0 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      <div className="border-b border-base-300/50 w-full p-2 md:p-3 lg:p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative z-10">
        <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-between lg:gap-3">
          <div className="flex items-center gap-2 lg:gap-3 justify-center lg:justify-start">
            <div className="p-1.5 md:p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-md hover:shadow-lg hover:scale-105 transition-all">
              <Users className="size-4 md:size-5 text-primary" />
            </div>
            <span className="font-bold text-base lg:text-lg hidden lg:block bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">Contacts</span>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-xs md:btn-sm btn-circle btn-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 hover:scale-110 hover:rotate-12 transition-all mt-1 lg:mt-0"
            title="Invite Friends"
          >
            <UserPlus className="size-3 md:size-4" />
          </button>
        </div>
        <div className="mt-3 lg:mt-4 hidden lg:flex items-center justify-between gap-2 glass-effect p-3 rounded-xl hover:border-primary/30 transition-all">
          <label className="cursor-pointer flex items-center gap-2 flex-1">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary"
            />
            <span className="text-sm font-medium">Online only</span>
          </label>
          <span className="text-xs font-bold text-primary-content bg-gradient-to-r from-primary to-primary/80 px-2.5 py-1 rounded-full shadow-md animate-pulse">{onlineUsers.length - 1}</span>
        </div>
      </div>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="overflow-y-auto w-full py-1 md:py-2 flex-1">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-2 md:p-3 lg:p-4 flex items-center justify-center lg:justify-start gap-3 mx-1 md:mx-2 lg:mx-3 my-1 rounded-xl
              hover:bg-primary/10 hover:shadow-md hover:scale-[1.02] transition-all duration-200 group
              ${selectedUser?._id === user._id ? "bg-gradient-to-r from-primary/20 via-primary/15 to-primary/10 shadow-lg lg:border-l-4 border-primary scale-[1.02]" : ""}
            `}
          >
            <div className="relative flex-shrink-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-11 md:size-12 lg:size-14 object-cover rounded-full ring-2 ring-base-300 group-hover:ring-primary/60 group-hover:scale-110 transition-all duration-300 shadow-md"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-2.5 md:size-3 lg:size-3.5 bg-gradient-to-br from-green-400 to-green-500 
                  rounded-full ring-2 ring-base-100 animate-pulse shadow-lg shadow-green-500/50"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:flex text-left min-w-0 flex-1 items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate text-base flex items-center gap-2">
                  {user.fullName}
                  {Math.random() > 0.8 && (
                    <span className="badge badge-xs badge-primary">New</span>
                  )}
                </div>
                <div className="text-sm flex items-center gap-1.5 mt-0.5">
                  <span className={`size-2 rounded-full ${onlineUsers.includes(user._id) ? "bg-green-500" : "bg-gray-400"}`}></span>
                  <span className={onlineUsers.includes(user._id) ? "text-green-600 font-medium" : "text-base-content/60"}>
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Unread badge - visible on all screens */}
            {selectedUser?._id !== user._id && Math.random() > 0.7 && (
              <div className="badge badge-primary badge-sm lg:badge-md font-bold shadow-md shadow-primary/30 animate-bounce-subtle">3</div>
            )}
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-base-content/60 py-12 px-2 md:px-4 animate-fade-in">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center animate-bounce-subtle">
              <Users className="size-8 md:size-10 text-primary/50" />
            </div>
            <p className="font-semibold text-sm md:text-base lg:text-lg mb-2">No contacts found</p>
            <p className="text-xs md:text-sm text-base-content/40 hidden lg:block">Try adjusting your search</p>
          </div>
        )}
      </div>

      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </aside>
  );
};
export default Sidebar;