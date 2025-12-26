import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";
import { socketRateLimiter, SOCKET_LIMITS } from "../middleware/socketRateLimiter.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL] : ["http://localhost:5173"],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Store online users
const userSocketMap = {}; // {userId: socketId}

// Voice rooms storage
const activeRooms = new Map(); // roomId -> { participants, speakers, etc }

// Games storage
const activeGames = new Map(); // gameId -> game state

// Random Chat Queue
const randomChatQueue = [];
const activeRandomChats = new Map(); // sessionId -> {user1, user2}

// Game cleanup after 1 hour of inactivity
const GAME_TIMEOUT = 60 * 60 * 1000;

// Helper function to clean up old games
function cleanupGame(gameId) {
  const game = activeGames.get(gameId);
  if (game) {
    clearTimeout(game.timeoutId);
    activeGames.delete(gameId);
    io.to(`game:${gameId}`).emit("game:cleanup");
  }
}

// Helper function to initialize chess board
function initializeChessBoard() {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  board[0] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].map(piece => ({ type: piece, color: 'black' }));
  board[1] = Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' }));
  
  board[6] = Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' }));
  board[7] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].map(piece => ({ type: piece, color: 'white' }));
  
  return board;
}

// Helper function to validate chess move (basic validation)
function isValidChessMove(board, move, currentPlayer) {
  // Add your chess validation logic here
  // This is a placeholder - you should implement proper chess rules
  return true;
}

// Helper function to check tic-tac-toe winner
function checkTicTacToeWinner(board) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return board.every(cell => cell !== null) ? 'draw' : null;
}

// Helper function to determine RPS winner
function determineRPSWinner(move1, move2) {
  if (move1 === move2) return 'draw';
  
  const wins = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };
  
  return wins[move1] === move2 ? 'player1' : 'player2';
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ receiverId }) => {
    if (!socketRateLimiter.checkLimit(userId, 'typing', SOCKET_LIMITS['typing'].max, SOCKET_LIMITS['typing'].window)) {
      return;
    }
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", { userId });
    }
  });

  socket.on("markAsDelivered", ({ messageId, senderId }) => {
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDelivered", { messageId, userId });
    }
  });

  socket.on("markAsRead", ({ messageId, senderId }) => {
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageRead", { messageId, userId });
    }
  });

  // WebRTC signaling
  socket.on("call:offer", ({ offer, to, callId, type }) => {
    if (!socketRateLimiter.checkLimit(userId, 'call:offer', SOCKET_LIMITS['call:offer'].max, SOCKET_LIMITS['call:offer'].window)) {
      return socket.emit("error", { message: "Too many call attempts" });
    }
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:offer", { offer, from: userId, callId, type });
    }
  });

  socket.on("call:answer", ({ answer, to, callId }) => {
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call:answer", { answer, from: userId, callId });
    }
  });

  socket.on("call:ice-candidate", ({ candidate, to }) => {
    const targetSocketId = getReceiverSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call:ice-candidate", { candidate, from: userId });
    }
  });

  socket.on("call:end", ({ to, callId }) => {
    const targetSocketId = getReceiverSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call:ended", { from: userId, callId });
    }
  });

  // Voice Room Events
  socket.on("room:join", async ({ roomId }) => {
    if (!socketRateLimiter.checkLimit(userId, 'room:join', SOCKET_LIMITS['room:join'].max, SOCKET_LIMITS['room:join'].window)) {
      return socket.emit("room:error", { message: "Too many join attempts" });
    }
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, {
        participants: new Map(),
        speakers: new Set(),
        handRaised: new Set(),
      });
    }

    const room = activeRooms.get(roomId);
    
    if (room.participants.size >= 20) {
      return socket.emit("room:error", { message: "Room is full" });
    }

    const user = await User.findById(userId).select('fullName profilePic');
    
    socket.join(`room:${roomId}`);
    room.participants.set(userId, {
      userId,
      fullName: user?.fullName || 'Unknown',
      profilePic: user?.profilePic || '/avatar.png',
      socketId: socket.id,
      role: 'listener',
      isMuted: false,
      joinedAt: Date.now(),
    });

    const participants = Array.from(room.participants.values());
    io.to(`room:${roomId}`).emit("room:participant-joined", { userId, participants });
    socket.emit("room:state", { participants, speakers: Array.from(room.speakers) });
  });

  socket.on("room:leave", ({ roomId }) => {
    const room = activeRooms.get(roomId);
    if (room) {
      room.participants.delete(userId);
      room.speakers.delete(userId);
      room.handRaised.delete(userId);
      socket.leave(`room:${roomId}`);
      io.to(`room:${roomId}`).emit("room:participant-left", { userId });
      
      if (room.participants.size === 0) {
        activeRooms.delete(roomId);
      }
    }
  });

  socket.on("room:hand-raise", ({ roomId }) => {
    const room = activeRooms.get(roomId);
    if (room) {
      room.handRaised.add(userId);
      io.to(`room:${roomId}`).emit("room:hand-raised", { userId });
    }
  });

  socket.on("room:hand-lower", ({ roomId }) => {
    const room = activeRooms.get(roomId);
    if (room) {
      room.handRaised.delete(userId);
      io.to(`room:${roomId}`).emit("room:hand-lowered", { userId });
    }
  });

  socket.on("room:promote", ({ roomId, targetUserId }) => {
    const room = activeRooms.get(roomId);
    if (room && room.speakers.size < 6) {
      room.speakers.add(targetUserId);
      room.handRaised.delete(targetUserId);
      const participant = room.participants.get(targetUserId);
      if (participant) {
        participant.role = 'speaker';
      }
      io.to(`room:${roomId}`).emit("room:role-changed", { userId: targetUserId, role: 'speaker' });
    }
  });

  socket.on("room:demote", ({ roomId, targetUserId }) => {
    const room = activeRooms.get(roomId);
    if (room) {
      room.speakers.delete(targetUserId);
      const participant = room.participants.get(targetUserId);
      if (participant) {
        participant.role = 'listener';
      }
      io.to(`room:${roomId}`).emit("room:role-changed", { userId: targetUserId, role: 'listener' });
    }
  });

  socket.on("room:speaking", ({ roomId, isSpeaking }) => {
    io.to(`room:${roomId}`).emit("room:speaking-changed", { userId, isSpeaking });
  });

  // WebRTC signaling for rooms
  socket.on("room:webrtc:offer", ({ roomId, targetUserId, offer }) => {
    const targetSocket = userSocketMap[targetUserId];
    if (targetSocket) {
      io.to(targetSocket).emit("room:webrtc:offer", { fromUserId: userId, offer });
    }
  });

  socket.on("room:webrtc:answer", ({ roomId, targetUserId, answer }) => {
    const targetSocket = userSocketMap[targetUserId];
    if (targetSocket) {
      io.to(targetSocket).emit("room:webrtc:answer", { fromUserId: userId, answer });
    }
  });

  socket.on("room:webrtc:ice-candidate", ({ roomId, targetUserId, candidate }) => {
    const targetSocket = userSocketMap[targetUserId];
    if (targetSocket) {
      io.to(targetSocket).emit("room:webrtc:ice-candidate", { fromUserId: userId, candidate });
    }
  });

  // ========== TIC-TAC-TOE GAME (FIXED) ==========
  socket.on("game:invite", ({ chatId, gameId, hostId, hostName, invitedUserId }) => {
    if (!socketRateLimiter.checkLimit(userId, 'game:invite', SOCKET_LIMITS['game:invite'].max, SOCKET_LIMITS['game:invite'].window)) {
      return socket.emit("error", { message: "Too many game invites" });
    }
    const invitedSocket = getReceiverSocketId(invitedUserId);
    if (invitedSocket) {
      io.to(invitedSocket).emit("game:invite", {
        gameId,
        hostName,
        hostId
      });
    }
  });

  socket.on("game:invite-accept", ({ gameId, hostId, playerId }) => {
    const newBoard = Array(9).fill(null);
    
    // Create game state on server
    activeGames.set(gameId, {
      type: 'tictactoe',
      board: newBoard,
      players: {
        [hostId]: 'X',
        [playerId]: 'O'
      },
      currentPlayer: hostId,
      status: 'playing',
      createdAt: Date.now(),
      timeoutId: setTimeout(() => cleanupGame(gameId), GAME_TIMEOUT)
    });
    
    socket.join(`game:${gameId}`);
    const hostSocket = getReceiverSocketId(hostId);
    if (hostSocket) {
      const hostSocketObj = io.sockets.sockets.get(hostSocket);
      if (hostSocketObj) {
        hostSocketObj.join(`game:${gameId}`);
      }
      
      io.to(hostSocket).emit("game:start", {
        board: newBoard,
        gameId,
        yourSymbol: 'X'
      });
    }
    
    socket.emit("game:start", {
      board: newBoard,
      gameId,
      yourSymbol: 'O'
    });
  });

  socket.on("game:invite-decline", ({ hostId }) => {
    const hostSocket = getReceiverSocketId(hostId);
    if (hostSocket) {
      io.to(hostSocket).emit("game:invite-declined");
    }
  });

  socket.on("game:move", ({ gameId, position, playerId }) => {
    if (!socketRateLimiter.checkLimit(userId, 'game:move', SOCKET_LIMITS['game:move'].max, SOCKET_LIMITS['game:move'].window)) {
      return socket.emit("game:error", { message: "Too many moves" });
    }
    const game = activeGames.get(gameId);
    
    if (!game) {
      return socket.emit("game:error", { message: "Game not found" });
    }
    
    // Validate it's player's turn
    if (game.currentPlayer !== playerId) {
      return socket.emit("game:error", { message: "Not your turn" });
    }
    
    // Validate move
    if (game.board[position] !== null) {
      return socket.emit("game:error", { message: "Invalid move" });
    }
    
    // Make move
    game.board[position] = game.players[playerId];
    
    // Check winner
    const winner = checkTicTacToeWinner(game.board);
    
    if (winner) {
      game.status = 'finished';
      io.to(`game:${gameId}`).emit("game:over", { 
        board: game.board, 
        winner: winner === 'draw' ? 'tie' : game.players[playerId],
        gameId 
      });
      setTimeout(() => cleanupGame(gameId), 10000);
    } else {
      // Switch turns
      const players = Object.keys(game.players);
      game.currentPlayer = players.find(p => p !== playerId);
      
      io.to(`game:${gameId}`).emit("game:move", { 
        board: game.board, 
        currentPlayer: game.players[game.currentPlayer],
        gameId 
      });
    }
  });

  socket.on("game:leave", ({ gameId }) => {
    cleanupGame(gameId);
    io.to(`game:${gameId}`).emit("game:ended", { reason: "Player left" });
  });

  // ========== ROCK PAPER SCISSORS (FIXED) ==========
  socket.on("rps:invite", ({ chatId, hostId, hostName, invitedUserId }) => {
    const invitedSocket = getReceiverSocketId(invitedUserId);
    if (invitedSocket) {
      io.to(invitedSocket).emit("rps:invite", {
        hostName,
        hostId
      });
    }
  });

  socket.on("rps:invite-accept", ({ hostId, playerId }) => {
    const gameId = `rps_${Date.now()}`;
    
    // Create game state
    activeGames.set(gameId, {
      type: 'rps',
      players: {
        [hostId]: { move: null, ready: false },
        [playerId]: { move: null, ready: false }
      },
      round: 1,
      scores: { [hostId]: 0, [playerId]: 0 },
      status: 'playing',
      createdAt: Date.now(),
      timeoutId: setTimeout(() => cleanupGame(gameId), GAME_TIMEOUT)
    });
    
    socket.join(`rps:${gameId}`);
    const hostSocket = getReceiverSocketId(hostId);
    if (hostSocket) {
      const hostSocketObj = io.sockets.sockets.get(hostSocket);
      if (hostSocketObj) {
        hostSocketObj.join(`rps:${gameId}`);
      }
      
      io.to(hostSocket).emit("rps:invite-accepted", { gameId });
      io.to(hostSocket).emit("rps:game-start", { gameId, opponentId: playerId });
    }
    
    socket.emit("rps:game-start", { gameId, opponentId: hostId });
  });

  socket.on("rps:invite-decline", ({ hostId }) => {
    const hostSocket = getReceiverSocketId(hostId);
    if (hostSocket) {
      io.to(hostSocket).emit("rps:invite-declined");
    }
  });

  socket.on("rps:move", ({ gameId, move, playerId }) => {
    const game = activeGames.get(gameId);
    
    if (!game || game.type !== 'rps') {
      return socket.emit("game:error", { message: "Game not found" });
    }
    
    // Store player's secret move
    game.players[playerId].move = move;
    game.players[playerId].ready = true;
    
    // Notify opponent that player is ready (but not the move!)
    socket.to(`rps:${gameId}`).emit("rps:opponent-ready", { playerId });
    
    // Check if both players have moved
    const players = Object.keys(game.players);
    const bothReady = players.every(p => game.players[p].ready);
    
    if (bothReady) {
      const [player1, player2] = players;
      const move1 = game.players[player1].move;
      const move2 = game.players[player2].move;
      
      // Determine winner
      const result = determineRPSWinner(move1, move2);
      
      if (result === 'player1') {
        game.scores[player1]++;
      } else if (result === 'player2') {
        game.scores[player2]++;
      }
      
      // Send result to both players
      const winner = result === 'draw' ? 'draw' : (result === 'player1' ? player1 : player2);
      
      // Send to player1
      const player1Socket = getReceiverSocketId(player1);
      if (player1Socket) {
        io.to(player1Socket).emit("rps:result", { 
          moves: { [player1]: move1, [player2]: move2 },
          winner,
          scores: game.scores,
          round: game.round,
          opponentId: player2
        });
      }
      
      // Send to player2
      const player2Socket = getReceiverSocketId(player2);
      if (player2Socket) {
        io.to(player2Socket).emit("rps:result", { 
          moves: { [player1]: move1, [player2]: move2 },
          winner,
          scores: game.scores,
          round: game.round,
          opponentId: player1
        });
      }
      
      // Reset for next round
      game.round++;
      game.players[player1].move = null;
      game.players[player1].ready = false;
      game.players[player2].move = null;
      game.players[player2].ready = false;
      
      // Check if game is over (best of 5)
      if (game.scores[player1] >= 3 || game.scores[player2] >= 3) {
        game.status = 'finished';
        const winner = game.scores[player1] > game.scores[player2] ? player1 : player2;
        io.to(`rps:${gameId}`).emit("rps:game-over", { winner, scores: game.scores });
        setTimeout(() => cleanupGame(gameId), 10000);
      }
    }
  });

  socket.on("rps:leave", ({ gameId }) => {
    cleanupGame(gameId);
    io.to(`rps:${gameId}`).emit("rps:opponent-disconnected");
  });

  // ========== CHESS GAME (FIXED) ==========
  socket.on("chess:invite", ({ chatId, hostId, hostName, invitedUserId }) => {
    const invitedSocket = getReceiverSocketId(invitedUserId);
    if (invitedSocket) {
      io.to(invitedSocket).emit("chess:invite", {
        hostName,
        hostId
      });
    }
  });

  socket.on("chess:invite-accept", ({ hostId, playerId }) => {
    const gameId = `chess_${Date.now()}`;
    const initialBoard = initializeChessBoard();
    
    // Create game state on server
    activeGames.set(gameId, {
      type: 'chess',
      board: initialBoard,
      players: {
        white: hostId,
        black: playerId
      },
      currentPlayer: 'white',
      moveHistory: [],
      status: 'playing',
      createdAt: Date.now(),
      timeoutId: setTimeout(() => cleanupGame(gameId), GAME_TIMEOUT)
    });
    
    socket.join(`chess:${gameId}`);
    const hostSocket = getReceiverSocketId(hostId);
    if (hostSocket) {
      const hostSocketObj = io.sockets.sockets.get(hostSocket);
      if (hostSocketObj) {
        hostSocketObj.join(`chess:${gameId}`);
      }
      
      io.to(hostSocket).emit("chess:invite-accepted", { gameId });
      io.to(hostSocket).emit("chess:game-start", { 
        gameId, 
        yourColor: 'white',
        opponent: playerId,
        board: initialBoard,
        currentPlayer: 'white'
      });
    }
    
    socket.emit("chess:game-start", { 
      gameId, 
      yourColor: 'black',
      opponent: hostId,
      board: initialBoard,
      currentPlayer: 'white'
    });
  });

  socket.on("chess:invite-decline", ({ hostId }) => {
    const hostSocket = getReceiverSocketId(hostId);
    if (hostSocket) {
      io.to(hostSocket).emit("chess:invite-declined");
    }
  });

  socket.on("chess:move", ({ gameId, move }) => {
    const game = activeGames.get(gameId);
    
    if (!game || game.type !== 'chess') {
      return socket.emit("game:error", { message: "Game not found" });
    }
    
    // Validate it's the correct player's turn
    const playerColor = Object.entries(game.players).find(([color, id]) => id === userId)?.[0];
    
    if (playerColor !== game.currentPlayer) {
      return socket.emit("game:error", { message: "Not your turn" });
    }
    
    // Update game state
    game.board = move.board;
    game.moveHistory.push(move);
    game.currentPlayer = game.currentPlayer === 'white' ? 'black' : 'white';
    
    // Broadcast move to ALL players in room
    io.to(`chess:${gameId}`).emit("chess:move", { 
      board: game.board,
      move: move,
      currentPlayer: game.currentPlayer
    });
  });

  socket.on("chess:leave", ({ gameId }) => {
    cleanupGame(gameId);
    io.to(`chess:${gameId}`).emit("chess:opponent-disconnected");
  });

  socket.on("chess:game-end", ({ gameId, result, winner }) => {
    const game = activeGames.get(gameId);
    if (game) {
      game.status = 'finished';
      io.to(`chess:${gameId}`).emit("chess:game-end", { result, winner });
      setTimeout(() => cleanupGame(gameId), 10000);
    }
  });

  socket.on("chess:resign", ({ gameId }) => {
    const game = activeGames.get(gameId);
    if (game) {
      game.status = 'finished';
      io.to(`chess:${gameId}`).emit("chess:game-end", { 
        result: 'resign',
        winner: userId === game.players.white ? game.players.black : game.players.white
      });
      setTimeout(() => cleanupGame(gameId), 10000);
    }
  });

  // Cursor Share Events
  socket.on("cursor:start", ({ chatId }) => {
    socket.join(`cursor:${chatId}`);
  });

  socket.on("cursor:move", ({ chatId, userId, x, y, username }) => {
    if (!socketRateLimiter.checkLimit(userId, 'cursor:move', SOCKET_LIMITS['cursor:move'].max, SOCKET_LIMITS['cursor:move'].window)) {
      return;
    }
    socket.to(`cursor:${chatId}`).emit("cursor:move", { userId, x, y, username });
  });

  socket.on("cursor:leave", ({ chatId, userId }) => {
    socket.to(`cursor:${chatId}`).emit("cursor:leave", { userId });
    socket.leave(`cursor:${chatId}`);
  });

  // ========== RANDOM CHAT (OMEGLE-STYLE) ==========
  socket.on("random:join", async () => {
    console.log(`User ${userId} joining random chat queue`);
    
    // Check if already in queue
    if (randomChatQueue.includes(userId)) {
      return socket.emit("random:error", { message: "Already in queue" });
    }
    
    // Check if user has waiting partner
    if (randomChatQueue.length > 0) {
      const partnerId = randomChatQueue.shift();
      const sessionId = `random_${Date.now()}`;
      
      // Get user details
      const user = await User.findById(userId).select('fullName profilePic');
      const partner = await User.findById(partnerId).select('fullName profilePic');
      
      // Store active session
      activeRandomChats.set(sessionId, {
        user1: partnerId,  // First user (caller)
        user2: userId,     // Second user (receiver)
        startedAt: Date.now()
      });
      
      // Notify both users - partnerId is the CALLER, userId is the RECEIVER
      const partnerSocket = getReceiverSocketId(partnerId);
      if (partnerSocket) {
        io.to(partnerSocket).emit("random:matched", {
          sessionId,
          partner: { _id: userId, fullName: user?.fullName, profilePic: user?.profilePic },
          isCaller: true  // This user should send offer
        });
      }
      
      socket.emit("random:matched", {
        sessionId,
        partner: { _id: partnerId, fullName: partner?.fullName, profilePic: partner?.profilePic },
        isCaller: false  // This user should wait for offer
      });
      
      console.log(`Matched ${partnerId} (caller) with ${userId} (receiver)`);
    } else {
      // Add to queue
      randomChatQueue.push(userId);
      socket.emit("random:searching");
      console.log(`User ${userId} added to queue. Queue size: ${randomChatQueue.length}`);
    }
  });

  socket.on("random:skip", ({ sessionId }) => {
    const session = activeRandomChats.get(sessionId);
    if (session) {
      const partnerId = session.user1 === userId ? session.user2 : session.user1;
      const partnerSocket = getReceiverSocketId(partnerId);
      
      if (partnerSocket) {
        io.to(partnerSocket).emit("random:partner-skipped");
      }
      
      activeRandomChats.delete(sessionId);
      console.log(`Session ${sessionId} ended by skip`);
    }
  });

  socket.on("random:leave", ({ sessionId }) => {
    // Remove from queue if waiting
    const queueIndex = randomChatQueue.indexOf(userId);
    if (queueIndex > -1) {
      randomChatQueue.splice(queueIndex, 1);
    }
    
    // End active session
    if (sessionId) {
      const session = activeRandomChats.get(sessionId);
      if (session) {
        const partnerId = session.user1 === userId ? session.user2 : session.user1;
        const partnerSocket = getReceiverSocketId(partnerId);
        
        if (partnerSocket) {
          io.to(partnerSocket).emit("random:partner-left");
        }
        
        activeRandomChats.delete(sessionId);
      }
    }
  });

  socket.on("random:message", ({ sessionId, message }) => {
    if (!socketRateLimiter.checkLimit(userId, 'random:message', SOCKET_LIMITS['random:message'].max, SOCKET_LIMITS['random:message'].window)) {
      return socket.emit("error", { message: "Too many messages" });
    }
    const session = activeRandomChats.get(sessionId);
    if (session) {
      const partnerId = session.user1 === userId ? session.user2 : session.user1;
      const partnerSocket = getReceiverSocketId(partnerId);
      
      if (partnerSocket) {
        io.to(partnerSocket).emit("random:message", { message, from: userId });
      }
    }
  });

  // Contact Events
  socket.on("contact:request", ({ to, requestData }) => {
    const targetSocket = getReceiverSocketId(to);
    if (targetSocket) {
      io.to(targetSocket).emit("contact:request", requestData);
    }
  });

  socket.on("contact:accepted", ({ to, contactData }) => {
    const targetSocket = getReceiverSocketId(to);
    if (targetSocket) {
      io.to(targetSocket).emit("contact:accepted", contactData);
    }
  });

  socket.on("contact:rejected", ({ to, requestId }) => {
    const targetSocket = getReceiverSocketId(to);
    if (targetSocket) {
      io.to(targetSocket).emit("contact:rejected", { requestId });
    }
  });

  socket.on("contact:removed", ({ to, contactId }) => {
    const targetSocket = getReceiverSocketId(to);
    if (targetSocket) {
      io.to(targetSocket).emit("contact:removed", { contactId });
    }
  });

  // Challenge Events
  socket.on("challenge-invite", ({ to, challengeId, challengeName, from }) => {
    const targetSocket = getReceiverSocketId(to);
    if (targetSocket) {
      io.to(targetSocket).emit("challenge-invite", { challengeId, challengeName, from });
    }
  });

  socket.on("challenge-accept", ({ to, challengeId, data }) => {
    const targetSocket = getReceiverSocketId(to);
    if (targetSocket) {
      io.to(targetSocket).emit("challenge-accept", { challengeId, data });
    }
  });

  socket.on("challenge-decline", ({ to }) => {
    const targetSocket = getReceiverSocketId(to);
    if (targetSocket) {
      io.to(targetSocket).emit("challenge-decline");
    }
  });

  socket.on("challenge-cancel", ({ to }) => {
    const targetSocket = getReceiverSocketId(to);
    if (targetSocket) {
      io.to(targetSocket).emit("challenge-cancel");
    }
  });

  socket.on("challenge-update", ({ to, data }) => {
    const targetSocket = getReceiverSocketId(to);
    if (targetSocket) {
      io.to(targetSocket).emit("challenge-update", { data });
    }
  });

  socket.on("challenge-end", ({ to }) => {
    const targetSocket = getReceiverSocketId(to);
    if (targetSocket) {
      io.to(targetSocket).emit("challenge-end");
    }
  });

  // RPG Challenge Game Events
  socket.on("rpg:join", ({ gameRoomId }) => {
    socket.join(`rpg:${gameRoomId}`);
  });

  socket.on("rpg:action", ({ gameRoomId, action, data }) => {
    socket.to(`rpg:${gameRoomId}`).emit("rpg:action", { action, data, from: userId });
  });

  socket.on("rpg:dice-roll", ({ gameRoomId, result }) => {
    io.to(`rpg:${gameRoomId}`).emit("rpg:dice-roll", { result, from: userId });
  });

  socket.on("rpg:turn-end", ({ gameRoomId }) => {
    socket.to(`rpg:${gameRoomId}`).emit("rpg:turn-start");
  });

  socket.on("rpg:leave", ({ gameRoomId }) => {
    socket.to(`rpg:${gameRoomId}`).emit("rpg:opponent-left");
    socket.leave(`rpg:${gameRoomId}`);
  });

  // Battle Royale Game Events
  socket.on("battleRoyale:move", ({ playerId, position, isMoving }) => {
    socket.broadcast.emit("battleRoyale:playerMove", { playerId, position, isMoving });
  });

  socket.on("battleRoyale:shoot", ({ playerId, bulletId, targetId, start, end, damage }) => {
    socket.broadcast.emit("battleRoyale:playerShoot", { playerId, bulletId, targetId, start, end, damage });
  });

  socket.on("battleRoyale:hit", ({ playerId, health }) => {
    socket.broadcast.emit("battleRoyale:playerHit", { playerId, health });
  });

  // Location Sharing
  socket.on("request-location", ({ to }) => {
    const targetSocket = getReceiverSocketId(to);
    if (targetSocket) {
      io.to(targetSocket).emit("request-location", { from: userId });
    }
  });

  socket.on("share-location", ({ to, location }) => {
    const targetSocket = getReceiverSocketId(to);
    if (targetSocket) {
      io.to(targetSocket).emit("share-location", { location });
    }
  });

  // Wellness Events
  socket.on("wellness:mood-update", ({ mood }) => {
    // Broadcast mood to friends for wellness challenges
    socket.broadcast.emit("wellness:friend-mood", { userId, mood });
  });

  socket.on("wellness:break-taken", () => {
    // Notify friends about break for encouragement
    socket.broadcast.emit("wellness:friend-break", { userId });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
    // Remove from random chat queue
    const queueIndex = randomChatQueue.indexOf(userId);
    if (queueIndex > -1) {
      randomChatQueue.splice(queueIndex, 1);
    }
    
    // End active random chat sessions
    activeRandomChats.forEach((session, sessionId) => {
      if (session.user1 === userId || session.user2 === userId) {
        const partnerId = session.user1 === userId ? session.user2 : session.user1;
        const partnerSocket = getReceiverSocketId(partnerId);
        if (partnerSocket) {
          io.to(partnerSocket).emit("random:partner-disconnected");
        }
        activeRandomChats.delete(sessionId);
      }
    });
    
    // Remove from all rooms
    activeRooms.forEach((room, roomId) => {
      if (room.participants.has(userId)) {
        room.participants.delete(userId);
        room.speakers.delete(userId);
        room.handRaised.delete(userId);
        io.to(`room:${roomId}`).emit("room:participant-left", { userId });
        
        if (room.participants.size === 0) {
          activeRooms.delete(roomId);
        }
      }
    });
    
    // Handle disconnection from active games
    activeGames.forEach((game, gameId) => {
      if (game.type === 'chess' && (game.players.white === userId || game.players.black === userId)) {
        io.to(`chess:${gameId}`).emit("chess:opponent-disconnected", { userId });
        setTimeout(() => cleanupGame(gameId), 30000); // 30 second grace period
      } else if (game.type === 'tictactoe' && Object.keys(game.players).includes(userId)) {
        io.to(`game:${gameId}`).emit("game:opponent-disconnected", { userId });
        setTimeout(() => cleanupGame(gameId), 30000);
      } else if (game.type === 'rps' && Object.keys(game.players).includes(userId)) {
        io.to(`rps:${gameId}`).emit("rps:opponent-disconnected", { userId });
        setTimeout(() => cleanupGame(gameId), 30000);
      }
    });
    
    // Notify battle royale players of disconnection
    socket.broadcast.emit("battleRoyale:playerDisconnected", { playerId: userId });
  });
});

export { io, app, server };