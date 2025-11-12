import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Create a new story
export const createStory = async (req, res) => {
  try {
    const { type, content, caption, duration, privacy, allowedViewers } = req.body;
    const userId = req.user._id;

    // Validate content based on type
    if (!type || !["image", "video", "text"].includes(type)) {
      return res.status(400).json({ error: "Invalid story type" });
    }

    let storyContent = {};

    if (type === "image" || type === "video") {
      if (!content?.data) {
        return res.status(400).json({ error: "Content data is required" });
      }

      // Upload to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(content.data, {
        resource_type: type === "video" ? "video" : "image",
        folder: "stories",
        transformation: type === "image" ? [
          { width: 1080, height: 1920, crop: "limit" }
        ] : undefined,
      });

      storyContent.url = uploadResponse.secure_url;
    } else if (type === "text") {
      if (!content?.text) {
        return res.status(400).json({ error: "Text content is required" });
      }
      storyContent = {
        text: content.text,
        backgroundColor: content.backgroundColor || "#000000",
        textColor: content.textColor || "#FFFFFF",
      };
    }

    // Set expiry to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = new Story({
      userId,
      type,
      content: storyContent,
      caption,
      duration: duration || 5,
      expiresAt,
      privacy: privacy || "contacts",
      allowedViewers: allowedViewers || [],
    });

    await story.save();
    await story.populate("userId", "fullName profilePic");

    // Notify contacts about new story
    const user = await User.findById(userId);
    const contacts = await User.find({ _id: { $ne: userId } }).select("_id");
    
    contacts.forEach((contact) => {
      const socketId = getReceiverSocketId(contact._id.toString());
      if (socketId) {
        io.to(socketId).emit("newStory", {
          storyId: story._id,
          userId: story.userId._id,
          userName: story.userId.fullName,
          userProfilePic: story.userId.profilePic,
        });
      }
    });

    res.status(201).json(story);
  } catch (error) {
    console.error("Error in createStory:", error);
    res.status(500).json({ error: "Failed to create story" });
  }
};

// Get all active stories from contacts
export const getStories = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's contacts (all users except blocked ones)
    const currentUser = await User.findById(userId);
    const blockedIds = currentUser.blockedUsers || [];

    // Find active stories from non-blocked users
    const stories = await Story.find({
      expiresAt: { $gt: new Date() },
      userId: { $nin: [...blockedIds, userId] },
    })
      .populate("userId", "fullName profilePic")
      .sort({ createdAt: -1 });

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.userId._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: {
            _id: story.userId._id,
            fullName: story.userId.fullName,
            profilePic: story.userId.profilePic,
          },
          stories: [],
          hasUnviewed: false,
        };
      }
      
      const hasViewed = story.views.some(
        (view) => view.userId.toString() === req.user._id.toString()
      );
      
      if (!hasViewed) {
        acc[userId].hasUnviewed = true;
      }
      
      acc[userId].stories.push({
        _id: story._id,
        type: story.type,
        content: story.content,
        caption: story.caption,
        duration: story.duration,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
        viewsCount: story.views.length,
        hasViewed,
      });
      
      return acc;
    }, {});

    // Convert to array and sort by unviewed first
    const result = Object.values(groupedStories).sort((a, b) => {
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getStories:", error);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
};

// Get user's own stories
export const getMyStories = async (req, res) => {
  try {
    const userId = req.user._id;

    const stories = await Story.find({
      userId,
      expiresAt: { $gt: new Date() },
    })
      .populate("views.userId", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (error) {
    console.error("Error in getMyStories:", error);
    res.status(500).json({ error: "Failed to fetch your stories" });
  }
};

// View a story
export const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    // Check if already viewed
    const alreadyViewed = story.views.some(
      (view) => view.userId.toString() === userId.toString()
    );

    if (!alreadyViewed) {
      story.views.push({ userId, viewedAt: new Date() });
      await story.save();

      // Notify story owner
      const ownerSocketId = getReceiverSocketId(story.userId.toString());
      if (ownerSocketId) {
        const viewer = await User.findById(userId).select("fullName profilePic");
        io.to(ownerSocketId).emit("storyViewed", {
          storyId: story._id,
          viewer: {
            _id: viewer._id,
            fullName: viewer.fullName,
            profilePic: viewer.profilePic,
          },
          viewedAt: new Date(),
        });
      }
    }

    res.status(200).json({ message: "Story viewed" });
  } catch (error) {
    console.error("Error in viewStory:", error);
    res.status(500).json({ error: "Failed to view story" });
  }
};

// Delete a story
export const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    if (story.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete from Cloudinary if it's media
    if (story.type !== "text" && story.content.url) {
      const publicId = story.content.url.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(`stories/${publicId}`, {
        resource_type: story.type === "video" ? "video" : "image",
      });
    }

    await Story.findByIdAndDelete(storyId);

    res.status(200).json({ message: "Story deleted" });
  } catch (error) {
    console.error("Error in deleteStory:", error);
    res.status(500).json({ error: "Failed to delete story" });
  }
};

// Get story viewers
export const getStoryViewers = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(storyId).populate(
      "views.userId",
      "fullName profilePic"
    );

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    if (story.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.status(200).json(story.views);
  } catch (error) {
    console.error("Error in getStoryViewers:", error);
    res.status(500).json({ error: "Failed to fetch viewers" });
  }
};
