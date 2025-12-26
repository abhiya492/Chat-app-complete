import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Create group
export const createGroup = async (req, res) => {
  try {
    const { name, description, isPrivate = false } = req.body;
    const adminId = req.user._id;

    const group = new Group({
      name,
      description,
      admin: adminId,
      members: [{ user: adminId, role: "admin" }],
      settings: { isPrivate },
    });

    await group.save();
    await group.populate("members.user", "fullName profilePic");

    res.status(201).json(group);
  } catch (error) {
    console.error("Error in createGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user's groups
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      "members.user": userId,
    })
      .populate("members.user", "fullName profilePic")
      .populate("lastMessage")
      .sort({ lastActivity: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get group details
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId)
      .populate("members.user", "fullName profilePic status")
      .populate("admin", "fullName profilePic");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some(
      (member) => member.user._id.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: "Not a group member" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in getGroupDetails:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add member to group
export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const requesterMember = group.members.find(
      (member) => member.user.toString() === requesterId.toString()
    );

    if (!requesterMember || (requesterMember.role === "member" && !group.settings.allowMemberInvites)) {
      return res.status(403).json({ error: "Not authorized to add members" });
    }

    const isAlreadyMember = group.members.some(
      (member) => member.user.toString() === userId
    );

    if (isAlreadyMember) {
      return res.status(400).json({ error: "User is already a member" });
    }

    if (group.members.length >= group.settings.maxMembers) {
      return res.status(400).json({ error: "Group is full" });
    }

    group.members.push({ user: userId, role: "member" });
    await group.save();
    await group.populate("members.user", "fullName profilePic");

    // Notify new member
    const newMemberSocketId = getReceiverSocketId(userId);
    if (newMemberSocketId) {
      io.to(newMemberSocketId).emit("addedToGroup", group);
    }

    // Notify all group members
    group.members.forEach((member) => {
      const socketId = getReceiverSocketId(member.user._id);
      if (socketId) {
        io.to(socketId).emit("memberAdded", { groupId, newMember: { user: userId } });
      }
    });

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in addMember:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Remove member from group
export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const requesterMember = group.members.find(
      (member) => member.user.toString() === requesterId.toString()
    );

    const targetMember = group.members.find(
      (member) => member.user.toString() === userId
    );

    if (!targetMember) {
      return res.status(404).json({ error: "User is not a member" });
    }

    // Check permissions
    const canRemove = 
      requesterId.toString() === userId || // Self removal
      requesterMember?.role === "admin" || 
      (requesterMember?.role === "moderator" && targetMember.role === "member");

    if (!canRemove) {
      return res.status(403).json({ error: "Not authorized to remove this member" });
    }

    group.members = group.members.filter(
      (member) => member.user.toString() !== userId
    );

    await group.save();

    // Notify removed member
    const removedMemberSocketId = getReceiverSocketId(userId);
    if (removedMemberSocketId) {
      io.to(removedMemberSocketId).emit("removedFromGroup", { groupId });
    }

    // Notify remaining members
    group.members.forEach((member) => {
      const socketId = getReceiverSocketId(member.user._id);
      if (socketId) {
        io.to(socketId).emit("memberRemoved", { groupId, removedUserId: userId });
      }
    });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error in removeMember:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update member role
export const updateMemberRole = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { role } = req.body;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const requesterMember = group.members.find(
      (member) => member.user.toString() === requesterId.toString()
    );

    if (requesterMember?.role !== "admin") {
      return res.status(403).json({ error: "Only admins can change roles" });
    }

    const targetMember = group.members.find(
      (member) => member.user.toString() === userId
    );

    if (!targetMember) {
      return res.status(404).json({ error: "User is not a member" });
    }

    targetMember.role = role;
    await group.save();

    res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    console.error("Error in updateMemberRole:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Join group by invite code
export const joinByInviteCode = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user._id;

    const group = await Group.findOne({ inviteCode });
    if (!group) {
      return res.status(404).json({ error: "Invalid invite code" });
    }

    const isAlreadyMember = group.members.some(
      (member) => member.user.toString() === userId.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ error: "Already a member" });
    }

    if (group.members.length >= group.settings.maxMembers) {
      return res.status(400).json({ error: "Group is full" });
    }

    group.members.push({ user: userId, role: "member" });
    await group.save();
    await group.populate("members.user", "fullName profilePic");

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in joinByInviteCode:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update group settings
export const updateGroupSettings = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, avatar, settings } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const member = group.members.find(
      (member) => member.user.toString() === userId.toString()
    );

    if (!member || member.role === "member") {
      return res.status(403).json({ error: "Not authorized to update group" });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (avatar !== undefined) group.avatar = avatar;
    if (settings) {
      group.settings = { ...group.settings, ...settings };
    }

    await group.save();

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in updateGroupSettings:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only admin can delete group" });
    }

    // Delete all group messages
    await Message.deleteMany({ groupId });

    // Delete group
    await Group.findByIdAndDelete(groupId);

    // Notify all members
    group.members.forEach((member) => {
      const socketId = getReceiverSocketId(member.user);
      if (socketId) {
        io.to(socketId).emit("groupDeleted", { groupId });
      }
    });

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};