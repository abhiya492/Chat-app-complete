import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "./socket.js";
import { updateStreak } from "../controllers/streak.controller.js";

export const startMessageScheduler = () => {
  // Check every 30 seconds for scheduled messages
  setInterval(async () => {
    try {
      const now = new Date();
      const scheduledMessages = await Message.find({
        scheduledFor: { $lte: now },
        isSent: false,
      }).populate('replyTo');

      for (const message of scheduledMessages) {
        // Mark as sent
        message.isSent = true;
        message.scheduledFor = null;
        await message.save();

        // Update streak
        const streak = await updateStreak(message.senderId, message.receiverId);

        // Send via socket
        const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", message);
          if (streak) {
            io.to(receiverSocketId).emit("streakUpdated", streak);
          }
        }
      }
    } catch (error) {
      console.error("Scheduler error:", error);
    }
  }, 30000); // 30 seconds
};
