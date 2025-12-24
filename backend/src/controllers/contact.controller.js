import Contact from "../models/contact.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import queryOptimizer from "../lib/queryOptimizer.js";
import cache from "../lib/cache.js";

// Send friend request
export const sendContactRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user._id;

    if (userId === requesterId.toString()) {
      return res.status(400).json({ error: "Cannot add yourself as contact" });
    }

    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if request already exists
    const existingRequest = await Contact.findOne({
      $or: [
        { requester: requesterId, recipient: userId },
        { requester: userId, recipient: requesterId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ error: "Contact request already exists" });
    }

    const contactRequest = new Contact({
      requester: requesterId,
      recipient: userId,
    });

    await contactRequest.save();
    await contactRequest.populate('requester', 'fullName profilePic');

    // Send real-time notification
    const recipientSocketId = getReceiverSocketId(userId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("contactRequest", contactRequest);
    }

    res.status(201).json(contactRequest);
  } catch (error) {
    console.error("Error in sendContactRequest:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Accept friend request
export const acceptContactRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const contactRequest = await Contact.findById(requestId);
    if (!contactRequest) {
      return res.status(404).json({ error: "Contact request not found" });
    }

    if (contactRequest.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    contactRequest.status = "accepted";
    await contactRequest.save();
    await contactRequest.populate(['requester', 'recipient'], 'fullName profilePic');

    // Invalidate caches (optional - won't fail if Redis is down)
    try {
      await Promise.all([
        cache.invalidateContacts(contactRequest.requester._id),
        cache.invalidateContacts(contactRequest.recipient._id)
      ]);
    } catch (cacheError) {
      console.warn('Cache invalidation failed:', cacheError.message);
    }

    // Notify both users
    const requesterSocketId = getReceiverSocketId(contactRequest.requester._id);
    const recipientSocketId = getReceiverSocketId(contactRequest.recipient._id);
    
    if (requesterSocketId) {
      io.to(requesterSocketId).emit("contactAccepted", contactRequest);
    }
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("contactAccepted", contactRequest);
    }

    res.status(200).json(contactRequest);
  } catch (error) {
    console.error("Error in acceptContactRequest:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reject friend request
export const rejectContactRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const contactRequest = await Contact.findById(requestId);
    if (!contactRequest) {
      return res.status(404).json({ error: "Contact request not found" });
    }

    if (contactRequest.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Contact.findByIdAndDelete(requestId);

    // Notify requester
    const requesterSocketId = getReceiverSocketId(contactRequest.requester);
    if (requesterSocketId) {
      io.to(requesterSocketId).emit("contactRejected", { requestId });
    }

    res.status(200).json({ message: "Contact request rejected" });
  } catch (error) {
    console.error("Error in rejectContactRequest:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all contacts
export const getContacts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { group } = req.query;

    const query = {
      $or: [
        { requester: userId, status: "accepted" },
        { recipient: userId, status: "accepted" }
      ]
    };

    if (group && group !== 'all') {
      query.group = group;
    }

    const contacts = await Contact.find(query)
      .populate('requester', 'fullName profilePic status bio')
      .populate('recipient', 'fullName profilePic status bio')
      .sort({ updatedAt: -1 });

    // Format contacts to show the other user
    const formattedContacts = contacts.map(contact => {
      const isRequester = contact.requester._id.toString() === userId.toString();
      const otherUser = isRequester ? contact.recipient : contact.requester;
      
      return {
        _id: contact._id,
        user: otherUser,
        group: contact.group,
        isFavorite: contact.isFavorite,
        nickname: contact.nickname,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      };
    });

    res.status(200).json(formattedContacts);
  } catch (error) {
    console.error("Error in getContacts:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get pending requests
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Contact.find({
      recipient: userId,
      status: "pending"
    }).populate('requester', 'fullName profilePic status bio');

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getPendingRequests:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get sent requests
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Contact.find({
      requester: userId,
      status: "pending"
    }).populate('recipient', 'fullName profilePic status bio');

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getSentRequests:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Remove contact
export const removeContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const isAuthorized = contact.requester.toString() === userId.toString() || 
                        contact.recipient.toString() === userId.toString();

    if (!isAuthorized) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Contact.findByIdAndDelete(contactId);

    // Notify the other user
    const otherUserId = contact.requester.toString() === userId.toString() 
      ? contact.recipient 
      : contact.requester;
    
    const otherUserSocketId = getReceiverSocketId(otherUserId);
    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit("contactRemoved", { contactId });
    }

    res.status(200).json({ message: "Contact removed successfully" });
  } catch (error) {
    console.error("Error in removeContact:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update contact (nickname, group, favorite)
export const updateContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { nickname, group, isFavorite } = req.body;
    const userId = req.user._id;

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const isAuthorized = contact.requester.toString() === userId.toString() || 
                        contact.recipient.toString() === userId.toString();

    if (!isAuthorized) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (nickname !== undefined) contact.nickname = nickname;
    if (group !== undefined) contact.group = group;
    if (isFavorite !== undefined) contact.isFavorite = isFavorite;

    await contact.save();
    await contact.populate(['requester', 'recipient'], 'fullName profilePic status bio');

    res.status(200).json(contact);
  } catch (error) {
    console.error("Error in updateContact:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Search users for adding contacts
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }

    // Get current user's blocked users and contacts
    const currentUser = await User.findById(userId);
    const blockedUsers = currentUser.blockedUsers || [];
    
    const existingContacts = await Contact.find({
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });

    const contactUserIds = existingContacts.map(contact => 
      contact.requester.toString() === userId.toString() 
        ? contact.recipient.toString() 
        : contact.requester.toString()
    );

    // Search users excluding self, blocked users, and existing contacts
    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        { _id: { $nin: blockedUsers } },
        { _id: { $nin: contactUserIds } },
        {
          $or: [
            { fullName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } }
          ]
        }
      ]
    }).select("fullName email profilePic status bio").limit(20);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get contact groups
export const getContactGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Contact.aggregate([
      {
        $match: {
          $or: [
            { requester: userId, status: "accepted" },
            { recipient: userId, status: "accepted" }
          ]
        }
      },
      {
        $group: {
          _id: "$group",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getContactGroups:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};