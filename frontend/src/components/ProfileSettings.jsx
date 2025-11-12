import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, FileText, MessageSquare, Eye, EyeOff, Shield, UserX } from "lucide-react";
import toast from "react-hot-toast";

const ProfileSettings = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [bio, setBio] = useState(authUser?.bio || "");
  const [status, setStatus] = useState(authUser?.status || "");
  const [privacy, setPrivacy] = useState(authUser?.privacy || {
    showLastSeen: true,
    showProfilePic: true,
    showStatus: true,
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const img = new Image();
      img.src = reader.result;
      
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setSelectedImg(compressedBase64);
        await updateProfile({ profilePic: compressedBase64 });
      };
    };
  };

  const handleSaveProfile = async () => {
    await updateProfile({ bio, status });
    toast.success("Profile updated successfully");
  };

  const handlePrivacyUpdate = async (key, value) => {
    const newPrivacy = { ...privacy, [key]: value };
    setPrivacy(newPrivacy);
    await updateProfile({ privacy: newPrivacy });
    toast.success("Privacy settings updated");
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="glass-effect rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Camera size={20} className="text-primary" />
          Profile Picture
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img
              src={selectedImg || authUser.profilePic || "/avatar.png"}
              alt="Profile"
              className="size-24 rounded-full object-cover border-4 border-base-100 shadow-lg"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-primary p-2 rounded-full cursor-pointer hover:scale-110 transition-all"
            >
              <Camera className="w-4 h-4 text-primary-content" />
            </label>
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUpdatingProfile}
            />
          </div>
          <div>
            <p className="font-medium">{authUser?.fullName}</p>
            <p className="text-sm text-base-content/60">{authUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Bio & Status */}
      <div className="glass-effect rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText size={20} className="text-primary" />
          About
        </h3>
        
        <div>
          <label className="label">
            <span className="label-text">Bio</span>
            <span className="label-text-alt">{bio.length}/200</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 200))}
            rows={3}
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Status</span>
            <span className="label-text-alt">{status.length}/100</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="What's on your mind?"
            value={status}
            onChange={(e) => setStatus(e.target.value.slice(0, 100))}
          />
        </div>

        <button
          onClick={handleSaveProfile}
          className="btn btn-primary btn-sm"
          disabled={isUpdatingProfile}
        >
          Save Changes
        </button>
      </div>

      {/* Privacy Settings */}
      <div className="glass-effect rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield size={20} className="text-primary" />
          Privacy Settings
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span>Show Last Seen</span>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={privacy.showLastSeen}
              onChange={(e) => handlePrivacyUpdate("showLastSeen", e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>Show Profile Picture</span>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={privacy.showProfilePic}
              onChange={(e) => handlePrivacyUpdate("showProfilePic", e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              <span>Show Status</span>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={privacy.showStatus}
              onChange={(e) => handlePrivacyUpdate("showStatus", e.target.checked)}
            />
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="glass-effect rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 bg-base-200/50 rounded-lg">
            <span className="text-base-content/70">Member Since</span>
            <span className="font-semibold">{authUser.createdAt?.split("T")[0]}</span>
          </div>
          <div className="flex justify-between p-3 bg-base-200/50 rounded-lg">
            <span className="text-base-content/70">Account Status</span>
            <span className="flex items-center gap-2">
              <span className="size-2 bg-green-500 rounded-full"></span>
              <span className="text-green-500 font-semibold">Active</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
