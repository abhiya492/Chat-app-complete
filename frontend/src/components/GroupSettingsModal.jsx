import { useState, useEffect } from "react";
import { X, Users, Settings, Copy, Trash2, UserPlus, Crown, Shield, UserMinus } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const GroupSettingsModal = ({ group, onClose }) => {
  const { authUser } = useAuthStore();
  const { updateGroup, deleteGroup, addMember, removeMember, updateMemberRole } = useGroupStore();
  const [activeTab, setActiveTab] = useState("general");
  const [groupData, setGroupData] = useState({
    name: group.name,
    description: group.description,
    avatar: group.avatar,
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = group.admin._id === authUser._id;
  const userRole = group.members.find(m => m.user._id === authUser._id)?.role;

  const handleUpdateGroup = async () => {
    setIsLoading(true);
    try {
      await updateGroup(group._id, groupData);
      onClose();
    } catch (error) {
      console.error("Error updating group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      return;
    }
    
    setIsLoading(true);
    try {
      await deleteGroup(group._id);
      onClose();
    } catch (error) {
      console.error("Error deleting group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (group.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      toast.success("Invite code copied!");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      await removeMember(group._id, userId);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateMemberRole(group._id, userId, newRole);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-base-content/50" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-xl font-semibold">Group Settings</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-bordered px-6">
          <button
            className={`tab ${activeTab === "general" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={`tab ${activeTab === "members" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            Members ({group.members.length})
          </button>
          {isAdmin && (
            <button
              className={`tab ${activeTab === "danger" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("danger")}
            >
              Danger Zone
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "general" && (
            <div className="space-y-4">
              {/* Group Name */}
              <div>
                <label className="label">
                  <span className="label-text">Group Name</span>
                </label>
                <input
                  type="text"
                  value={groupData.name}
                  onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                  className="input input-bordered w-full"
                  disabled={!isAdmin && userRole !== "moderator"}
                />
              </div>

              {/* Description */}
              <div>
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={groupData.description}
                  onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                  className="textarea textarea-bordered w-full h-20"
                  disabled={!isAdmin && userRole !== "moderator"}
                />
              </div>

              {/* Invite Code */}
              {!group.settings.isPrivate && group.inviteCode && (
                <div>
                  <label className="label">
                    <span className="label-text">Invite Code</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={group.inviteCode}
                      className="input input-bordered flex-1"
                      readOnly
                    />
                    <button
                      onClick={handleCopyInviteCode}
                      className="btn btn-outline"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {(isAdmin || userRole === "moderator") && (
                <button
                  onClick={handleUpdateGroup}
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              )}
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-4">
              {group.members.map((member) => (
                <div key={member.user._id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full">
                        <img
                          src={member.user.profilePic || "/avatar.png"}
                          alt={member.user.fullName}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.user.fullName}</span>
                        {getRoleIcon(member.role)}
                      </div>
                      <span className="text-sm text-base-content/60 capitalize">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isAdmin && member.user._id !== authUser._id && (
                    <div className="flex gap-2">
                      {/* Role Dropdown */}
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.user._id, e.target.value)}
                        className="select select-bordered select-sm"
                      >
                        <option value="member">Member</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveMember(member.user._id)}
                        className="btn btn-error btn-sm"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "danger" && isAdmin && (
            <div className="space-y-4">
              <div className="alert alert-warning">
                <span>These actions are irreversible. Please be careful.</span>
              </div>

              <button
                onClick={handleDeleteGroup}
                className="btn btn-error w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Group
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupSettingsModal;