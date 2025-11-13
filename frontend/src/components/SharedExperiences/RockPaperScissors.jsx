import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';

const RockPaperScissors = () => {
  const { authUser, socket } = useAuthStore();
  const [gameState, setGameState] = useState('waiting');
  const [playerMove, setPlayerMove] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState({ player: 0, opponent: 0 });
  const [gameId, setGameId] = useState(null);
  const [opponentId, setOpponentId] = useState(null);

  const moves = {
    rock: { emoji: '🪨', name: 'Rock' },
    paper: { emoji: '📄', name: 'Paper' },
    scissors: { emoji: '✂️', name: 'Scissors' }
  };

  const sendInvite = () => {
    const { selectedUser } = useChatStore.getState();
    if (!selectedUser || !socket) return;
    
    socket.emit('rps:invite', {
      chatId: selectedUser._id,
      hostId: authUser._id,
      hostName: authUser.fullName,
      invitedUserId: selectedUser._id
    });
    setGameState('inviting');
  };

  const acceptInvite = () => {
    socket?.emit('rps:invite-accept', {
      hostId: opponentId,
      playerId: authUser._id
    });
  };

  const declineInvite = () => {
    socket?.emit('rps:invite-decline', { hostId: opponentId });
    setGameState('waiting');
    setOpponentId(null);
  };

  const makeMove = (move) => {
    setPlayerMove(move);
    socket?.emit('rps:move', {
      gameId,
      move,
      playerId: authUser._id
    });
  };

  const resetRound = () => {
    setPlayerMove(null);
    setOpponentMove(null);
    setResult(null);
  };

  const resetGame = () => {
    if (gameId) {
      socket?.emit('rps:leave', { gameId });
    }
    setGameState('waiting');
    setPlayerMove(null);
    setOpponentMove(null);
    setResult(null);
    setScores({ player: 0, opponent: 0 });
    setGameId(null);
    setOpponentId(null);
  };

  useEffect(() => {
    if (!socket) return;
    
    socket.on('rps:invite', (data) => {
      setOpponentId(data.hostId);
      setGameState('invited');
    });

    socket.on('rps:game-start', (data) => {
      setGameState('playing');
      setGameId(data.gameId);
      setOpponentId(data.opponentId);
      setPlayerMove(null);
      setOpponentMove(null);
      setResult(null);
    });

    socket.on('rps:opponent-ready', () => {
      // Opponent made their move (but we don't know what it is yet)
    });

    socket.on('rps:result', (data) => {
      // Get moves from data
      const myMove = data.moves[authUser._id];
      const theirMove = data.moves[data.opponentId] || Object.values(data.moves).find(m => m !== myMove);
      
      setOpponentMove(theirMove);
      
      // Determine result from my perspective
      let myResult;
      if (data.winner === 'draw') {
        myResult = 'draw';
      } else if (data.winner === authUser._id) {
        myResult = 'win';
      } else {
        myResult = 'lose';
      }
      
      setResult(myResult);
      
      // Update scores from my perspective
      const myScore = data.scores[authUser._id] || 0;
      const opponentScore = data.scores[data.opponentId] || Object.values(data.scores).find(s => s !== myScore) || 0;
      setScores({ player: myScore, opponent: opponentScore });
    });

    socket.on('rps:game-over', (data) => {
      // Game finished (best of 5)
      setTimeout(() => {
        resetGame();
      }, 3000);
    });

    socket.on('rps:invite-declined', () => {
      setGameState('waiting');
      setOpponentId(null);
    });

    socket.on('rps:opponent-disconnected', () => {
      resetGame();
    });

    return () => {
      socket.off('rps:invite');
      socket.off('rps:game-start');
      socket.off('rps:opponent-ready');
      socket.off('rps:result');
      socket.off('rps:game-over');
      socket.off('rps:invite-declined');
      socket.off('rps:opponent-disconnected');
    };
  }, [socket, authUser._id]);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          🪨📄✂️ Rock Paper Scissors
        </h3>
        
        {(gameState === 'waiting' || gameState === 'inviting') && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendInvite}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {gameState === 'inviting' ? 'Invitation Sent...' : 'Challenge to RPS'}
          </motion.button>
        )}

        {gameState === 'invited' && (
          <div className="space-y-3">
            <p className="text-blue-700">RPS challenge received!</p>
            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={acceptInvite}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold"
              >
                Accept
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={declineInvite}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold"
              >
                Decline
              </motion.button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-700">Score: {scores.player} - {scores.opponent}</p>
            </div>

            <div className="flex justify-center gap-4">
              {Object.entries(moves).map(([key, move]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => makeMove(key)}
                  disabled={playerMove !== null}
                  className={`w-20 h-20 rounded-full text-4xl flex items-center justify-center transition-all duration-200 ${
                    playerMove === key
                      ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg'
                      : 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-blue-200 hover:to-purple-200'
                  } ${playerMove !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {move.emoji}
                </motion.button>
              ))}
            </div>

            {playerMove && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {opponentMove ? 'Round complete!' : 'Waiting for opponent...'}
                </p>
              </div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-3 p-4 bg-white/50 rounded-xl"
              >
                <div className="flex justify-center items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">You</p>
                    <div className="text-4xl">{moves[playerMove]?.emoji}</div>
                  </div>
                  <div className="text-2xl">VS</div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Opponent</p>
                    <div className="text-4xl">{moves[opponentMove]?.emoji}</div>
                  </div>
                </div>
                
                <p className="text-xl font-bold">
                  {result === 'win' ? '🎉 You Win!' : 
                   result === 'lose' ? '😔 You Lose!' : '🤝 Draw!'}
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetRound}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Next Round
                </motion.button>
              </motion.div>
            )}

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold text-sm"
              >
                End Game
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RockPaperScissors;