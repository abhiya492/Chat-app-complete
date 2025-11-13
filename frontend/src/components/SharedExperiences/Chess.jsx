import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { Maximize, X } from 'lucide-react';

/**
 * Optimized Chess Component
 * - Memoized Square components
 * - Cached king positions for fast isInCheck checks
 * - Simulated moves to ensure move legality (won't leave own king in check)
 * - Efficient board copying
 * - Pawn promotion (to queen)
 *
 * Note: This intentionally focuses on performance and correctness for normal play.
 * Castling and en-passant can be added later as modular features.
 */

/* Piece glyphs */
const PIECES = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
};

/* Helper: create a fresh board with distinct piece objects */
function createInitialBoard() {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  const back = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  board[0] = back.map(type => ({ type, color: 'black' }));
  board[1] = Array.from({ length: 8 }, () => ({ type: 'pawn', color: 'black' }));
  board[6] = Array.from({ length: 8 }, () => ({ type: 'pawn', color: 'white' }));
  board[7] = back.map(type => ({ type, color: 'white' }));

  return board;
}

/* Compute king positions for both colors from a board */
function computeKingPositions(board) {
  const kings = { white: null, black: null };
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'king') kings[p.color] = { row: r, col: c };
    }
  }
  return kings;
}

/* Deep copy board (rows and piece objects) */
function cloneBoard(board) {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

/* Directions & utility for path clearing */
const sign = x => (x > 0 ? 1 : x < 0 ? -1 : 0);

function isPathClear(fromRow, fromCol, toRow, toCol, board) {
  const rowStep = sign(toRow - fromRow);
  const colStep = sign(toCol - fromCol);

  let r = fromRow + rowStep;
  let c = fromCol + colStep;
  while (r !== toRow || c !== toCol) {
    if (board[r][c]) return false;
    r += rowStep;
    c += colStep;
  }
  return true;
}

/* Basic per-piece move generator (ignores king-safety) */
function rawValidMoveCheck(fromRow, fromCol, toRow, toCol, piece, board) {
  if (!piece) return false;
  if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
  const target = board[toRow][toCol];
  if (target && target.color === piece.color) return false;

  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;
  const absR = Math.abs(rowDiff);
  const absC = Math.abs(colDiff);

  switch (piece.type) {
    case 'pawn': {
      const dir = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;

      // forward
      if (colDiff === 0) {
        if (rowDiff === dir && !target) return true;
        if (fromRow === startRow && rowDiff === 2 * dir) {
          const midRow = fromRow + dir;
          if (!board[midRow][fromCol] && !target) return true;
        }
        return false;
      }
      // capture
      if (absC === 1 && rowDiff === dir && target && target.color !== piece.color) return true;
      return false;
    }

    case 'rook':
      if (rowDiff === 0 || colDiff === 0) return isPathClear(fromRow, fromCol, toRow, toCol, board);
      return false;

    case 'bishop':
      if (absR === absC) return isPathClear(fromRow, fromCol, toRow, toCol, board);
      return false;

    case 'queen':
      if (rowDiff === 0 || colDiff === 0 || absR === absC) return isPathClear(fromRow, fromCol, toRow, toCol, board);
      return false;

    case 'king':
      return absR <= 1 && absC <= 1;

    case 'knight':
      return (absR === 2 && absC === 1) || (absR === 1 && absC === 2);

    default:
      return false;
  }
}

/* Simulate a move and return the new board + updated king positions (no side-effects) */
function simulateMove(board, fromRow, fromCol, toRow, toCol, kingPositions) {
  const b = cloneBoard(board);
  const piece = b[fromRow][fromCol];
  if (!piece) return { board: b, kings: kingPositions }; // nothing

  const captured = b[toRow][toCol] ? { ...b[toRow][toCol] } : null;
  b[toRow][toCol] = piece;
  b[fromRow][fromCol] = null;

  // pawn promotion (auto to queen)
  if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
    b[toRow][toCol] = { ...b[toRow][toCol], type: 'queen' };
  }

  // update king positions if moved king
  const kings = { ...kingPositions };
  if (piece.type === 'king') kings[piece.color] = { row: toRow, col: toCol };

  return { board: b, kings };
}

/* Check if color's king is in check given king positions */
function isInCheckFromBoard(board, kings, color) {
  const king = kings[color];
  if (!king) return false;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color !== color) {
        if (rawValidMoveCheck(r, c, king.row, king.col, p, board)) return true;
      }
    }
  }
  return false;
}

/* Memoized square component (pure) */
const Square = React.memo(function Square({
  row,
  col,
  piece,
  isLight,
  isSelected,
  isMoveTarget,
  isFullscreen,
  onClick
}) {
  const sizeClass = isFullscreen ? 'w-12 h-12 text-4xl' : 'w-10 h-10 text-3xl';
  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => onClick(row, col)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${sizeClass} flex items-center justify-center cursor-pointer relative select-none
        ${isLight ? 'bg-amber-100' : 'bg-amber-600'}
        ${isSelected ? 'ring-4 ring-blue-400' : ''}
        ${isMoveTarget ? 'ring-2 ring-green-400' : ''}
        hover:brightness-110 transition-all duration-150
      `}
    >
      {piece ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>{PIECES[piece.color][piece.type]}</motion.span> : null}
      {isMoveTarget && !piece && <div className="w-3 h-3 bg-green-400 rounded-full opacity-60" />}
    </motion.div>
  );
});

/* Main component */
const Chess = () => {
  const { authUser, socket } = useAuthStore();
  const [gameState, setGameState] = useState({ status: 'waiting', gameId: null });
  const [board, setBoard] = useState(() => createInitialBoard());
  const [kings, setKings] = useState(() => computeKingPositions(createInitialBoard()));
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [playerColor, setPlayerColor] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]); // only for selectedSquare
  const [moveHistory, setMoveHistory] = useState([]);
  const [isCheck, setIsCheck] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* Keep stable socketRef if needed later; but we call socket?.emit directly for brevity */

  /* Efficiently compute whether current player is allowed to pick piece at row,col */
  const canSelectPiece = useCallback(
    (piece) => {
      if (!piece) return false;
      if (gameState.gameId === 'local') return piece.color === currentPlayer;
      return piece.color === playerColor;
    },
    [gameState.gameId, currentPlayer, playerColor]
  );

  /* Generate legal moves for a piece: rawValidMoveCheck + filter out leaving king in check */
  const getLegalMoves = useCallback(
    (fromRow, fromCol) => {
      const piece = board[fromRow][fromCol];
      if (!piece) return [];

      const moves = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (!rawValidMoveCheck(fromRow, fromCol, r, c, piece, board)) continue;
          // simulate move and check king safety
          const { board: simBoard, kings: simKings } = simulateMove(board, fromRow, fromCol, r, c, kings);
          const leavesKingInCheck = isInCheckFromBoard(simBoard, simKings, piece.color);
          if (!leavesKingInCheck) moves.push([r, c]);
        }
      }
      return moves;
    },
    [board, kings]
  );

  /* Handler: when user clicks a square */
  const handleSquareClick = useCallback(
    (row, col) => {
      if (gameState.status !== 'playing') return;
      if (gameState.gameId !== 'local' && currentPlayer !== playerColor) return;

      if (selectedSquare) {
        const [sr, sc] = selectedSquare;
        const canMove = validMoves.some(([r, c]) => r === row && c === col);
        if (canMove) {
          performMove(sr, sc, row, col);
          return;
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
          return;
        }
      }

      const piece = board[row][col];
      if (!piece || !canSelectPiece(piece)) return;
      const moves = getLegalMoves(row, col);
      setSelectedSquare([row, col]);
      setValidMoves(moves);
    },
    [gameState.status, gameState.gameId, currentPlayer, playerColor, selectedSquare, validMoves, board, getLegalMoves, canSelectPiece]
  );

  /* Core move execution (client-side) */
  const performMove = useCallback(
    (fromRow, fromCol, toRow, toCol) => {
      // clone & modify board
      const newBoard = cloneBoard(board);
      const piece = newBoard[fromRow][fromCol];
      if (!piece) return;

      // capture info for history
      const captured = newBoard[toRow][toCol] ? { ...newBoard[toRow][toCol] } : null;

      // move
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = null;

      // pawn promotion (to queen)
      if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
        newBoard[toRow][toCol] = { ...newBoard[toRow][toCol], type: 'queen' };
      }

      // update kings
      const newKings = { ...kings };
      if (piece.type === 'king') newKings[piece.color] = { row: toRow, col: toCol };

      // prepare move object
      const moveObj = {
        from: [fromRow, fromCol],
        to: [toRow, toCol],
        piece: piece.type,
        captured: captured?.type || null
      };

      // emit if remote
      if (gameState.gameId && gameState.gameId !== 'local') {
        socket?.emit('chess:move', {
          gameId: gameState.gameId,
          move: { ...moveObj, board: newBoard }
        });
      }

      // update state
      setBoard(newBoard);
      setKings(newKings);
      setMoveHistory(prev => [...prev, moveObj]);
      setSelectedSquare(null);
      setValidMoves([]);
      setCurrentPlayer(prev => (prev === 'white' ? 'black' : 'white'));

      // set check status for next player
      const nextColor = currentPlayer === 'white' ? 'black' : 'white';
      const check = isInCheckFromBoard(newBoard, newKings, nextColor);
      setIsCheck(check);

      // Basic checkmate detection (note: still not simulating all legal moves to fully confirm, but we can roughly infer)
      if (check) {
        // try to find any legal move for nextColor: we simulate only until we find one
        let foundAny = false;
        outer: for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = newBoard[r][c];
            if (!p || p.color !== nextColor) continue;
            // generate raw moves and test legality quickly
            for (let tr = 0; tr < 8; tr++) {
              for (let tc = 0; tc < 8; tc++) {
                if (!rawValidMoveCheck(r, c, tr, tc, p, newBoard)) continue;
                const { board: sB, kings: sK } = simulateMove(newBoard, r, c, tr, tc, newKings);
                if (!isInCheckFromBoard(sB, sK, nextColor)) {
                  foundAny = true;
                  break outer;
                }
              }
            }
          }
        }
        if (!foundAny) {
          // checkmate
          setGameResult(currentPlayer === playerColor ? 'win' : 'lose');
          setGameState({ status: 'finished', gameId: null });
        }
      }
    },
    [board, kings, gameState.gameId, currentPlayer, playerColor, socket]
  );

  /* Invite / accept / decline handlers (unchanged semantics) */
  const sendInvite = useCallback(() => {
    const { selectedUser } = useChatStore.getState();
    if (!selectedUser || !socket) return;
    socket.emit('chess:invite', {
      chatId: selectedUser._id,
      hostId: authUser._id,
      hostName: authUser.fullName,
      invitedUserId: selectedUser._id
    });
    setGameState({ status: 'inviting', gameId: null });
  }, [authUser, socket]);

  const acceptInvite = useCallback(() => {
    socket?.emit('chess:invite-accept', { hostId: opponent, playerId: authUser._id });
  }, [socket, opponent, authUser]);

  const declineInvite = useCallback(() => {
    socket?.emit('chess:invite-decline', { hostId: opponent });
    setGameState({ status: 'waiting', gameId: null });
  }, [socket, opponent]);

  const startLocalGame = useCallback(() => {
    const initBoard = createInitialBoard();
    setBoard(initBoard);
    setKings(computeKingPositions(initBoard));
    setCurrentPlayer('white');
    setSelectedSquare(null);
    setValidMoves([]);
    setGameState({ status: 'playing', gameId: 'local' });
    setPlayerColor('white');
    setGameResult(null);
    setMoveHistory([]);
    setIsCheck(false);
  }, []);

  const resetGame = useCallback(() => {
    if (gameState.gameId && gameState.gameId !== 'local') {
      socket?.emit('chess:leave', { gameId: gameState.gameId });
    }
    const initBoard = createInitialBoard();
    setBoard(initBoard);
    setKings(computeKingPositions(initBoard));
    setCurrentPlayer('white');
    setSelectedSquare(null);
    setValidMoves([]);
    setGameState({ status: 'waiting', gameId: null });
    setPlayerColor(null);
    setOpponent(null);
    setGameResult(null);
    setMoveHistory([]);
    setIsCheck(false);
  }, [gameState.gameId, socket]);

  /* Socket listeners: only set once when socket appears */
  useEffect(() => {
    if (!socket) return;

    const handleChessInvite = (data) => {
      setOpponent(data.hostId);
      setGameState({ status: 'invited', gameId: null });
    };

    const handleGameStart = (data) => {
      setGameState({ status: 'playing', gameId: data.gameId });
      setPlayerColor(data.yourColor);
      setOpponent(data.opponent);
      const initBoard = createInitialBoard();
      setBoard(initBoard);
      setKings(computeKingPositions(initBoard));
      setCurrentPlayer('white');
    };

    const handleMove = (data) => {
      // trust server board but compute kings from it
      setBoard(data.board);
      setKings(computeKingPositions(data.board));
      setCurrentPlayer(data.currentPlayer);
      setMoveHistory(prev => [...prev, data.move]);
      setSelectedSquare(null);
      setValidMoves([]);
    };

    const handleGameEnd = (data) => {
      setGameResult(data.result);
      setGameState({ status: 'finished', gameId: null });
    };

    const handleInviteDeclined = () => {
      setGameState({ status: 'waiting', gameId: null });
      setOpponent(null);
    };

    const handleOpponentDisconnected = () => {
      resetGame();
    };

    socket.on('chess:invite', handleChessInvite);
    socket.on('chess:game-start', handleGameStart);
    socket.on('chess:move', handleMove);
    socket.on('chess:game-end', handleGameEnd);
    socket.on('chess:invite-declined', handleInviteDeclined);
    socket.on('chess:opponent-disconnected', handleOpponentDisconnected);

    return () => {
      socket.off('chess:invite', handleChessInvite);
      socket.off('chess:game-start', handleGameStart);
      socket.off('chess:move', handleMove);
      socket.off('chess:game-end', handleGameEnd);
      socket.off('chess:invite-declined', handleInviteDeclined);
      socket.off('chess:opponent-disconnected', handleOpponentDisconnected);
    };
  }, [socket]);

  /* Precompute flattened board positions for rendering optimization (memoized) */
  const flatBoard = useMemo(() => board.map(row => row.map(cell => cell)), [board]); // shallow reference to board rows

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-50 bg-gradient-to-br from-amber-50 to-orange-100 p-4 overflow-auto'
    : 'p-6 bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-xl';

  return (
    <div className={containerClass}>
      {isFullscreen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-60 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <X size={20} />
        </motion.button>
      )}

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            ♔ Chess Game ♛
          </h3>
          {!isFullscreen && gameState.status === 'playing' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFullscreen(true)}
              className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center"
            >
              <Maximize size={16} />
            </motion.button>
          )}
        </div>

        {gameState.status === 'waiting' && (
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendInvite}
              disabled={!socket}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 mr-3"
            >
              {socket ? 'Invite Friend' : 'Connecting...'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startLocalGame}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Play Locally
            </motion.button>
          </div>
        )}

        {gameState.status === 'inviting' && <p className="text-amber-700">Invitation sent... waiting for response</p>}

        {gameState.status === 'invited' && (
          <div className="space-y-3">
            <p className="text-amber-700">Chess invitation received!</p>
            <div className="flex gap-3 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={acceptInvite} className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold">Accept</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={declineInvite} className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold">Decline</motion.button>
            </div>
          </div>
        )}

        {gameState.status === 'playing' && (
          <div className="space-y-2">
            {gameState.gameId !== 'local' && <p className="text-amber-700">You are playing as: <span className="font-bold">{playerColor}</span></p>}
            <p className="text-sm">
              Current turn: <span className="font-bold">{currentPlayer}</span>
              {isCheck && <span className="text-red-600 ml-2">CHECK!</span>}
            </p>
          </div>
        )}

        {gameState.status === 'finished' && (
          <div className="space-y-3">
            <p className="text-xl font-bold">{gameResult === 'win' ? '🎉 You Won!' : gameResult === 'lose' ? '😔 You Lost!' : '🤝 Draw!'}</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetGame} className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold">New Game</motion.button>
          </div>
        )}
      </div>

      {gameState.status === 'playing' && (
        <div className="flex justify-center">
          <div className={`grid grid-cols-8 gap-0 border-4 border-amber-800 rounded-lg overflow-hidden shadow-2xl ${isFullscreen ? 'w-96 h-96' : 'w-80 h-80'}`}>
            {flatBoard.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isLight = (rIdx + cIdx) % 2 === 0;
                const isSelected = selectedSquare && selectedSquare[0] === rIdx && selectedSquare[1] === cIdx;
                const isMoveTarget = validMoves.some(([mr, mc]) => mr === rIdx && mc === cIdx);
                return (
                  <Square
                    key={`${rIdx}-${cIdx}`}
                    row={rIdx}
                    col={cIdx}
                    piece={cell}
                    isLight={isLight}
                    isSelected={isSelected}
                    isMoveTarget={isMoveTarget}
                    isFullscreen={isFullscreen}
                    onClick={handleSquareClick}
                  />
                );
              })
            )}
          </div>
        </div>
      )}

      {moveHistory.length > 0 && (
        <div className="mt-4 max-h-32 overflow-y-auto">
          <h4 className="font-semibold text-amber-700 mb-2">Move History:</h4>
          <div className="text-sm space-y-1">
            {moveHistory.map((move, i) => (
              <div key={i} className="text-amber-600">
                {i + 1}. {move.piece} {String.fromCharCode(97 + move.from[1])}{8 - move.from[0]} → {String.fromCharCode(97 + move.to[1])}{8 - move.to[0]}
                {move.captured && ` (captured ${move.captured})`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chess;
