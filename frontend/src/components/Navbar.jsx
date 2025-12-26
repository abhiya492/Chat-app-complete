import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { LogOut, MessageSquare, Settings, User, Radio, Shuffle, Menu, X, Loader2, Clock, Swords, Heart, Building2, Globe, CreditCard, Users, UserPlus } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import ExpandableMenu from "./ExpandableMenu";
import { useState } from "react";
import ScheduledMessages from "./ScheduledMessages";

const Navbar = () => {
  const { logout, authUser, isLoggingOut } = useAuthStore();
  const { setShowScheduled } = useChatStore();
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

          <div className="hidden md:flex items-center gap-2 lg:gap-3 absolute left-1/2 transform -translate-x-1/2 group">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 lg:gap-3">
              {authUser && (
                <>
                  <Link to="/groups" className="btn btn-sm gap-2 btn-primary hover:scale-105 hover:shadow-md transition-all">
                    <Users className="w-4 h-4" />
                    <span className="hidden lg:inline font-medium text-sm">Groups</span>
                  </Link>
                  <Link to="/contacts" className="btn btn-sm gap-2 btn-primary hover:scale-105 hover:shadow-md transition-all">
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden lg:inline font-medium text-sm">Contacts</span>
                  </Link>
                  <Link to="/random-chat" className="btn btn-sm gap-2 btn-primary hover:scale-105 hover:shadow-md transition-all">
                    <Shuffle className="w-4 h-4" />
                    <span className="hidden lg:inline font-medium text-sm">Random</span>
                  </Link>
                  <Link to="/challenge" className="btn btn-sm gap-2 btn-success hover:scale-105 hover:shadow-md transition-all">
                    <Swords className="w-4 h-4" />
                    <span className="hidden lg:inline font-medium text-sm">Challenge</span>
                  </Link>
                  <Link to="/wellness" className="btn btn-sm gap-2 btn-accent hover:scale-105 hover:shadow-md transition-all">
                    <Heart className="w-4 h-4" />
                    <span className="hidden lg:inline font-medium text-sm">Wellness</span>
                  </Link>
                  <Link to="/corporate-wellness" className="btn btn-sm gap-2 btn-info hover:scale-105 hover:shadow-md transition-all">
                    <Building2 className="w-4 h-4" />
                    <span className="hidden lg:inline font-medium text-sm">Corporate</span>
                  </Link>
                  <Link to="/community-challenges" className="btn btn-sm gap-2 btn-secondary hover:scale-105 hover:shadow-md transition-all">
                    <Globe className="w-4 h-4" />
                    <span className="hidden lg:inline font-medium text-sm">Community</span>
                  </Link>
                  <Link to="/upi-payment" className="btn btn-sm gap-2 btn-warning hover:scale-105 hover:shadow-md transition-all">
                    <CreditCard className="w-4 h-4" />
                    <span className="hidden lg:inline font-medium text-sm">Upgrade</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <ExpandableMenu />
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ExpandableMenu />
            <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-base-100 border-b border-base-300 shadow-lg z-50 animate-in slide-in-from-top-2">
            <div className="flex flex-col p-2 space-y-1">
              <div className="px-3 py-2"><LanguageSelector /></div>
              {authUser && (
                <>
                  <button onClick={() => { setShowScheduled(true); setShowMobileMenu(false); }} className="btn btn-sm gap-2 btn-ghost justify-start">
                    <Clock className="w-4 h-4" /><span>Scheduled Messages</span>
                  </button>
                  <Link to="/groups" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                    <Users className="w-4 h-4" /><span>Groups</span>
                  </Link>
                  <Link to="/contacts" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                    <UserPlus className="w-4 h-4" /><span>Contacts</span>
                  </Link>
                  <Link to="/rooms" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                    <Radio className="w-4 h-4" /><span>Voice Rooms</span>
                  </Link>
                  <Link to="/random-chat" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                    <Shuffle className="w-4 h-4" /><span>Random Chat</span>
                  </Link>
                  <Link to="/challenge" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                    <Swords className="w-4 h-4" /><span>Challenge</span>
                  </Link>
                  <Link to="/wellness" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                    <Heart className="w-4 h-4" /><span>Wellness</span>
                  </Link>
                  <Link to="/corporate-wellness" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                    <Building2 className="w-4 h-4" /><span>Corporate Wellness</span>
                  </Link>
                  <Link to="/community-challenges" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                    <Globe className="w-4 h-4" /><span>Community Challenges</span>
                  </Link>
                  <Link to="/upi-payment" className="btn btn-sm gap-2 btn-ghost justify-start" onClick={() => setShowMobileMenu(false)}>
                    <CreditCard className="w-4 h-4" /><span>Upgrade Plan</span>
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