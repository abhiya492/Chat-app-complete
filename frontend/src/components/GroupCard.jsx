import { useState } from "react";
import { Users, Settings, MessageCircle, Crown, Shield } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import GroupSettingsModal from "./GroupSettingsModal";

const GroupCard = ({ group }) => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const isAdmin = group.admin._id === authUser._id;
  const memberCount = group.members.length;
  const userRole = group.members.find(m => m.user._id === authUser._id)?.role;

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case "moderator":
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const handleOpenChat = () => {
    navigate(`/groups/${group._id}/chat`);
  };

  return (
    <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                {group.avatar ? (
                  <img src={group.avatar} alt={group.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Users className="w-6 h-6 text-primary" />
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-base-content line-clamp-1">
                {group.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-base-content/60">
                <Users className="w-3 h-3" />
                <span>{memberCount} members</span>
                {getRoleIcon(userRole)}
              </div>
            </div>
          </div>
          
          {(isAdmin || userRole === "moderator") && (
            <button
              onClick={() => setShowSettings(true)}
              className="btn btn-ghost btn-xs"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-sm text-base-content/70 line-clamp-2 mb-3">
            {group.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {group.settings.isPrivate && (
              <div className="badge badge-outline badge-xs">Private</div>
            )}
            <span className="text-xs text-base-content/50">
              {new Date(group.lastActivity).toLocaleDateString()}
            </span>
          </div>
          
          <button
            onClick={handleOpenChat}
            className="btn btn-primary btn-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <GroupSettingsModal
          group={group}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default GroupCard;