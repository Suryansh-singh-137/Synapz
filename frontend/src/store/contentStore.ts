import { create } from "zustand";
import { fetchContent, addContentAPI, deleteContentAPI } from "@/lib/apiClient";

export const useContentStore = create((set, get) => ({
  // STATE
  content: [],
  loading: false,
  error: "",

  // ACTIONS

  // Load all content
  loadContent: async () => {
    set({ loading: true, error: "" });
    try {
      const data = await fetchContent();
      set({ content: data.content || [] });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  // Add new content
  addContent: async (newContent) => {
    try {
      await addContentAPI(newContent);
      // Reload content list
      const data = await fetchContent();
      set({ content: data.content || [] });
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },

  // Delete content
  deleteContent: async (contentId) => {
    try {
      await deleteContentAPI(contentId);
      // Remove from local state (don't need to reload)
      set((state) => ({
        content: state.content.filter((c) => c._id !== contentId),
      }));
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },

  // Clear error
  clearError: () => set({ error: "" }),
}));
