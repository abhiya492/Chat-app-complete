import { create } from "zustand";

const useSharedStore = create((set, get) => ({
  // State
  activeExperiences: [],
  currentExperience: null,
  isLoading: false,
  

  
  // Games
  gameData: {
    type: null,
    state: null,
    currentPlayer: null,
    winner: null
  },
  
  // Cursor Share
  cursors: new Map(),

  // Actions
  setActiveExperiences: (experiences) => set({ activeExperiences: experiences }),
  
  setCurrentExperience: (experience) => set({ currentExperience: experience }),
  

  
  updateGameData: (data) => set((state) => ({
    gameData: { ...state.gameData, ...data }
  })),
  
  updateCursor: (userId, position) => set((state) => {
    const newCursors = new Map(state.cursors);
    newCursors.set(userId, position);
    return { cursors: newCursors };
  }),
  
  removeCursor: (userId) => set((state) => {
    const newCursors = new Map(state.cursors);
    newCursors.delete(userId);
    return { cursors: newCursors };
  }),
  
  // API Actions (Mock for now)
  createExperience: async (type, chatId, data) => {
    set({ isLoading: true });
    try {
      // Mock experience for testing
      const experience = {
        _id: Date.now().toString(),
        type,
        chatId,
        data,
        participants: [],
        isActive: true
      };
      set({ currentExperience: experience, isLoading: false });
      return experience;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  joinExperience: async (experienceId) => {
    // Mock join
    return get().currentExperience;
  },
  
  leaveExperience: async (experienceId) => {
    set({ currentExperience: null });
  },
  
  updateExperience: async (experienceId, data) => {
    const current = get().currentExperience;
    if (current) {
      const updated = { ...current, data: { ...current.data, ...data } };
      set({ currentExperience: updated });
      return updated;
    }
  },
  
  fetchActiveExperiences: async (chatId) => {
    // Mock - return empty for now
    set({ activeExperiences: [] });
    return [];
  }
}));

export default useSharedStore;