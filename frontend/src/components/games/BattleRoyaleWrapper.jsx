import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import FreeFireBattleRoyale from "./FreeFireBattleRoyale";
import toast from "react-hot-toast";

const BattleRoyaleWrapper = () => {
  const { authUser, socket } = useAuthStore();
  const { selectedUser } = useChatStore();
  const [gameActive, setGameActive] = useState(false);
  const [challenge, setChallenge] = useState(null);

  const startBattleRoyale = () => {
    if (!selectedUser || !socket) return;
    
    const challengeData = {
      challengerId: { _id: authUser._id, fullName: authUser.fullName },
      opponentId: { _id: selectedUser._id, fullName: selectedUser.fullName },
      gameRoomId: `battle_${authUser._id}_${selectedUser._id}_${Date.now()}`,
      gameType: 'battle_royale'
    };
    
    setChallenge(challengeData);
    setGameActive(true);
    
    // Emit challenge to opponent
    socket.emit("battle:challenge", {
      to: selectedUser._id,
      challenge: challengeData
    });
    
    toast.success("🔥 Battle Royale Started!");
  };

  const endGame = (winner) => {
    setGameActive(false);
    setChallenge(null);
    
    if (socket && challenge) {
      socket.emit("battle:end", {
        gameRoomId: challenge.gameRoomId,
        winner
      });
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("battle:challenge", (data) => {
      setChallenge(data.challenge);
      setGameActive(true);
      toast.success("🔥 Battle Royale Challenge Received!");
    });

    socket.on("battle:end", () => {
      setGameActive(false);
      setChallenge(null);
    });

    return () => {
      socket.off("battle:challenge");
      socket.off("battle:end");
    };
  }, [socket]);

  if (gameActive && challenge) {
    return (
      <FreeFireBattleRoyale
        challenge={challenge}
        authUser={authUser}
        opponent={selectedUser}
        socket={socket}
        onGameEnd={endGame}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="text-6xl mb-4">🔥</div>
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
        FREE FIRE BATTLE ROYALE
      </h2>
      <p className="text-center text-gray-600 max-w-md">
        Challenge {selectedUser?.fullName} to an epic 3D battle royale! 
        Choose your character, pick up weapons, and fight to be the last one standing!
      </p>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-md text-sm">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3 rounded-lg">
          <div className="font-bold text-blue-400">🎭 Features</div>
          <div className="text-xs mt-1">Character Selection, Weapon Pickups, 3D Graphics</div>
        </div>
        <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 p-3 rounded-lg">
          <div className="font-bold text-green-400">⚡ Real-time</div>
          <div className="text-xs mt-1">Physics, Animations, Explosions</div>
        </div>
      </div>
      
      <button
        onClick={startBattleRoyale}
        disabled={!selectedUser}
        className="btn btn-lg bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🔥 START BATTLE ROYALE 🔥
      </button>
      
      {!selectedUser && (
        <p className="text-xs text-gray-500 text-center">
          Select a user to challenge them to battle!
        </p>
      )}
    </div>
  );
};

export default BattleRoyaleWrapper;