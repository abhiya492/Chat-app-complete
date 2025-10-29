import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const Setting = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20 max-w-5xl bg-gradient-to-br from-base-200 via-base-100 to-base-200 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      <div className="space-y-8 relative z-10">
        <div className="flex flex-col gap-2 text-center animate-fade-in">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">Theme Settings</h2>
          <p className="text-lg text-base-content/60">Choose a theme for your chat interface</p>
        </div>

        <div className="glass-effect rounded-3xl p-6 shadow-2xl animate-slide-up">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            Available Themes
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`
                  group flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-110 hover:shadow-lg
                  ${theme === t ? "bg-gradient-to-br from-primary/30 to-primary/20 ring-2 ring-primary shadow-xl scale-105" : "bg-base-200/50 hover:bg-base-200"}
                `}
                onClick={() => setTheme(t)}
              >
                <div className="relative h-10 w-full rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>
                <span className="text-xs font-semibold truncate w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-effect rounded-3xl p-6 shadow-2xl animate-slide-up">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            Live Preview
          </h3>
        <div className="rounded-2xl border border-base-300/50 overflow-hidden bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="p-4 bg-base-200">
            <div className="max-w-lg mx-auto">
              {/* Mock Chat UI */}
              <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-base-300 bg-gradient-to-r from-base-100 to-base-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-content font-medium shadow-md">
                      J
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">John Doe</h3>
                      <p className="text-xs text-base-content/70">Online</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                  {PREVIEW_MESSAGES.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`
                          max-w-[80%] rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow
                          ${message.isSent ? "bg-gradient-to-br from-primary to-primary/90 text-primary-content" : "bg-base-200"}
                        `}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`
                            text-[10px] mt-1.5
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
                <div className="p-4 border-t border-base-300 bg-base-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input input-bordered flex-1 text-sm h-10"
                      placeholder="Type a message..."
                      value="This is a preview"
                      readOnly
                    />
                    <button className="btn btn-primary h-10 min-h-0 bg-gradient-to-br from-primary to-primary/80 shadow-md hover:shadow-lg hover:scale-105 transition-all">
                      <Send size={18} />
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