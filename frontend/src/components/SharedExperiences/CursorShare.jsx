import { useState, useEffect, useRef } from "react";
// import { useSocketContext } from "../../context/SocketContext";
import { useAuthStore } from "../../store/useAuthStore";
import useSharedStore from "../../store/useSharedStore";
import { useChatStore } from "../../store/useChatStore";


const CursorShare = () => {
  const [isActive, setIsActive] = useState(false);
  const [showCursors, setShowCursors] = useState(true);
  const lastSentRef = useRef(0);
  const cursorsContainerRef = useRef(null);
  
  const { socket } = useAuthStore();
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const { 
    cursors, 
    updateCursor, 
    removeCursor, 
    createExperience,
    currentExperience 
  } = useSharedStore();

  useEffect(() => {
    if (!socket) return;

    socket.on("cursor:move", handleCursorMove);
    socket.on("cursor:click", handleCursorClick);
    socket.on("cursor:leave", handleCursorLeave);

    return () => {
      socket.off("cursor:move");
      socket.off("cursor:click");
      socket.off("cursor:leave");
    };
  }, [socket]);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastSentRef.current < 16) return; // ~60fps throttle
      
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      socket.emit("cursor:move", {
        chatId: selectedUser._id,
        userId: authUser._id,
        x,
        y,
        timestamp: now
      });
      
      lastSentRef.current = now;
    };

    const handleClick = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      socket.emit("cursor:click", {
        chatId: selectedUser._id,
        userId: authUser._id,
        x,
        y
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, [isActive, socket, selectedUser, authUser]);

  const startCursorShare = async () => {
    try {
      await createExperience("cursor", selectedUser._id, {
        cursors: []
      });
      
      setIsActive(true);
      
      socket.emit("cursor:start", {
        chatId: selectedUser._id,
        userId: authUser._id
      });
    } catch (error) {
      console.error("Failed to start cursor sharing:", error);
    }
  };

  const stopCursorShare = () => {
    setIsActive(false);
    
    socket.emit("cursor:leave", {
      chatId: selectedUser._id,
      userId: authUser._id
    });
  };

  const handleCursorMove = (data) => {
    if (data.userId === authUser._id) return; // Don't show own cursor
    
    updateCursor(data.userId, {
      x: data.x,
      y: data.y,
      timestamp: data.timestamp,
      username: data.username
    });
  };

  const handleCursorClick = (data) => {
    if (data.userId === authUser._id) return;
    
    // Create click animation
    const clickElement = document.createElement('div');
    clickElement.className = 'cursor-click-animation';
    clickElement.style.cssText = `
      position: fixed;
      left: ${data.x * window.innerWidth}px;
      top: ${data.y * window.innerHeight}px;
      width: 20px;
      height: 20px;
      border: 2px solid #3b82f6;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: clickPulse 0.6s ease-out forwards;
    `;
    
    document.body.appendChild(clickElement);
    setTimeout(() => clickElement.remove(), 600);
  };

  const handleCursorLeave = (data) => {
    removeCursor(data.userId);
  };

  return (
    <>
      <div className="p-4 bg-base-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          👆 Cursor Share
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button 
              className={`btn ${isActive ? 'btn-error' : 'btn-primary'}`}
              onClick={isActive ? stopCursorShare : startCursorShare}
            >
              {isActive ? 'Stop Sharing' : 'Start Sharing'}
            </button>
            
            <label className="label cursor-pointer">
              <span className="label-text mr-2">Show Others</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={showCursors}
                onChange={(e) => setShowCursors(e.target.checked)}
              />
            </label>
          </div>
          
          <div className="text-sm text-base-content/70">
            {isActive ? (
              <span className="text-success">✓ Sharing your cursor</span>
            ) : (
              <span>Share your cursor position with others</span>
            )}
          </div>
          
          {cursors.size > 0 && (
            <div className="text-sm">
              👥 {cursors.size} other cursor{cursors.size !== 1 ? 's' : ''} visible
            </div>
          )}
        </div>
      </div>

      {/* Cursor overlays */}
      {showCursors && (
        <div 
          ref={cursorsContainerRef}
          className="fixed inset-0 pointer-events-none z-50"
        >
          {Array.from(cursors.entries()).map(([userId, cursor]) => (
            <div
              key={userId}
              className="absolute transition-all duration-75 ease-out"
              style={{
                left: `${cursor.x * window.innerWidth}px`,
                top: `${cursor.y * window.innerHeight}px`,
                transform: 'translate(-2px, -2px)'
              }}
            >
              {/* Cursor pointer */}
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                className="drop-shadow-lg"
              >
                <path
                  d="M0 0L0 16L5 11L8 16L12 14L9 9L16 9L0 0Z"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>
              
              {/* Username label */}
              <div className="absolute top-5 left-2 bg-primary text-primary-content text-xs px-2 py-1 rounded whitespace-nowrap">
                {cursor.username || 'User'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CSS for click animation */}
      <style jsx>{`
        @keyframes clickPulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default CursorShare;