import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Wifi, WifiOff } from "lucide-react";

const ConnectionStatus = () => {
  const { socket } = useAuthStore();
  const [isConnected, setIsConnected] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsConnected(false);
      setShowStatus(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (socket) {
      socket.on("connect", handleOnline);
      socket.on("disconnect", handleOffline);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (socket) {
        socket.off("connect", handleOnline);
        socket.off("disconnect", handleOffline);
      }
    };
  }, [socket]);

  if (!showStatus) return null;

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${isConnected ? 'bg-success text-success-content' : 'bg-error text-error-content'}`}>
      {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
      <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Connection lost'}</span>
    </div>
  );
};

export default ConnectionStatus;
