import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserPlus } from "lucide-react";
import InviteModal from "./InviteModal";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300/50 flex flex-col transition-all duration-200 bg-base-100/50 backdrop-blur-sm">
      <div className="border-b border-base-300/50 w-full p-5 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <span className="font-bold text-lg hidden lg:block">Contacts</span>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-sm btn-circle btn-primary shadow-md hover:shadow-lg hover:scale-110 transition-all"
            title="Invite Friends"
          >
            <UserPlus className="size-4" />
          </button>
        </div>
        <div className="mt-4 hidden lg:flex items-center justify-between gap-2 bg-base-100/80 p-3 rounded-xl border border-base-300/50">
          <label className="cursor-pointer flex items-center gap-2 flex-1">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary"
            />
            <span className="text-sm font-medium">Online only</span>
          </label>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">{onlineUsers.length - 1}</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-2">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 lg:p-4 flex items-center gap-3 mx-2 lg:mx-3 my-1 rounded-xl
              hover:bg-primary/10 transition-all duration-200 hover:scale-[1.02] group
              ${selectedUser?._id === user._id ? "bg-gradient-to-r from-primary/20 to-primary/10 shadow-md border-l-4 border-primary" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 lg:size-14 object-cover rounded-full ring-2 ring-base-300 group-hover:ring-primary/50 transition-all"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3.5 bg-green-500 
                  rounded-full ring-2 ring-base-100 animate-pulse"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="font-semibold truncate text-base">{user.fullName}</div>
              <div className="text-sm flex items-center gap-1.5 mt-0.5">
                <span className={`size-2 rounded-full ${onlineUsers.includes(user._id) ? "bg-green-500" : "bg-gray-400"}`}></span>
                <span className={onlineUsers.includes(user._id) ? "text-green-600 font-medium" : "text-base-content/60"}>
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-base-content/60 py-8 px-4">
            <Users className="size-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No online users</p>
          </div>
        )}
      </div>

      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </aside>
  );
};
export default Sidebar;