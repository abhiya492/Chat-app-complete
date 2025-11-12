import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { UserX, Unlock } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const BlockedUsers = () => {
  const { authUser } = useAuthStore();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/messages/users");
      setAllUsers(res.data);
      const blocked = res.data.filter(user => 
        authUser.blockedUsers?.includes(user._id)
      );
      setBlockedUsers(blocked);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await axiosInstance.post(`/auth/unblock/${userId}`);
      setBlockedUsers(blockedUsers.filter(u => u._id !== userId));
      toast.success("User unblocked");
    } catch (error) {
      toast.error("Failed to unblock user");
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <UserX size={20} className="text-primary" />
        Blocked Users
      </h3>

      {blockedUsers.length === 0 ? (
        <p className="text-center text-base-content/60 py-8">No blocked users</p>
      ) : (
        <div className="space-y-2">
          {blockedUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-base-content/60">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleUnblock(user._id)}
                className="btn btn-sm btn-ghost gap-2"
              >
                <Unlock size={16} />
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockedUsers;
