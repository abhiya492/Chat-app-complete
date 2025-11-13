import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";

const SimpleCursor = () => {
  const [isActive, setIsActive] = useState(false);
  const [cursors, setCursors] = useState(new Map());
  const lastSentRef = useRef(0);
  
  const { socket, authUser } = useAuthStore();
  const { selectedUser } = useChatStore();

  useEffect(() => {
    if (!socket) return;

    socket.on("cursor:move", ({ userId, x, y, username }) => {
      if (userId === authUser._id) return;
      
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.set(userId, { x, y, username, timestamp: Date.now() });
        return newCursors;
      });
    });

    socket.on("cursor:leave", ({ userId }) => {
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(userId);
        return newCursors;
      });
    });

    return () => {
      socket.off("cursor:move");
      socket.off("cursor:leave");
    };
  }, [socket, authUser._id]);

  useEffect(() => {
    if (!isActive || !socket || !selectedUser) return;

    // Create consistent room ID (sorted IDs)
    const roomId = [authUser._id, selectedUser._id].sort().join('_');

    // Join chat room
    socket.emit("cursor:start", { chatId: roomId });

    const handleMouseMove = (e) => {
      const now = Date.now();
      // Throttle to ~60fps (16ms)
      if (now - lastSentRef.current < 16) return;
      
      // Use percentage for cross-screen compatibility
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      socket.emit("cursor:move", {
        chatId: roomId,
        userId: authUser._id,
        x,
        y,
        username: authUser.fullName
      });
      
      lastSentRef.current = now;
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      socket.emit("cursor:leave", {
        chatId: roomId,
        userId: authUser._id
      });
    };
  }, [isActive, socket, selectedUser, authUser]);

  const toggleCursor = () => {
    const roomId = [authUser._id, selectedUser._id].sort().join('_');
    
    if (isActive) {
      socket.emit("cursor:leave", {
        chatId: roomId,
        userId: authUser._id
      });
      setCursors(new Map());
    } else {
      socket.emit("cursor:start", { chatId: roomId });
    }
    setIsActive(!isActive);
  };

  // Cleanup when switching chats
  useEffect(() => {
    return () => {
      if (isActive && socket && selectedUser) {
        const roomId = [authUser._id, selectedUser._id].sort().join('_');
        socket.emit("cursor:leave", {
          chatId: roomId,
          userId: authUser._id
        });
      }
      setCursors(new Map());
      setIsActive(false);
    };
  }, [selectedUser?._id]);

  return (
    <>
      <div className="p-4 bg-base-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">👆 Cursor Share</h3>
        
        <div className="space-y-4">
          <button 
            className={`btn ${isActive ? 'btn-error' : 'btn-primary'}`}
            onClick={toggleCursor}
          >
            {isActive ? 'Stop Sharing' : 'Start Sharing'}
          </button>
          
          <div className="text-sm">
            {isActive ? (
              <div className="flex items-center gap-2">
                <span className="text-success font-semibold">✓ Sharing cursor</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <span className="text-base-content/70">Share your cursor position with friend</span>
            )}
          </div>
          
          {cursors.size > 0 && (
            <div className="text-sm font-semibold text-success flex items-center gap-2">
              <span>👥 {cursors.size} friend{cursors.size !== 1 ? 's' : ''} cursor visible</span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          )}
          
          {isActive && cursors.size === 0 && (
            <div className="text-sm text-warning">
              ⏳ Waiting for friend to share cursor...
            </div>
          )}
        </div>
      </div>

      {/* Cursor overlays - Full screen */}
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {Array.from(cursors.entries()).map(([userId, cursor], index) => {
            const colors = [
              { main: '#8b5cf6', light: '#a78bfa', name: 'purple' },
              { main: '#3b82f6', light: '#60a5fa', name: 'blue' },
              { main: '#10b981', light: '#34d399', name: 'green' },
              { main: '#f59e0b', light: '#fbbf24', name: 'amber' },
            ];
            const color = colors[index % colors.length];
            
            return (
              <div
                key={userId}
                className="absolute transition-all duration-100 ease-out"
                style={{
                  left: `${cursor.x}%`,
                  top: `${cursor.y}%`,
                }}
              >
                {/* Modern cursor pointer */}
                <svg width="24" height="24" viewBox="0 0 24 24" className="drop-shadow-lg">
                  <path
                    d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z"
                    fill={color.main}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                </svg>
                
                {/* Username badge */}
                <div 
                  className="absolute top-6 left-6 px-2 py-1 rounded text-white text-xs font-medium shadow-lg whitespace-nowrap"
                  style={{ backgroundColor: color.main }}
                >
                  {cursor.username || 'User'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default SimpleCursor;