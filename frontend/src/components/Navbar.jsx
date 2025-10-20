import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="bg-base-100/80 border-b border-base-300/50 fixed w-full top-0 z-40 
    backdrop-blur-xl shadow-sm"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-200 group">
              <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
                <MessageSquare className="w-5 h-5 text-primary-content" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={"/settings"}
              className="btn btn-sm gap-2 btn-ghost hover:bg-primary/10 hover:text-primary transition-all hover:scale-105"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className="btn btn-sm gap-2 btn-ghost hover:bg-primary/10 hover:text-primary transition-all hover:scale-105">
                  <User className="size-5" />
                  <span className="hidden sm:inline font-medium">Profile</span>
                </Link>

                <button className="btn btn-sm gap-2 btn-ghost hover:bg-error/10 hover:text-error transition-all hover:scale-105" onClick={logout}>
                  <LogOut className="size-5" />
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