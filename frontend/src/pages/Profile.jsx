import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { User as UserIcon, Settings, UserX, Palette, BarChart3 } from "lucide-react";
import ProfileSettings from "../components/ProfileSettings";
import BlockedUsers from "../components/BlockedUsers";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";

const Profile = () => {
  const { authUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "theme", label: "Theme", icon: Palette },
    { id: "blocked", label: "Blocked", icon: UserX },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-base-200 via-base-100 to-base-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      <div className="max-w-4xl mx-auto p-4 py-8 relative z-10">
        <div className="glass-effect rounded-3xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Settings</h1>
            <p className="mt-2 text-base-content/60">Manage your profile and preferences</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-base-300">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "theme" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Palette size={20} className="text-primary" />
                  Choose Theme
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 ${
                        theme === t ? "ring-2 ring-primary scale-105" : "bg-base-200/50"
                      }`}
                      onClick={() => setTheme(t)}
                    >
                      <div className="h-10 w-full rounded-lg overflow-hidden" data-theme={t}>
                        <div className="grid grid-cols-4 gap-px p-1 h-full">
                          <div className="rounded bg-primary"></div>
                          <div className="rounded bg-secondary"></div>
                          <div className="rounded bg-accent"></div>
                          <div className="rounded bg-neutral"></div>
                        </div>
                      </div>
                      <span className="text-xs font-medium truncate w-full text-center">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "blocked" && <BlockedUsers />}
            {activeTab === "analytics" && <AnalyticsDashboard />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;