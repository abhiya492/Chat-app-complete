import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";

const SimpleGames = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [gameActive, setGameActive] = useState(false);
  const [mySymbol, setMySymbol] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [gameInvite, setGameInvite] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  
  const { socket, authUser } = useAuthStore();
  const { selectedUser } = useChatStore();

  useEffect(() => {
    if (!socket) return;

    socket.on("game:move", ({ board: newBoard, currentPlayer: nextPlayer, gameId: gId }) => {
      setBoard(newBoard);
      setCurrentPlayer(nextPlayer);
      setGameId(gId);
    });

    socket.on("game:over", ({ board: newBoard, winner: gameWinner }) => {
      setBoard(newBoard);
      setWinner(gameWinner);
    });

    socket.on("game:ended", () => {
      setGameActive(false);
      setMySymbol(null);
      setGameId(null);
      setBoard(Array(9).fill(null));
      setWinner(null);
      setCurrentPlayer('X');
    });

    socket.on("game:start", ({ board: newBoard, gameId: gId, yourSymbol }) => {
      setBoard(newBoard);
      setGameActive(true);
      setWinner(null);
      setCurrentPlayer('X');
      setGameId(gId);
      setMySymbol(yourSymbol);
      setShowInvite(false);
    });

    socket.on("game:invite", ({ gameId: gId, hostName, hostId }) => {
      setGameInvite({ gameId: gId, hostName, hostId });
      setShowInvite(true);
    });



    socket.on("game:invite-declined", () => {
      alert('Game invitation was declined');
    });

    return () => {
      socket.off("game:move");
      socket.off("game:over");
      socket.off("game:ended");
      socket.off("game:start");
      socket.off("game:invite");
      socket.off("game:invite-declined");
    };
  }, [socket, authUser._id]);

  const startGame = () => {
    const gId = `${selectedUser._id}_${Date.now()}`;
    setGameId(gId);
    
    // Send game invitation
    socket.emit("game:invite", {
      chatId: selectedUser._id,
      gameId: gId,
      hostId: authUser._id,
      hostName: authUser.fullName,
      invitedUserId: selectedUser._id
    });
  };

  const acceptInvite = () => {
    socket.emit("game:invite-accept", {
      gameId: gameInvite.gameId,
      hostId: gameInvite.hostId,
      playerId: authUser._id
    });
  };

  const declineInvite = () => {
    socket.emit("game:invite-decline", {
      gameId: gameInvite.gameId,
      hostId: gameInvite.hostId
    });
    setShowInvite(false);
    setGameInvite(null);
  };

  const makeMove = (index) => {
    if (board[index] || winner || currentPlayer !== mySymbol) return;
    
    const newBoard = [...board];
    newBoard[index] = mySymbol;
    
    const gameWinner = checkWinner(newBoard);
    const nextPlayer = mySymbol === 'X' ? 'O' : 'X';
    
    setBoard(newBoard);
    setCurrentPlayer(nextPlayer);
    if (gameWinner) setWinner(gameWinner);
    
    socket.emit("game:move", {
      gameId,
      position: index,
      playerId: authUser._id
    });
  };



  const checkWinner = (board) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    
    if (board.every(cell => cell)) return 'tie';
    return null;
  };

  return (
    <div className="p-4 bg-base-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🎮 Tic-Tac-Toe</h3>
      
      {showInvite && (
        <div className="bg-info/20 p-4 rounded-lg mb-4">
          <div className="text-center space-y-3">
            <div className="text-lg font-semibold">🎮 Game Invitation</div>
            <div className="text-sm">
              <span className="font-medium">{gameInvite?.hostName}</span> wants to play Tic-Tac-Toe with you!
            </div>
            <div className="flex gap-2 justify-center">
              <button className="btn btn-success btn-sm" onClick={acceptInvite}>
                ✓ Accept
              </button>
              <button className="btn btn-error btn-sm" onClick={declineInvite}>
                ✗ Decline
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!gameActive ? (
        <div className="text-center space-y-4">
          <button className="btn btn-primary" onClick={startGame}>
            🎯 Invite to Play
          </button>
          <div className="text-sm text-base-content/60">
            Send a game invitation to your friend!
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <>
              <div className="text-center">
                {winner ? (
                  <div className="text-lg font-bold">
                    {winner === 'tie' ? "It's a tie! 🤝" : 
                     winner === mySymbol ? "You won! 🎉" : "You lost! 😢"}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div>You are: <span className="font-bold text-primary">{mySymbol}</span></div>
                    <div className={currentPlayer === mySymbol ? "text-success font-bold" : "text-base-content/60"}>
                      {currentPlayer === mySymbol ? "Your turn!" : `Waiting for ${currentPlayer}...`}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
                {board.map((cell, index) => (
                  <button
                    key={index}
                    className={`aspect-square btn btn-outline text-2xl font-bold ${
                      currentPlayer === mySymbol && !cell && !winner ? 'hover:btn-primary' : ''
                    }`}
                    onClick={() => makeMove(index)}
                    disabled={!!cell || !!winner || currentPlayer !== mySymbol}
                  >
                    {cell}
                  </button>
                ))}
              </div>
              
              <div className="text-center">
                <button 
                  className="btn btn-sm btn-ghost" 
                  onClick={() => {
                    socket.emit("game:leave", { gameId });
                    setGameActive(false);
                    setMySymbol(null);
                    setGameId(null);
                    setBoard(Array(9).fill(null));
                    setWinner(null);
                    setCurrentPlayer('X');
                  }}
                >
                  Leave Game
                </button>
              </div>
            </>
        </div>
      )}
    </div>
  );
};

export default SimpleGames;