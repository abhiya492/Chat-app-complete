import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useContactStore = create((set, get) => ({
  contacts: [],
  pendingRequests: [],
  sentRequests: [],
  contactGroups: [],
  searchResults: [],
  isLoading: false,
  isSearching: false,

  // Get all contacts
  getContacts: async (group = 'all') => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/contacts?group=${group}`);
      set({ contacts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch contacts");
    } finally {
      set({ isLoading: false });
    }
  },

  // Get pending requests
  getPendingRequests: async () => {
    try {
      const res = await axiosInstance.get("/contacts/pending");
      set({ pendingRequests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch pending requests");
    }
  },

  // Get sent requests
  getSentRequests: async () => {
    try {
      const res = await axiosInstance.get("/contacts/sent");
      set({ sentRequests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch sent requests");
    }
  },

  // Get contact groups
  getContactGroups: async () => {
    try {
      const res = await axiosInstance.get("/contacts/groups");
      set({ contactGroups: res.data });
    } catch (error) {
      console.error("Failed to fetch contact groups:", error);
    }
  },

  // Search users
  searchUsers: async (query) => {
    if (!query || query.trim().length < 2) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearching: true });
    try {
      const res = await axiosInstance.get(`/contacts/search?query=${encodeURIComponent(query)}`);
      set({ searchResults: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to search users");
      set({ searchResults: [] });
    } finally {
      set({ isSearching: false });
    }
  },

  // Send contact request
  sendContactRequest: async (userId) => {
    try {
      const res = await axiosInstance.post(`/contacts/request/${userId}`);
      
      // Add to sent requests
      const { sentRequests } = get();
      set({ sentRequests: [...sentRequests, res.data] });
      
      // Remove from search results
      const { searchResults } = get();
      set({ searchResults: searchResults.filter(user => user._id !== userId) });
      
      toast.success("Contact request sent!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send contact request");
      throw error;
    }
  },

  // Accept contact request
  acceptContactRequest: async (requestId) => {
    try {
      const res = await axiosInstance.put(`/contacts/accept/${requestId}`);
      
      // Remove from pending requests
      const { pendingRequests, contacts } = get();
      const updatedPending = pendingRequests.filter(req => req._id !== requestId);
      
      // Add to contacts
      const newContact = {
        _id: res.data._id,
        user: res.data.requester,
        group: res.data.group,
        isFavorite: res.data.isFavorite,
        nickname: res.data.nickname,
        createdAt: res.data.createdAt,
        updatedAt: res.data.updatedAt,
      };
      
      set({ 
        pendingRequests: updatedPending,
        contacts: [...contacts, newContact]
      });
      
      toast.success("Contact request accepted!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to accept contact request");
      throw error;
    }
  },

  // Reject contact request
  rejectContactRequest: async (requestId) => {
    try {
      await axiosInstance.delete(`/contacts/reject/${requestId}`);
      
      // Remove from pending requests
      const { pendingRequests } = get();
      set({ pendingRequests: pendingRequests.filter(req => req._id !== requestId) });
      
      toast.success("Contact request rejected");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject contact request");
      throw error;
    }
  },

  // Remove contact
  removeContact: async (contactId) => {
    try {
      await axiosInstance.delete(`/contacts/${contactId}`);
      
      // Remove from contacts
      const { contacts } = get();
      set({ contacts: contacts.filter(contact => contact._id !== contactId) });
      
      toast.success("Contact removed");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to remove contact");
      throw error;
    }
  },

  // Update contact
  updateContact: async (contactId, updates) => {
    try {
      const res = await axiosInstance.put(`/contacts/${contactId}`, updates);
      
      // Update in contacts list
      const { contacts } = get();
      const updatedContacts = contacts.map(contact => 
        contact._id === contactId 
          ? { ...contact, ...updates }
          : contact
      );
      
      set({ contacts: updatedContacts });
      
      toast.success("Contact updated");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update contact");
      throw error;
    }
  },

  // Socket event handlers
  handleContactRequest: (requestData) => {
    const { pendingRequests } = get();
    set({ pendingRequests: [...pendingRequests, requestData] });
    toast.success(`New contact request from ${requestData.requester.fullName}`);
  },

  handleContactAccepted: (contactData) => {
    const { sentRequests, contacts } = get();
    
    // Remove from sent requests
    const updatedSent = sentRequests.filter(req => req._id !== contactData._id);
    
    // Add to contacts
    const newContact = {
      _id: contactData._id,
      user: contactData.recipient,
      group: contactData.group,
      isFavorite: contactData.isFavorite,
      nickname: contactData.nickname,
      createdAt: contactData.createdAt,
      updatedAt: contactData.updatedAt,
    };
    
    set({ 
      sentRequests: updatedSent,
      contacts: [...contacts, newContact]
    });
    
    toast.success(`${contactData.recipient.fullName} accepted your contact request!`);
  },

  handleContactRejected: (data) => {
    const { sentRequests } = get();
    set({ sentRequests: sentRequests.filter(req => req._id !== data.requestId) });
    toast.error("Contact request was rejected");
  },

  handleContactRemoved: (data) => {
    const { contacts } = get();
    set({ contacts: contacts.filter(contact => contact._id !== data.contactId) });
    toast.error("Contact was removed");
  },

  // Clear search results
  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  // Reset store
  reset: () => {
    set({
      contacts: [],
      pendingRequests: [],
      sentRequests: [],
      contactGroups: [],
      searchResults: [],
      isLoading: false,
      isSearching: false,
    });
  },
}));