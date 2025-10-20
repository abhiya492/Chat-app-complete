import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";

const Profile = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

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

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-100/80 backdrop-blur-xl rounded-2xl p-8 space-y-8 shadow-2xl border border-base-300/50">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Profile</h1>
            <p className="mt-2 text-base-content/70">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none"></div>
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-36 rounded-full object-cover border-4 border-base-100 shadow-xl relative ring-4 ring-primary/20"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-2 right-2
                  bg-gradient-to-br from-primary to-primary/80 hover:scale-110
                  p-3 rounded-full cursor-pointer 
                  transition-all duration-200 shadow-lg
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-primary-content" />
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
            <p className="text-sm text-base-content/60 font-medium">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2 bg-base-200/50 p-4 rounded-xl border border-base-300/50">
              <div className="text-sm text-base-content/60 flex items-center gap-2 font-semibold">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <User className="w-4 h-4 text-primary" />
                </div>
                Full Name
              </div>
              <p className="px-4 py-3 bg-base-100 rounded-lg border border-base-300/50 font-medium text-lg">{authUser?.fullName}</p>
            </div>

            <div className="space-y-2 bg-base-200/50 p-4 rounded-xl border border-base-300/50">
              <div className="text-sm text-base-content/60 flex items-center gap-2 font-semibold">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                Email Address
              </div>
              <p className="px-4 py-3 bg-base-100 rounded-lg border border-base-300/50 font-medium text-lg">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-br from-base-200/50 to-base-300/30 rounded-xl p-6 border border-base-300/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
              Account Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-3 px-4 bg-base-100/50 rounded-lg">
                <span className="font-medium text-base-content/70">Member Since</span>
                <span className="font-semibold">{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-base-100/50 rounded-lg">
                <span className="font-medium text-base-content/70">Account Status</span>
                <span className="flex items-center gap-2">
                  <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-500 font-semibold">Active</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;