import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file, replyTo, video, voice } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          resource_type: 'auto',
          folder: 'chat-files',
          timeout: 120000
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError.message);
        return res.status(400).json({ error: "Failed to upload image: " + uploadError.message });
      }
    }

    let videoData;
    if (video) {
      const uploadResponse = await cloudinary.uploader.upload(video.data, {
        resource_type: "video",
      });
      videoData = {
        url: uploadResponse.secure_url,
        thumbnail: uploadResponse.thumbnail_url,
        duration: video.duration,
      };
    }

    let voiceData;
    if (voice) {
      const uploadResponse = await cloudinary.uploader.upload(voice.data, {
        resource_type: "video",
      });
      voiceData = {
        url: uploadResponse.secure_url,
        duration: voice.duration,
      };
    }

    let fileData;
    if (file) {
      const uploadResponse = await cloudinary.uploader.upload(file.data, {
        resource_type: "auto",
      });
      fileData = {
        url: uploadResponse.secure_url,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoData,
      voice: voiceData,
      file: fileData,
      replyTo: replyTo || null,
    });

    await newMessage.save();
    await newMessage.populate('replyTo');

    const receiverSocketId = getReceiverSocketId(receiverId);
     if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
     }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const existingReaction = message.reactions.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingReaction) {
      existingReaction.emoji = emoji;
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    const senderSocketId = getReceiverSocketId(message.senderId.toString());
    
    [receiverSocketId, senderSocketId].forEach(socketId => {
      if (socketId) io.to(socketId).emit("messageReaction", message);
    });

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in addReaction controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    message.reactions = message.reactions.filter(
      (r) => r.userId.toString() !== userId.toString()
    );

    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    const senderSocketId = getReceiverSocketId(message.senderId.toString());
    
    [receiverSocketId, senderSocketId].forEach(socketId => {
      if (socketId) io.to(socketId).emit("messageReaction", message);
    });

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in removeReaction controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in editMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    message.isDeleted = true;
    message.text = "This message was deleted";
    message.image = null;
    message.file = null;
    message.video = null;
    message.voice = null;
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const alreadyRead = message.readBy.some(
      (r) => r.userId.toString() === userId.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({ userId, readAt: new Date() });
      await message.save();

      const senderSocketId = getReceiverSocketId(message.senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageRead", { messageId, userId });
      }
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in markAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const pinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    message.isPinned = !message.isPinned;
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    const senderSocketId = getReceiverSocketId(message.senderId.toString());
    
    [receiverSocketId, senderSocketId].forEach(socketId => {
      if (socketId) io.to(socketId).emit("messagePinned", message);
    });

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in pinMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const forwardMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { receiverIds } = req.body;
    const senderId = req.user._id;

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    const forwardedMessages = [];

    for (const receiverId of receiverIds) {
      const newMessage = new Message({
        senderId,
        receiverId,
        text: originalMessage.text,
        image: originalMessage.image,
        video: originalMessage.video,
        voice: originalMessage.voice,
        file: originalMessage.file,
      });

      await newMessage.save();
      forwardedMessages.push(newMessage);

      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    }

    res.status(201).json(forwardedMessages);
  } catch (error) {
    console.log("Error in forwardMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId },
      ],
      text: { $regex: query, $options: "i" },
      isDeleted: false,
    }).populate('senderId receiverId', 'fullName profilePic').sort({ createdAt: -1 }).limit(50);

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in searchMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPinnedMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      isPinned: true,
    }).sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getPinnedMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
