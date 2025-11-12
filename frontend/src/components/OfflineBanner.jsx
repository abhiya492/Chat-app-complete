import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-error text-error-content py-2 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top">
      <WifiOff size={18} />
      <span className="text-sm font-medium">You are offline. Some features may be unavailable.</span>
    </div>
  );
};

export default OfflineBanner;
