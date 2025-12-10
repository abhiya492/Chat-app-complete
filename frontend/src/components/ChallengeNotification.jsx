import { useEffect } from "react";
import { useChallengeStore } from "../store/useChallengeStore";
import { X, Check } from "lucide-react";

const ChallengeNotification = () => {
  const { pendingChallenges, respondToChallenge, removePendingChallenge } = useChallengeStore();

  if (pendingChallenges.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {pendingChallenges.map((challenge) => (
        <div key={challenge._id} className="alert alert-info shadow-lg animate-in slide-in-from-right">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img 
                    src={challenge.challengerId.profilePic || "/avatar.png"} 
                    alt={challenge.challengerId.fullName} 
                  />
                </div>
              </div>
              <div>
                <h3 className="font-bold">🎮 Challenge Request!</h3>
                <p className="text-sm">
                  {challenge.challengerId.fullName} wants to play{" "}
                  <span className="font-semibold capitalize">{challenge.gameMode}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => respondToChallenge(challenge._id, true)}
              className="btn btn-success btn-sm gap-1"
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => respondToChallenge(challenge._id, false)}
              className="btn btn-error btn-sm gap-1"
            >
              <X className="w-4 h-4" />
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChallengeNotification;
