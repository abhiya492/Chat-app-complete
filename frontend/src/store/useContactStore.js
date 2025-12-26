import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useContactStore = create((set, get) => ({
  contacts: [],
  pendingRequests: [],
  sentRequests: [],
  searchResults: [],
  isLoading: false,

  // Fetch contacts
  fetchContacts: async (group = null) => {
    set({ isLoading: true });
    try {
      const params = group ? `?group=${group}` : "";
      const res = await axiosInstance.get(`/contacts${params}`);
      set({ contacts: res.data });
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error(error.response?.data?.error || "Failed to fetch contacts");
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch pending requests
  fetchPendingRequests: async () => {
    try {
      const res = await axiosInstance.get("/contacts/pending");
      set({ pendingRequests: res.data });
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  },

  // Fetch sent requests
  fetchSentRequests: async () => {
    try {
      const res = await axiosInstance.get("/contacts/sent");
      set({ sentRequests: res.data });
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    }
  },

  // Search users with debouncing
  searchUsers: async (query) => {
    if (!query || query.length < 2) {
      set({ searchResults: [] });
      return;
    }

    try {
      const res = await axiosInstance.get(`/contacts/search?query=${encodeURIComponent(query)}`);
      set({ searchResults: res.data });
    } catch (error) {
      set({ searchResults: [] });
      if (error.response?.status !== 404) {
        toast.error("Search failed");
      }
    }
  },

  // Send contact request
  sendContactRequest: async (userId) => {
    try {
      const res = await axiosInstance.post(`/contacts/request/${userId}`);
      set((state) => ({
        sentRequests: [...state.sentRequests, res.data],
        searchResults: state.searchResults.filter(user => user._id !== userId),
      }));
      toast.success("Contact request sent!");
    } catch (error) {
      console.error("Error sending contact request:", error);
      toast.error(error.response?.data?.error || "Failed to send request");
      throw error;
    }
  },

  // Accept contact request
  acceptContactRequest: async (requestId) => {
    try {
      const res = await axiosInstance.put(`/contacts/accept/${requestId}`);
      set((state) => ({
        pendingRequests: state.pendingRequests.filter(req => req._id !== requestId),
        contacts: [...state.contacts, {
          _id: res.data._id,
          user: res.data.requester,
          group: res.data.group,
          isFavorite: res.data.isFavorite,
          nickname: res.data.nickname,
          createdAt: res.data.createdAt,
          updatedAt: res.data.updatedAt,
        }],
      }));
      toast.success("Contact request accepted!");
    } catch (error) {
      console.error("Error accepting contact request:", error);
      toast.error(error.response?.data?.error || "Failed to accept request");
      throw error;
    }
  },

  // Reject contact request
  rejectContactRequest: async (requestId) => {
    try {
      await axiosInstance.delete(`/contacts/reject/${requestId}`);
      set((state) => ({
        pendingRequests: state.pendingRequests.filter(req => req._id !== requestId),
      }));
      toast.success("Contact request rejected");
    } catch (error) {
      console.error("Error rejecting contact request:", error);
      toast.error(error.response?.data?.error || "Failed to reject request");
      throw error;
    }
  },

  // Remove contact
  removeContact: async (contactId) => {
    try {
      await axiosInstance.delete(`/contacts/${contactId}`);
      set((state) => ({
        contacts: state.contacts.filter(contact => contact._id !== contactId),
      }));
      toast.success("Contact removed");
    } catch (error) {
      console.error("Error removing contact:", error);
      toast.error(error.response?.data?.error || "Failed to remove contact");
      throw error;
    }
  },

  // Update contact
  updateContact: async (contactId, updates) => {
    try {
      const res = await axiosInstance.put(`/contacts/${contactId}`, updates);
      set((state) => ({
        contacts: state.contacts.map(contact =>
          contact._id === contactId ? { ...contact, ...updates } : contact
        ),
      }));
      toast.success("Contact updated!");
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error(error.response?.data?.error || "Failed to update contact");
      throw error;
    }
  },

  // Toggle favorite
  toggleFavorite: async (contactId, isFavorite) => {
    const optimisticUpdate = !isFavorite;
    
    // Optimistic update
    set((state) => ({
      contacts: state.contacts.map(contact =>
        contact._id === contactId ? { ...contact, isFavorite: optimisticUpdate } : contact
      ),
    }));
    
    try {
      await axiosInstance.put(`/contacts/${contactId}`, { isFavorite: optimisticUpdate });
    } catch (error) {
      // Revert on error
      set((state) => ({
        contacts: state.contacts.map(contact =>
          contact._id === contactId ? { ...contact, isFavorite } : contact
        ),
      }));
      toast.error("Failed to update favorite");
    }
  },

  // Update contact group
  updateContactGroup: async (contactId, group) => {
    try {
      await get().updateContact(contactId, { group });
    } catch (error) {
      console.error("Error updating contact group:", error);
    }
  },

  // Update contact nickname
  updateContactNickname: async (contactId, nickname) => {
    try {
      await get().updateContact(contactId, { nickname });
    } catch (error) {
      console.error("Error updating contact nickname:", error);
    }
  },

  // Get contact groups
  getContactGroups: async () => {
    try {
      const res = await axiosInstance.get("/contacts/groups");
      return res.data;
    } catch (error) {
      console.error("Error fetching contact groups:", error);
      return [];
    }
  },

  // Clear search results
  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  // Socket event handlers
  handleContactRequest: (request) => {
    set((state) => ({
      pendingRequests: [...state.pendingRequests, request],
    }));
    toast.success(`${request.requester.fullName} sent you a contact request`);
  },

  handleContactAccepted: (contact) => {
    set((state) => ({
      sentRequests: state.sentRequests.filter(req => req._id !== contact._id),
      contacts: [...state.contacts, {
        _id: contact._id,
        user: contact.recipient,
        group: contact.group,
        isFavorite: contact.isFavorite,
        nickname: contact.nickname,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      }],
    }));
    toast.success(`${contact.recipient.fullName} accepted your contact request!`);
  },

  handleContactRejected: (data) => {
    set((state) => ({
      sentRequests: state.sentRequests.filter(req => req._id !== data.requestId),
    }));
  },

  handleContactRemoved: (data) => {
    set((state) => ({
      contacts: state.contacts.filter(contact => contact._id !== data.contactId),
    }));
    toast.info("A contact was removed");
  },
}));