import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { Readable } from "stream";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { updateStreak } from "./streak.controller.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const currentUser = await User.findById(loggedInUserId);
    const blockedUsers = currentUser.blockedUsers || [];
    
    const filteredUsers = await User.find({ 
      _id: { $ne: loggedInUserId, $nin: blockedUsers } 
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const myId = req.user._id;

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Message.countDocuments({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json({
      messages: messages.reverse(),
      hasMore: skip + messages.length < total,
      total
    });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file, replyTo, video, voice, disappearAfter } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    
    console.log('📨 Received:', { 
      hasText: !!text, 
      hasImage: !!image, 
      hasFile: !!file, 
      fileType: typeof file,
      hasVideo: !!video, 
      hasVoice: !!voice 
    });

    let imageUrl;
    if (image) {
      try {
        // Check base64 size (rough estimate: 1.37x actual file size)
        const sizeInBytes = (image.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 10) {
          return res.status(400).json({ error: "Image too large. Maximum size is 10MB" });
        }

        const uploadResponse = await cloudinary.uploader.upload(image, {
          resource_type: 'auto',
          folder: 'chat-files',
          timeout: 60000,
          max_file_size: 10485760 // 10MB
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError.message);
        return res.status(400).json({ 
          error: uploadError.message.includes('File size too large') 
            ? "Image too large. Please use a smaller image (max 10MB)" 
            : "Failed to upload image. Please try again."
        });
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
      try {
        console.log('🎤 Uploading voice, duration:', voice.duration);
        
        if (!voice.data || voice.data.length < 100) {
          return res.status(400).json({ error: "Voice recording is empty or too short" });
        }
        
        // Convert base64 to buffer
        const base64Data = voice.data.split(',')[1] || voice.data;
        const buffer = Buffer.from(base64Data, 'base64');
        console.log('📦 Buffer size:', buffer.length);
        
        // Upload using stream
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { 
              resource_type: "video",
              format: "webm",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          
          const bufferStream = Readable.from(buffer);
          bufferStream.pipe(uploadStream);
        });
        
        console.log('✅ Voice uploaded:', result.secure_url);
        voiceData = {
          url: result.secure_url,
          duration: voice.duration,
        };
      } catch (uploadError) {
        console.error('❌ Voice upload error:', uploadError);
        return res.status(400).json({ 
          error: "Failed to upload voice: " + (uploadError.message || "Unknown error")
        });
      }
    }

    let fileData;
    if (file) {
      // Check if file is already uploaded (has url) or needs upload
      if (file.url) {
        // Already uploaded, just use the data
        fileData = {
          url: file.url,
          name: file.name,
          size: file.size,
          type: file.type,
        };
      } else if (file.data) {
        // Needs upload
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
    }

    const messagePayload = {
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoData,
      voice: voiceData,
      file: fileData,
      replyTo: replyTo || null,
      disappearAfter: disappearAfter || null,
    };
    
    console.log('💾 Saving message:', {
      hasImage: !!imageUrl,
      hasFile: !!fileData,
      fileData: fileData ? JSON.stringify(fileData) : null
    });
    
    const newMessage = new Message(messagePayload);

    await newMessage.save();
    await newMessage.populate('replyTo');

    // Update streak
    const streak = await updateStreak(senderId, receiverId);

    const receiverSocketId = getReceiverSocketId(receiverId);
     if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
        if (streak) {
          io.to(receiverSocketId).emit("streakUpdated", streak);
        }
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

export const deleteChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    });

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.log("Error in deleteChat controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
