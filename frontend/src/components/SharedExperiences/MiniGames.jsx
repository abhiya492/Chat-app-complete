import { useState, useEffect } from "react";
// import { useSocketContext } from "../../context/SocketContext";
import { useAuthStore } from "../../store/useAuthStore";
import useSharedStore from "../../store/useSharedStore";
import { useChatStore } from "../../store/useChatStore";

const TicTacToe = ({ gameData, onMove, isMyTurn, mySymbol }) => {
  const board = gameData.state?.board || Array(9).fill(null);
  
  const handleClick = (index) => {
    if (board[index] || !isMyTurn || gameData.state?.winner) return;
    onMove(index);
  };

  const getWinnerLine = () => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return line;
      }
    }
    return null;
  };

  const winnerLine = getWinnerLine();

  return (
    <div className="space-y-4">
      <div className="text-center">
        {gameData.state?.winner ? (
          <div className="text-lg font-semibold">
            {gameData.state.winner === mySymbol ? "You won! 🎉" : "You lost 😢"}
          </div>
        ) : (
          <div className="text-sm">
            {isMyTurn ? "Your turn" : "Opponent's turn"} ({mySymbol})
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`
              aspect-square btn btn-outline text-2xl font-bold
              ${winnerLine?.includes(index) ? 'btn-success' : ''}
              ${!cell && isMyTurn && !gameData.state?.winner ? 'hover:btn-primary' : ''}
            `}
            onClick={() => handleClick(index)}
            disabled={!!cell || !isMyTurn || !!gameData.state?.winner}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
};

const MiniGames = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [mySymbol, setMySymbol] = useState(null);
  
  const { socket, authUser } = useAuthStore();
  const { selectedUser } = useChatStore();
  const { 
    currentExperience, 
    gameData, 
    updateGameData, 
    createExperience, 
    updateExperience 
  } = useSharedStore();

  useEffect(() => {
    if (!socket) return;

    socket.on("game:start", handleGameStart);
    socket.on("game:move", handleGameMove);
    socket.on("game:end", handleGameEnd);
    socket.on("game:join", handleGameJoin);

    return () => {
      socket.off("game:start");
      socket.off("game:move");
      socket.off("game:end");
      socket.off("game:join");
    };
  }, [socket]);

  const startGame = async (gameType) => {
    try {
      const initialState = getInitialGameState(gameType);
      initialState.players = { X: authUser._id, O: null };
      
      const experience = await createExperience("game", selectedUser._id, {
        gameType,
        gameState: initialState,
        currentPlayer: 'X'
      });
      
      setMySymbol('X'); // Host is always X
      updateGameData({
        type: gameType,
        state: initialState,
        currentPlayer: 'X'
      });
      
      socket.emit("game:start", {
        chatId: selectedUser._id,
        gameType,
        experienceId: experience._id
      });
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const getInitialGameState = (gameType) => {
    switch (gameType) {
      case 'tictactoe':
        return {
          board: Array(9).fill(null),
          currentPlayer: 'X',
          winner: null,
          players: { X: null, O: null }
        };
      default:
        return {};
    }
  };

  const makeMove = (position) => {
    if (!currentExperience || !mySymbol) return;
    
    const newState = { ...gameData.state };
    newState.board[position] = mySymbol;
    
    // Check for winner
    const winner = checkWinner(newState.board);
    if (winner) {
      newState.winner = winner;
    } else {
      // Switch turns
      newState.currentPlayer = mySymbol === 'X' ? 'O' : 'X';
    }
    
    updateGameData({ state: newState });
    
    socket.emit("game:move", {
      chatId: selectedUser._id,
      experienceId: currentExperience._id,
      move: { position, player: mySymbol },
      newState
    });
    
    updateExperience(currentExperience._id, { gameState: newState });
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
    
    if (board.every(cell => cell)) {
      return 'tie';
    }
    
    return null;
  };

  const handleGameStart = (data) => {
    if (!mySymbol) {
      setMySymbol('O'); // Second player is O
      // Update game state to show both players
      const newState = {
        ...gameData.state,
        players: { X: data.hostId, O: authUser._id },
        currentPlayer: 'X'
      };
      updateGameData({ state: newState });
    }
  };

  const handleGameMove = (data) => {
    updateGameData({ state: data.newState });
  };

  const handleGameEnd = (data) => {
    updateGameData({ 
      state: { ...gameData.state, winner: data.winner }
    });
  };

  const handleGameJoin = (data) => {
    // When someone joins the game
    if (mySymbol === 'X') {
      // Host updates state to include second player
      const newState = {
        ...gameData.state,
        players: { X: authUser._id, O: data.playerId },
        currentPlayer: 'X'
      };
      updateGameData({ state: newState });
      
      // Notify the joiner about current game state
      socket.emit("game:state", {
        chatId: selectedUser._id,
        gameState: newState,
        targetPlayer: data.playerId
      });
    }
  };

  const joinGame = () => {
    if (currentExperience && !mySymbol) {
      setMySymbol('O');
      socket.emit("game:join", {
        chatId: selectedUser._id,
        experienceId: currentExperience._id,
        playerId: authUser._id
      });
    }
  };

  const isMyTurn = gameData.state?.currentPlayer === mySymbol;

  return (
    <div className="p-4 bg-base-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        🎮 Mini Games
      </h3>
      
      {!currentExperience ? (
        <div className="space-y-4">
          <div className="text-center">
            <button 
              className="btn btn-primary"
              onClick={() => startGame('tictactoe')}
            >
              🎯 Start Tic-Tac-Toe
            </button>
          </div>
          <div className="text-sm text-base-content/60 text-center">
            Start a game and your friend can join!
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {!mySymbol ? (
            <div className="text-center space-y-4">
              <div className="text-lg">🎮 Game Available!</div>
              <button 
                className="btn btn-success"
                onClick={joinGame}
              >
                Join Game
              </button>
            </div>
          ) : (
            <>
              {gameData.type === 'tictactoe' && (
                <TicTacToe
                  gameData={gameData}
                  onMove={makeMove}
                  isMyTurn={isMyTurn}
                  mySymbol={mySymbol}
                />
              )}
              
              <div className="text-center">
                <button 
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setMySymbol(null);
                    updateGameData({ type: null, state: null });
                  }}
                >
                  Leave Game
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MiniGames;