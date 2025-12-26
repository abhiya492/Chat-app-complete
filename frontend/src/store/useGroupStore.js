import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isLoading: false,

  // Fetch user's groups
  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error(error.response?.data?.error || "Failed to fetch groups");
    } finally {
      set({ isLoading: false });
    }
  },

  // Create new group
  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups", groupData);
      set((state) => ({ groups: [res.data, ...state.groups] }));
      toast.success("Group created successfully!");
      return res.data;
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.error || "Failed to create group");
      throw error;
    }
  },

  // Join group by invite code
  joinGroup: async (inviteCode) => {
    try {
      const res = await axiosInstance.post("/groups/join", { inviteCode });
      set((state) => ({ groups: [res.data, ...state.groups] }));
      toast.success("Joined group successfully!");
      return res.data;
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error(error.response?.data?.error || "Failed to join group");
      throw error;
    }
  },

  // Get group details
  getGroupDetails: async (groupId) => {
    try {
      const res = await axiosInstance.get(`/groups/${groupId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching group details:", error);
      toast.error(error.response?.data?.error || "Failed to fetch group details");
      throw error;
    }
  },

  // Update group settings
  updateGroup: async (groupId, updates) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, updates);
      set((state) => ({
        groups: state.groups.map((group) =>
          group._id === groupId ? { ...group, ...res.data } : group
        ),
      }));
      toast.success("Group updated successfully!");
      return res.data;
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error(error.response?.data?.error || "Failed to update group");
      throw error;
    }
  },

  // Add member to group
  addMember: async (groupId, userId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/members`, { userId });
      toast.success("Member added successfully!");
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error(error.response?.data?.error || "Failed to add member");
      throw error;
    }
  },

  // Remove member from group
  removeMember: async (groupId, userId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}/members/${userId}`);
      toast.success("Member removed successfully!");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error.response?.data?.error || "Failed to remove member");
      throw error;
    }
  },

  // Update member role
  updateMemberRole: async (groupId, userId, role) => {
    try {
      await axiosInstance.put(`/groups/${groupId}/members/${userId}/role`, { role });
      toast.success("Member role updated!");
    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error(error.response?.data?.error || "Failed to update role");
      throw error;
    }
  },

  // Delete group
  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      set((state) => ({
        groups: state.groups.filter((group) => group._id !== groupId),
      }));
      toast.success("Group deleted successfully!");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error(error.response?.data?.error || "Failed to delete group");
      throw error;
    }
  },

  // Fetch group messages
  fetchGroupMessages: async (groupId) => {
    try {
      const res = await axiosInstance.get(`/messages/group/${groupId}`);
      set({ groupMessages: res.data });
    } catch (error) {
      console.error("Error fetching group messages:", error);
      toast.error(error.response?.data?.error || "Failed to fetch messages");
    }
  },

  // Send group message
  sendGroupMessage: async (groupId, messageData) => {
    try {
      const res = await axiosInstance.post(`/messages/send/${groupId}?groupId=${groupId}`, messageData);
      set((state) => ({
        groupMessages: [...state.groupMessages, res.data],
      }));
      return res.data;
    } catch (error) {
      console.error("Error sending group message:", error);
      toast.error(error.response?.data?.error || "Failed to send message");
      throw error;
    }
  },

  // Set selected group
  setSelectedGroup: (group) => {
    set({ selectedGroup: group });
  },

  // Clear group messages
  clearGroupMessages: () => {
    set({ groupMessages: [] });
  },

  // Socket event handlers
  handleNewGroupMessage: (message) => {
    set((state) => ({
      groupMessages: [...state.groupMessages, message],
    }));
  },

  handleMemberAdded: (data) => {
    const { groupId, newMember } = data;
    set((state) => ({
      groups: state.groups.map((group) =>
        group._id === groupId
          ? { ...group, members: [...group.members, newMember] }
          : group
      ),
    }));
  },

  handleMemberRemoved: (data) => {
    const { groupId, removedUserId } = data;
    set((state) => ({
      groups: state.groups.map((group) =>
        group._id === groupId
          ? {
              ...group,
              members: group.members.filter(
                (member) => member.user._id !== removedUserId
              ),
            }
          : group
      ),
    }));
  },

  handleGroupDeleted: (data) => {
    const { groupId } = data;
    set((state) => ({
      groups: state.groups.filter((group) => group._id !== groupId),
    }));
  },
}));