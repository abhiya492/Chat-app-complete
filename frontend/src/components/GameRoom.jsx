import { useAuthStore } from "../store/useAuthStore";
import { useChallengeStore } from "../store/useChallengeStore";
import { useGameProgressStore } from "../store/useGameProgressStore";
import { LogOut } from "lucide-react";
import FantasyGame3D from "./games/FantasyGame3D";
import TriviaGame from "./games/TriviaGame";
import StoryGame from "./games/StoryGame";
import ModernBattleGame from "./games/ModernBattleGame";
import FreeFireBattleRoyale from "./games/FreeFireBattleRoyale";

const GameRoom = ({ challenge }) => {
  const { authUser, socket } = useAuthStore();
  const { updateGameResult: updateChallengeResult } = useChallengeStore();
  const { updateGameResult } = useGameProgressStore();

  const opponent = challenge.challengerId._id === authUser._id 
    ? challenge.opponentId 
    : challenge.challengerId;

  const handleGameEnd = async (winnerId) => {
    const won = winnerId === authUser._id;
    await updateGameResult(challenge.gameMode, won, opponent._id);
    updateChallengeResult(challenge._id, winnerId);
  };

  const handleLeave = () => {
    socket.emit("rpg:leave", { gameRoomId: challenge.gameRoomId });
    updateGameResult(challenge._id, opponent._id);
  };

  const renderGame = () => {
    const gameProps = { challenge, authUser, opponent, socket, onGameEnd: handleGameEnd };
    
    try {
      switch (challenge.gameMode) {
        case 'battle_royale':
          return <FreeFireBattleRoyale {...gameProps} />;
        case 'fantasy':
          return <FantasyGame3D {...gameProps} />;
        case 'trivia':
          return <TriviaGame {...gameProps} />;
        case 'story':
          return <StoryGame {...gameProps} />;
        case 'scifi':
          return <ModernBattleGame {...gameProps} />;
        case 'mystery':
        case 'debate':
          return <FantasyGame3D {...gameProps} />;
        default:
          return <div className="text-center py-12">Game mode not implemented yet</div>;
      }
    } catch (error) {
      console.error('Error rendering game:', error);
      return (
        <div className="text-center py-12">
          <p className="text-error">Error loading game: {error.message}</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-200 shadow-xl mb-4">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold capitalize">{challenge.gameMode} Game</h2>
                <p className="text-sm text-base-content/70">vs {opponent.fullName}</p>
              </div>
              <button onClick={handleLeave} className="btn btn-error btn-sm gap-2">
                <LogOut className="w-4 h-4" />
                Leave
              </button>
            </div>
          </div>
        </div>

        {renderGame()}
      </div>
    </div>
  );
};

export default GameRoom;
