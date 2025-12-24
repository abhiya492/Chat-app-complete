import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { 
  Menu, 
  Sun, 
  Clock, 
  Radio, 
  Settings, 
  User, 
  LogOut, 
  Loader2,
  Globe,
  Eye
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import AccessibilityToggle from "./AccessibilityToggle";

const ExpandableMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { logout, authUser, isLoggingOut } = useAuthStore();
  const { setShowScheduled } = useChatStore();

  const menuItems = [
    {
      icon: Globe,
      label: "Language",
      component: <LanguageSelector />,
      isComponent: true
    },
    {
      icon: Sun,
      label: "Theme",
      component: <ThemeToggle />,
      isComponent: true
    },
    {
      icon: Eye,
      label: "Accessibility",
      component: <AccessibilityToggle />,
      isComponent: true
    },
    {
      icon: Clock,
      label: "Scheduled",
      onClick: () => setShowScheduled(true)
    },
    {
      icon: Radio,
      label: "Rooms",
      to: "/rooms"
    },
    {
      icon: Settings,
      label: "Settings",
      to: "/settings"
    },
    {
      icon: User,
      label: "Profile",
      to: "/profile"
    },
    {
      icon: LogOut,
      label: "Logout",
      onClick: logout,
      disabled: isLoggingOut,
      className: "text-error hover:bg-error/10"
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="btn btn-circle btn-ghost hover:bg-primary/10 transition-all duration-300"
      >
        <Menu className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {isExpanded && (
        <div className="absolute right-0 top-12 bg-base-100 rounded-lg shadow-xl border border-base-300 p-2 min-w-[220px] z-50 animate-in slide-in-from-top-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            
            if (item.isComponent) {
              return (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  <div className="ml-auto">{item.component}</div>
                </div>
              );
            }

            if (item.to) {
              return (
                <Link
                  key={index}
                  to={item.to}
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors w-full"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setIsExpanded(false);
                }}
                disabled={item.disabled}
                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors w-full ${item.className || ''}`}
              >
                {item.disabled && isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {item.disabled && isLoggingOut ? "Logging out..." : item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {isExpanded && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default ExpandableMenu;