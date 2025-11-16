import Message from "../models/message.model.js";

export const getScheduledMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    const scheduledMessages = await Message.find({
      senderId: userId,
      isSent: false,
      scheduledFor: { $ne: null },
    })
      .populate("receiverId", "fullName profilePic")
      .sort({ scheduledFor: 1 });

    res.status(200).json(scheduledMessages);
  } catch (error) {
    console.error("Error in getScheduledMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelScheduledMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      senderId: userId,
      isSent: false,
    });

    if (!message) {
      return res.status(404).json({ error: "Scheduled message not found" });
    }

    await message.deleteOne();
    res.status(200).json({ message: "Scheduled message cancelled" });
  } catch (error) {
    console.error("Error in cancelScheduledMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
