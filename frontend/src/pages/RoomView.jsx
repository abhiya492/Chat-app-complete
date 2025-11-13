import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRoomStore } from "../store/useRoomStore";
import { useAuthStore } from "../store/useAuthStore";
import { RoomAudioManager } from "../lib/webrtc-room";
import { Mic, MicOff, Hand, PhoneOff, Users, Crown } from "lucide-react";
import toast from "react-hot-toast";

const RoomView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRoom, getRoom, joinRoom, leaveRoom, participants, speakers, handRaised, subscribeToRoomEvents, unsubscribeFromRoomEvents, raiseHand, lowerHand, promoteToSpeaker, demoteToListener } = useRoomStore();
  const { authUser, socket } = useAuthStore();
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [connectionQuality, setConnectionQuality] = useState({});
  const audioManagerRef = useRef(null);

  useEffect(() => {
    getRoom(id);
    joinRoom(id);
    subscribeToRoomEvents();

    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.cleanup();
      }
      leaveRoom(id);
      unsubscribeFromRoomEvents();
    };
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const handleOffer = async ({ fromUserId, offer }) => {
      if (audioManagerRef.current) {
        await audioManagerRef.current.handleOffer(fromUserId, offer);
      }
    };

    const handleAnswer = async ({ fromUserId, answer }) => {
      if (audioManagerRef.current) {
        await audioManagerRef.current.handleAnswer(fromUserId, answer);
      }
    };

    const handleIceCandidate = async ({ fromUserId, candidate }) => {
      if (audioManagerRef.current) {
        await audioManagerRef.current.handleIceCandidate(fromUserId, candidate);
      }
    };

    const handleSpeakingChanged = ({ userId, isSpeaking }) => {
      setSpeakingUsers(prev => {
        const newSet = new Set(prev);
        if (isSpeaking) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    };

    socket.on("room:webrtc:offer", handleOffer);
    socket.on("room:webrtc:answer", handleAnswer);
    socket.on("room:webrtc:ice-candidate", handleIceCandidate);
    socket.on("room:speaking-changed", handleSpeakingChanged);

    return () => {
      socket.off("room:webrtc:offer", handleOffer);
      socket.off("room:webrtc:answer", handleAnswer);
      socket.off("room:webrtc:ice-candidate", handleIceCandidate);
      socket.off("room:speaking-changed", handleSpeakingChanged);
    };
  }, [socket]);

  useEffect(() => {
    const myParticipant = participants.find(p => p.userId === authUser?._id);
    const amSpeaker = myParticipant?.role === 'speaker';
    setIsSpeaker(amSpeaker);

    if (amSpeaker && !audioManagerRef.current) {
      initializeAudio();
    } else if (!amSpeaker && audioManagerRef.current) {
      audioManagerRef.current.cleanup();
      audioManagerRef.current = null;
    }
  }, [participants, authUser]);

  const initializeAudio = async () => {
    try {
      const manager = new RoomAudioManager(id, authUser._id, socket);
      const success = await manager.initialize();
      
      if (success) {
        audioManagerRef.current = manager;
        
        speakers.forEach(speakerId => {
          if (speakerId !== authUser._id) {
            manager.connectToPeer(speakerId);
          }
        });
        
        manager.onConnectionQualityChange = (userId, quality) => {
          setConnectionQuality(prev => ({ ...prev, [userId]: quality }));
        };
        
        toast.success("Microphone connected");
      } else {
        toast.error("Failed to access microphone");
      }
    } catch (error) {
      console.error("Audio init error:", error);
      toast.error("Microphone error");
    }
  };

  const toggleMute = () => {
    if (audioManagerRef.current) {
      const muted = audioManagerRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const toggleHandRaise = () => {
    if (isHandRaised) {
      lowerHand(id);
      setIsHandRaised(false);
    } else {
      raiseHand(id);
      setIsHandRaised(true);
    }
  };

  const handleLeave = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.cleanup();
    }
    leaveRoom(id);
    navigate('/rooms');
  };

  const isHost = currentRoom?.createdBy?._id === authUser?._id;

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="max-w-4xl mx-auto p-4">
        <div className="card bg-gradient-to-br from-base-200 to-base-300 shadow-xl mb-4">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-error rounded-full animate-pulse shadow-lg shadow-error/50"></div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {currentRoom.title}
                  </h1>
                </div>
                {currentRoom.description && (
                  <p className="opacity-70 mt-2 text-sm">{currentRoom.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="opacity-60" />
                    <span>{participants.length}/{currentRoom.maxParticipants} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mic size={16} className="opacity-60" />
                    <span>{speakers.length}/{currentRoom.maxSpeakers} speakers</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <div className="badge badge-primary badge-lg gap-2">
                  {currentRoom.category}
                </div>
                {isHost && (
                  <div className="badge badge-warning gap-1">
                    <Crown size={12} />
                    Host
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 mb-4">
          <div className="card-body">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Mic size={20} />
              Speakers ({speakers.length}/{currentRoom.maxSpeakers})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {participants
                .filter(p => p.role === 'speaker')
                .map(participant => (
                  <ParticipantCard
                    key={participant.userId}
                    participant={participant}
                    isHost={isHost}
                    isSpeaking={speakingUsers.has(participant.userId)}
                    connectionQuality={connectionQuality[participant.userId]}
                    onDemote={() => demoteToListener(id, participant.userId)}
                  />
                ))}
            </div>
          </div>
        </div>

        {handRaised.size > 0 && isHost && (
          <div className="card bg-base-200 mb-4">
            <div className="card-body">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <Hand size={20} />
                Hand Raised ({handRaised.size})
              </h3>
              <div className="space-y-2">
                {Array.from(handRaised).map(userId => {
                  const participant = participants.find(p => p.userId === userId);
                  return participant ? (
                    <div key={userId} className="flex items-center justify-between p-3 bg-base-300 rounded-lg hover:bg-base-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full">
                            {participant.profilePic ? (
                              <img src={participant.profilePic} alt={participant.fullName} />
                            ) : (
                              <div className="bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                                {participant.fullName?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold">{participant.fullName || 'Unknown'}</span>
                      </div>
                      <button
                        onClick={() => promoteToSpeaker(id, userId)}
                        className="btn btn-sm btn-primary"
                        disabled={speakers.length >= currentRoom.maxSpeakers}
                      >
                        Promote to Speaker
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}

        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Users size={20} />
              Listeners ({participants.filter(p => p.role === 'listener').length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {participants
                .filter(p => p.role === 'listener')
                .map(participant => (
                  <div key={participant.userId} className="badge badge-lg gap-2 bg-base-300 hover:bg-base-200 transition-colors">
                    <div className="avatar placeholder">
                      <div className="w-5 h-5 rounded-full">
                        {participant.profilePic ? (
                          <img src={participant.profilePic} alt={participant.fullName} />
                        ) : (
                          <div className="bg-primary text-primary-content text-xs">
                            {participant.fullName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    {participant.fullName || 'Unknown'}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-base-300 border-t border-base-content/10 p-4">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
            {isSpeaker && speakingUsers.has(authUser._id) && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full animate-pulse">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm font-medium text-primary">You're speaking</span>
              </div>
            )}
            <div className="flex justify-center gap-4">
              {isSpeaker && (
                <button
                  onClick={toggleMute}
                  className={`btn btn-circle btn-lg transition-all ${
                    isMuted ? 'btn-error' : speakingUsers.has(authUser._id) ? 'btn-primary ring-4 ring-primary/30' : 'btn-primary'
                  }`}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
              )}
            
            {!isSpeaker && (
              <button
                onClick={toggleHandRaise}
                className={`btn btn-circle btn-lg ${isHandRaised ? 'btn-warning' : 'btn-ghost'}`}
              >
                <Hand size={24} />
              </button>
            )}

              <button
                onClick={handleLeave}
                className="btn btn-circle btn-lg btn-error"
              >
                <PhoneOff size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParticipantCard = ({ participant, isHost, isSpeaking, connectionQuality, onDemote }) => {
  const getQualityColor = () => {
    if (!connectionQuality) return 'bg-base-content/20';
    if (connectionQuality === 'excellent') return 'bg-success';
    if (connectionQuality === 'good') return 'bg-success';
    if (connectionQuality === 'fair') return 'bg-warning';
    return 'bg-error';
  };

  const getQualityBars = () => {
    if (!connectionQuality) return 1;
    if (connectionQuality === 'excellent') return 4;
    if (connectionQuality === 'good') return 3;
    if (connectionQuality === 'fair') return 2;
    return 1;
  };

  return (
    <div className={`card bg-gradient-to-br from-base-300 to-base-200 transition-all duration-200 hover:scale-105 ${
      isSpeaking ? 'ring-2 ring-primary shadow-xl shadow-primary/50 scale-105' : 'hover:shadow-lg'
    }`}>
      <div className="card-body p-4">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder relative">
            <div className={`rounded-full w-12 h-12 transition-all overflow-hidden ${
              isSpeaking ? 'ring-4 ring-primary ring-offset-2 ring-offset-base-300 scale-110' : ''
            }`}>
              {participant.profilePic ? (
                <img src={participant.profilePic} alt={participant.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="bg-gradient-to-br from-primary to-secondary text-primary-content w-full h-full flex items-center justify-center font-bold text-lg">
                  {participant.fullName?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            {isSpeaking && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full animate-pulse flex items-center justify-center shadow-lg">
                <Mic size={12} className="text-primary-content" />
              </div>
            )}
            <div className="absolute -top-1 -right-1 flex gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded-full transition-all ${
                    i < getQualityBars() ? getQualityColor() : 'bg-base-content/10'
                  }`}
                  style={{ height: `${(i + 1) * 3}px` }}
                />
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{participant.fullName || 'Unknown User'}</p>
            {isSpeaking ? (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex gap-0.5">
                  <div className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.6s' }}></div>
                  <div className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.6s' }}></div>
                  <div className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.6s' }}></div>
                </div>
                <span className="text-xs font-semibold text-primary">Speaking</span>
              </div>
            ) : (
              <p className="text-xs opacity-60 mt-1">Listening</p>
            )}
          </div>
        </div>
        {isHost && (
          <button onClick={onDemote} className="btn btn-xs btn-ghost mt-2 hover:btn-error">
            Remove Speaker
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomView;
