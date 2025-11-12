import { X, Mail, Calendar, MessageSquare } from "lucide-react";

const UserInfoModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">User Info</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <img
              src={user.profilePic || "/avatar.png"}
              alt={user.fullName}
              className="size-24 rounded-full object-cover border-4 border-base-200"
            />
            <h4 className="text-xl font-semibold mt-3">{user.fullName}</h4>
          </div>

          {/* Status */}
          {user.status && (
            <div className="bg-base-200/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-base-content/60 mb-2">
                <MessageSquare size={16} />
                <span>Status</span>
              </div>
              <p className="text-sm">{user.status}</p>
            </div>
          )}

          {/* Bio */}
          {user.bio && (
            <div className="bg-base-200/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-base-content/60 mb-2">
                <MessageSquare size={16} />
                <span>Bio</span>
              </div>
              <p className="text-sm">{user.bio}</p>
            </div>
          )}

          {/* Email */}
          <div className="bg-base-200/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-base-content/60 mb-2">
              <Mail size={16} />
              <span>Email</span>
            </div>
            <p className="text-sm">{user.email}</p>
          </div>

          {/* Member Since */}
          <div className="bg-base-200/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-base-content/60 mb-2">
              <Calendar size={16} />
              <span>Member Since</span>
            </div>
            <p className="text-sm">{user.createdAt?.split("T")[0]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
