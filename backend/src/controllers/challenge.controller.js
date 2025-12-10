import Challenge from "../models/challenge.model.js";
import PlayerStats from "../models/playerStats.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const createChallenge = async (req, res) => {
  try {
    console.log("Creating challenge with body:", req.body);
    console.log("User:", req.user?._id);
    
    const { opponentId, gameMode } = req.body;
    const challengerId = req.user._id;

    if (!opponentId || !gameMode) {
      return res.status(400).json({ message: "Missing opponentId or gameMode" });
    }

    if (challengerId.toString() === opponentId) {
      return res.status(400).json({ message: "Cannot challenge yourself" });
    }

    const opponent = await User.findById(opponentId);
    if (!opponent) {
      return res.status(404).json({ message: "Opponent not found" });
    }

    console.log("Creating challenge:", { challengerId, opponentId, gameMode });
    
    const challenge = await Challenge.create({
      challengerId,
      opponentId,
      gameMode,
    });

    console.log("Challenge created:", challenge._id);

    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate("challengerId", "fullName profilePic")
      .populate("opponentId", "fullName profilePic");

    console.log("Challenge populated:", populatedChallenge);

    // Notify opponent via socket
    const opponentSocketId = getReceiverSocketId(opponentId);
    if (opponentSocketId) {
      io.to(opponentSocketId).emit("challenge:received", populatedChallenge);
    }

    res.status(201).json(populatedChallenge);
  } catch (error) {
    console.error("Error creating challenge:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const respondToChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { accept } = req.body;
    const userId = req.user._id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    if (challenge.opponentId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (challenge.status !== 'pending') {
      return res.status(400).json({ message: "Challenge already responded to" });
    }

    challenge.status = accept ? 'accepted' : 'declined';
    
    if (accept) {
      challenge.gameRoomId = `${challenge.gameMode}_${Date.now()}`;
      challenge.status = 'active';
    }

    await challenge.save();

    const populatedChallenge = await Challenge.findById(challengeId)
      .populate("challengerId", "fullName profilePic")
      .populate("opponentId", "fullName profilePic");

    // Notify challenger
    const challengerSocketId = getReceiverSocketId(challenge.challengerId.toString());
    if (challengerSocketId) {
      io.to(challengerSocketId).emit(
        accept ? "challenge:accepted" : "challenge:declined",
        populatedChallenge
      );
    }

    res.json(populatedChallenge);
  } catch (error) {
    console.error("Error responding to challenge:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPlayerStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    let stats = await PlayerStats.findOne({ userId });
    if (!stats) {
      stats = await PlayerStats.create({ userId });
    }

    res.json(stats);
  } catch (error) {
    console.error("Error getting player stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGameResult = async (req, res) => {
  try {
    const { challengeId, winnerId } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    challenge.status = 'completed';
    challenge.winner = winnerId;
    await challenge.save();

    // Update stats for both players
    const players = [challenge.challengerId, challenge.opponentId];
    
    for (const playerId of players) {
      let stats = await PlayerStats.findOne({ userId: playerId });
      if (!stats) {
        stats = await PlayerStats.create({ userId: playerId });
      }

      stats.totalGames += 1;
      stats.lastPlayed = new Date();
      
      // Initialize game mode stats if not exists
      if (!stats.gameModeStats[challenge.gameMode]) {
        stats.gameModeStats[challenge.gameMode] = { played: 0, wins: 0 };
      }
      
      stats.gameModeStats[challenge.gameMode].played += 1;

      if (winnerId && playerId.toString() === winnerId.toString()) {
        stats.wins += 1;
        stats.gameModeStats[challenge.gameMode].wins += 1;
        stats.xp += 50;
      } else if (winnerId) {
        stats.losses += 1;
        stats.xp += 10;
      } else {
        stats.draws += 1;
        stats.xp += 25;
      }

      // Level up logic
      const xpForNextLevel = stats.level * 100;
      if (stats.xp >= xpForNextLevel) {
        stats.level += 1;
        stats.xp = stats.xp - xpForNextLevel;
      }

      await stats.save();
    }

    res.json({ message: "Game result updated" });
  } catch (error) {
    console.error("Error updating game result:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOnlinePlayers = async (req, res) => {
  try {
    const { onlineUserIds } = req.body;
    
    const players = await User.find({
      _id: { $in: onlineUserIds, $ne: req.user._id }
    }).select("fullName profilePic");

    // Get stats for each player
    const playersWithStats = await Promise.all(
      players.map(async (player) => {
        let stats = await PlayerStats.findOne({ userId: player._id });
        if (!stats) {
          stats = await PlayerStats.create({ userId: player._id });
        }
        return {
          ...player.toObject(),
          stats: {
            level: stats.level,
            totalGames: stats.totalGames,
          },
        };
      })
    );

    res.json(playersWithStats);
  } catch (error) {
    console.error("Error getting online players:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
