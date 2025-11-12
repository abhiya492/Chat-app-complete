import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="bg-base-100/70 border-b border-base-300/50 fixed w-full top-0 z-40 
    backdrop-blur-2xl shadow-lg shadow-base-300/20"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-all duration-300 group">
              <div className="size-10 rounded-xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/50 group-hover:rotate-6 transition-all duration-300">
                <MessageSquare className="w-5 h-5 text-primary-content" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent group-hover:tracking-wide transition-all">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle />
            
            <Link
              to="/settings"
              className="btn btn-sm gap-2 btn-ghost hover:bg-primary/10 hover:text-primary transition-all hover:scale-105 hover:shadow-md"
            >
              <Settings className="w-4 h-4 hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline font-medium">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to="/profile" className="btn btn-sm gap-2 btn-ghost hover:bg-primary/10 hover:text-primary transition-all hover:scale-105 hover:shadow-md">
                  <User className="size-5" />
                  <span className="hidden sm:inline font-medium">Profile</span>
                </Link>

                <button className="btn btn-sm gap-2 btn-ghost hover:bg-error/10 hover:text-error transition-all hover:scale-105 hover:shadow-md" onClick={logout}>
                  <LogOut className="size-5 hover:-rotate-12 transition-transform" />
                  <span className="hidden sm:inline font-medium">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;