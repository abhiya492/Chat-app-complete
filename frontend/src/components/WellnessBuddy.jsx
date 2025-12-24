import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const WellnessBuddy = () => {
  const [buddies, setBuddies] = useState([]);
  const [requests, setRequests] = useState([]);
  const { socket } = useAuthStore();

  useEffect(() => {
    if (socket) {
      socket.on('wellness:buddy-request', (data) => {
        setRequests(prev => [...prev, data]);
      });

      socket.on('wellness:buddy-accepted', (data) => {
        setBuddies(prev => [...prev, data.buddy]);
      });

      socket.on('wellness:buddy-check-in', (data) => {
        // Show notification when buddy checks in
        console.log(`${data.buddyName} is checking in on you!`);
      });
    }
  }, [socket]);

  const sendBuddyRequest = (userId) => {
    socket?.emit('wellness:buddy-request', { to: userId });
  };

  const acceptBuddyRequest = (requestId) => {
    socket?.emit('wellness:buddy-accept', { requestId });
  };

  const checkInOnBuddy = (buddyId) => {
    socket?.emit('wellness:buddy-check-in', { to: buddyId });
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title">Wellness Buddies 👥</h3>
        
        {requests.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Buddy Requests</h4>
            {requests.map(request => (
              <div key={request.id} className="flex justify-between items-center p-2 bg-base-200 rounded">
                <span>{request.fromName} wants to be your wellness buddy</span>
                <button 
                  onClick={() => acceptBuddyRequest(request.id)}
                  className="btn btn-xs btn-primary"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {buddies.map(buddy => (
            <div key={buddy.id} className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full">
                    <img src={buddy.profilePic || '/avatar.png'} alt={buddy.name} />
                  </div>
                </div>
                <div>
                  <div className="font-medium">{buddy.name}</div>
                  <div className="text-xs text-base-content/60">
                    Mood: {buddy.currentMood || '😐'} • Last active: {buddy.lastActive}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => checkInOnBuddy(buddy.id)}
                className="btn btn-xs btn-ghost"
                title="Check in on your buddy"
              >
                💙
              </button>
            </div>
          ))}
        </div>

        {buddies.length === 0 && (
          <div className="text-center text-base-content/60 py-4">
            <p>No wellness buddies yet.</p>
            <p className="text-xs mt-1">Invite friends to support each other's wellbeing!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessBuddy;