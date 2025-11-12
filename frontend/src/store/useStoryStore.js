import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useStoryStore = create((set, get) => ({
  stories: [],
  myStories: [],
  selectedStory: null,
  currentStoryIndex: 0,
  isLoading: false,
  isCreating: false,

  // Fetch all stories from contacts
  fetchStories: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/stories");
      set({ stories: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch stories");
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch user's own stories
  fetchMyStories: async () => {
    try {
      const res = await axiosInstance.get("/stories/my");
      set({ myStories: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch your stories");
    }
  },

  // Create a new story
  createStory: async (storyData) => {
    set({ isCreating: true });
    try {
      const res = await axiosInstance.post("/stories", storyData);
      set((state) => ({ myStories: [res.data, ...state.myStories] }));
      toast.success("Story posted!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create story");
      throw error;
    } finally {
      set({ isCreating: false });
    }
  },

  // View a story
  viewStory: async (storyId) => {
    try {
      await axiosInstance.post(`/stories/view/${storyId}`);
      
      // Update local state to mark as viewed
      set((state) => ({
        stories: state.stories.map((userStories) => ({
          ...userStories,
          stories: userStories.stories.map((story) =>
            story._id === storyId ? { ...story, hasViewed: true } : story
          ),
        })),
      }));
    } catch (error) {
      console.error("Failed to mark story as viewed:", error);
    }
  },

  // Delete a story
  deleteStory: async (storyId) => {
    try {
      await axiosInstance.delete(`/stories/${storyId}`);
      set((state) => ({
        myStories: state.myStories.filter((story) => story._id !== storyId),
      }));
      toast.success("Story deleted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete story");
    }
  },

  // Get story viewers
  getStoryViewers: async (storyId) => {
    try {
      const res = await axiosInstance.get(`/stories/viewers/${storyId}`);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch viewers");
      return [];
    }
  },

  // Set selected story for viewing
  setSelectedStory: (userStories, index = 0) => {
    set({ selectedStory: userStories, currentStoryIndex: index });
  },

  // Navigate to next story
  nextStory: () => {
    const { selectedStory, currentStoryIndex, stories } = get();
    if (!selectedStory) return;

    if (currentStoryIndex < selectedStory.stories.length - 1) {
      set({ currentStoryIndex: currentStoryIndex + 1 });
    } else {
      // Move to next user's stories
      const currentUserIndex = stories.findIndex(
        (s) => s.user._id === selectedStory.user._id
      );
      if (currentUserIndex < stories.length - 1) {
        set({
          selectedStory: stories[currentUserIndex + 1],
          currentStoryIndex: 0,
        });
      } else {
        set({ selectedStory: null, currentStoryIndex: 0 });
      }
    }
  },

  // Navigate to previous story
  previousStory: () => {
    const { selectedStory, currentStoryIndex, stories } = get();
    if (!selectedStory) return;

    if (currentStoryIndex > 0) {
      set({ currentStoryIndex: currentStoryIndex - 1 });
    } else {
      // Move to previous user's stories
      const currentUserIndex = stories.findIndex(
        (s) => s.user._id === selectedStory.user._id
      );
      if (currentUserIndex > 0) {
        const prevUserStories = stories[currentUserIndex - 1];
        set({
          selectedStory: prevUserStories,
          currentStoryIndex: prevUserStories.stories.length - 1,
        });
      }
    }
  },

  // Close story viewer
  closeStoryViewer: () => {
    set({ selectedStory: null, currentStoryIndex: 0 });
  },

  // Socket event handlers
  handleNewStory: (data) => {
    get().fetchStories();
  },

  handleStoryViewed: (data) => {
    set((state) => ({
      myStories: state.myStories.map((story) =>
        story._id === data.storyId
          ? {
              ...story,
              views: [...story.views, { userId: data.viewer, viewedAt: data.viewedAt }],
            }
          : story
      ),
    }));
  },

  subscribeToStoryEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newStory", get().handleNewStory);
    socket.on("storyViewed", get().handleStoryViewed);
  },

  unsubscribeFromStoryEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newStory", get().handleNewStory);
    socket.off("storyViewed", get().handleStoryViewed);
  },
}));
