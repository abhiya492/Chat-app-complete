import { MessageCircle, Users, UserPlus, Settings, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const MobileNav = () => {
  const { authUser } = useAuthStore();
  const location = useLocation();

  if (!authUser) return null;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/contacts', icon: UserPlus, label: 'Contacts' },
    { path: '/groups', icon: Users, label: 'Groups' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-base-content/60 hover:text-base-content hover:bg-base-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;