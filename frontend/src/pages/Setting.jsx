import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send, Shield, Key } from "lucide-react";
import { hasKeys, getStoredKeys } from "../lib/encryption";
import { useState } from "react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const Setting = () => {
  const { theme, setTheme } = useThemeStore();
  const [encryptionEnabled] = useState(hasKeys());
  const keys = getStoredKeys();

  return (
    <div className="min-h-screen container mx-auto px-2 sm:px-4 pt-16 sm:pt-20 max-w-5xl bg-gradient-to-br from-base-200 via-base-100 to-base-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      <div className="space-y-4 sm:space-y-8 relative z-10">
        <div className="flex flex-col gap-2 text-center animate-fade-in">
          <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">Theme Settings</h2>
          <p className="text-sm sm:text-lg text-base-content/60">Choose a theme for your chat interface</p>
        </div>

        <div className="glass-effect rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl animate-slide-up">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-1 h-4 sm:h-5 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            Available Themes
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`
                  group flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all hover:scale-110 hover:shadow-lg
                  ${theme === t ? "bg-gradient-to-br from-primary/30 to-primary/20 ring-2 ring-primary shadow-xl scale-105" : "bg-base-200/50 hover:bg-base-200"}
                `}
                onClick={() => setTheme(t)}
              >
                <div className="relative h-8 sm:h-10 w-full rounded-md sm:rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-0.5 sm:p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs font-semibold truncate w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-effect rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl animate-slide-up">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-1 h-4 sm:h-5 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            Encryption
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg">
              <Shield className={`size-5 ${encryptionEnabled ? 'text-green-500' : 'text-base-content/50'}`} />
              <div className="flex-1">
                <p className="font-medium text-sm">End-to-End Encryption</p>
                <p className="text-xs text-base-content/60">
                  {encryptionEnabled ? 'Your messages are encrypted' : 'Encryption not set up'}
                </p>
              </div>
              <div className={`badge ${encryptionEnabled ? 'badge-success' : 'badge-ghost'}`}>
                {encryptionEnabled ? 'Active' : 'Inactive'}
              </div>
            </div>
            {encryptionEnabled && (
              <div className="p-3 bg-base-200/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="size-4" />
                  <p className="font-medium text-sm">Your Public Key</p>
                </div>
                <p className="text-xs text-base-content/60 break-all font-mono bg-base-300/50 p-2 rounded">
                  {keys.publicKey?.substring(0, 60)}...
                </p>
                <p className="text-xs text-warning mt-2">⚠️ Never share your private key with anyone</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-effect rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl animate-slide-up">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-1 h-4 sm:h-5 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            Live Preview
          </h3>
        <div className="rounded-xl sm:rounded-2xl border border-base-300/50 overflow-hidden bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="p-2 sm:p-4 bg-base-200">
            <div className="max-w-lg mx-auto">
              {/* Mock Chat UI */}
              <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-2 sm:px-4 py-2 sm:py-3 border-b border-base-300 bg-gradient-to-r from-base-100 to-base-200/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-content font-medium shadow-md text-xs sm:text-sm">
                      J
                    </div>
                    <div>
                      <h3 className="font-medium text-xs sm:text-sm">John Doe</h3>
                      <p className="text-[10px] sm:text-xs text-base-content/70">Online</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-2 sm:p-4 space-y-2 sm:space-y-4 min-h-[150px] sm:min-h-[200px] max-h-[150px] sm:max-h-[200px] overflow-y-auto bg-base-100">
                  {PREVIEW_MESSAGES.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`
                          max-w-[85%] sm:max-w-[80%] rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-md hover:shadow-lg transition-shadow
                          ${message.isSent ? "bg-gradient-to-br from-primary to-primary/90 text-primary-content" : "bg-base-200"}
                        `}
                      >
                        <p className="text-xs sm:text-sm">{message.content}</p>
                        <p
                          className={`
                            text-[9px] sm:text-[10px] mt-1 sm:mt-1.5
                            ${message.isSent ? "text-primary-content/70" : "text-base-content/70"}
                          `}
                        >
                          12:00 PM
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-2 sm:p-4 border-t border-base-300 bg-base-100">
                  <div className="flex gap-1 sm:gap-2">
                    <input
                      type="text"
                      className="input input-bordered flex-1 text-xs sm:text-sm h-8 sm:h-10 min-h-0"
                      placeholder="Type a message..."
                      value="This is a preview"
                      readOnly
                    />
                    <button className="btn btn-primary h-8 sm:h-10 min-h-0 px-3 sm:px-4 bg-gradient-to-br from-primary to-primary/80 shadow-md hover:shadow-lg hover:scale-105 transition-all">
                      <Send size={14} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
export default Setting;