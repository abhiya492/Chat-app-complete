import { useState } from "react";
import { X, Send } from "lucide-react";
import { useChallengeStore } from "../store/useChallengeStore";
import toast from "react-hot-toast";

const ChallengeModal = ({ gameMode, players, onClose }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const { createChallenge, isLoading } = useChallengeStore();

  const handleChallenge = async () => {
    if (!selectedPlayer) {
      toast.error("Please select a player");
      return;
    }

    const result = await createChallenge(selectedPlayer._id, gameMode.id);
    if (result) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">{gameMode.icon}</span>
              {gameMode.name}
            </h2>
            <p className="text-sm text-base-content/70">{gameMode.desc}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold mb-3">Select Opponent:</h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player._id}
                onClick={() => setSelectedPlayer(player)}
                className={`card cursor-pointer transition-all ${
                  selectedPlayer?._id === player._id
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 hover:bg-base-300"
                }`}
              >
                <div className="card-body p-3 flex-row items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img src={player.profilePic || "/avatar.png"} alt={player.fullName} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{player.fullName}</h4>
                    <p className="text-xs opacity-70">
                      Level {player.stats?.level || 1} • {player.stats?.totalGames || 0} games
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {players.length === 0 && (
            <div className="text-center py-8 text-base-content/50">
              No players available
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-base-100 border-t border-base-300 p-4 flex gap-2">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={handleChallenge}
            disabled={!selectedPlayer || isLoading}
            className="btn btn-primary flex-1 gap-2"
          >
            {isLoading ? (
              <span className="loading loading-spinner" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Challenge
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;
