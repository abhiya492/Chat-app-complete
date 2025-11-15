import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Radio, Shuffle, Menu, X, Loader2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { useState } from "react";

const Navbar = () => {
  const { logout, authUser, isLoggingOut } = useAuthStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header
      className="bg-base-100/70 border-b border-base-300/50 fixed w-full top-0 z-40 
    backdrop-blur-2xl shadow-lg shadow-base-300/20"
    >
      <div className="container mx-auto px-2 sm:px-4 h-14 sm:h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2 sm:gap-8">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:scale-105 transition-all duration-300 group">
              <div className="size-8 sm:size-10 rounded-xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/50 group-hover:rotate-6 transition-all duration-300">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary-content" />
              </div>
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent group-hover:tracking-wide transition-all">Chatty</h1>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <ThemeToggle />
            <LanguageSelector />
            
            {authUser && (
              <>
                <Link to="/rooms" className="btn btn-sm gap-2 btn-ghost hover:bg-primary/10 hover:text-primary transition-all hover:scale-105 hover:shadow-md">
                  <Radio className="w-4 h-4" />
                  <span className="hidden lg:inline font-medium text-sm">Rooms</span>
                </Link>
                <Link to="/random-chat" className="btn btn-sm gap-2 btn-primary hover:scale-105 hover:shadow-md transition-all">
                  <Shuffle className="w-4 h-4" />
                  <span className="hidden lg:inline font-medium text-sm">Random</span>
                </Link>
              </>
            )}

            <Link to="/settings" className="btn btn-sm gap-2 btn-ghost hover:bg-primary/10 hover:text-primary transition-all hover:scale-105 hover:shadow-md">
              <Settings className="w-4 h-4 hover:rotate-90 transition-transform duration-300" />
              <span className="hidden lg:inline font-medium text-sm">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to="/profile" className="btn btn-sm gap-2 btn-ghost hover:bg-primary/10 hover:text-primary transition-all hover:scale-105 hover:shadow-md">
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline font-medium text-sm">Profile</span>
                </Link>
                <button className="btn btn-sm gap-2 btn-ghost hover:bg-error/10 hover:text-error transition-all hover:scale-105 hover:shadow-md" onClick={logout} disabled={isLoggingOut}>
                  {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4 hover:-rotate-12 transition-transform" />}
                  <span className="hidden lg:inline font-medium text-sm">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-base-100 border-b border-base-300 shadow-lg z-50">
            <div className="flex flex-col p-2 space-y-1">
              <div className="px-3 py-2"><LanguageSelector /></div>
              {authUser && (
                <>
                  <Link to="/rooms" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                    <Radio className="w-4 h-4" /><span>Voice Rooms</span>
                  </Link>
                  <Link to="/random-chat" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                    <Shuffle className="w-4 h-4" /><span>Random Chat</span>
                  </Link>
                </>
              )}
              <Link to="/settings" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                <Settings className="w-4 h-4" /><span>Settings</span>
              </Link>
              {authUser && (
                <>
                  <Link to="/profile" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                    <User className="w-4 h-4" /><span>Profile</span>
                  </Link>
                  <button className="btn btn-sm gap-2 btn-ghost justify-start text-error hover:bg-error/10" onClick={() => { logout(); setShowMobileMenu(false); }} disabled={isLoggingOut}>
                    {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}<span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;