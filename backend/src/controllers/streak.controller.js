import Streak from "../models/streak.model.js";
import Message from "../models/message.model.js";

export const getStreak = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const [user1, user2] = [myId, userId].sort();
    
    let streak = await Streak.findOne({
      user1Id: user1,
      user2Id: user2,
    });

    if (!streak) {
      streak = { count: 0, isActive: false };
    }

    res.status(200).json(streak);
  } catch (error) {
    console.error("Error in getStreak:", error);
    res.status(500).json({ error: "Failed to get streak" });
  }
};

export const updateStreak = async (senderId, receiverId) => {
  try {
    const [user1, user2] = [senderId, receiverId].sort();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = await Streak.findOne({ user1Id: user1, user2Id: user2 });

    if (!streak) {
      streak = new Streak({
        user1Id: user1,
        user2Id: user2,
        count: 1,
        lastMessageDate: new Date(),
        isActive: true,
      });
    } else {
      const lastDate = new Date(streak.lastMessageDate);
      lastDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, no change
      } else if (diffDays === 1) {
        // Next day, increment
        streak.count += 1;
        streak.lastMessageDate = new Date();
        streak.isActive = true;
      } else {
        // Streak broken, reset
        streak.count = 1;
        streak.lastMessageDate = new Date();
        streak.isActive = true;
      }
    }

    await streak.save();
    return streak;
  } catch (error) {
    console.error("Error updating streak:", error);
  }
};
