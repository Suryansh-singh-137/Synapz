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
    } catch (err: any) {
      // Log error for debugging
      // eslint-disable-next-line no-console
      console.error("loadContent error:", err);
      set({ error: err.message || String(err) });
    } finally {
      set({ loading: false });
    }
  },

  // Add new content
  addContent: async (newContent: any) => {
    try {
      // eslint-disable-next-line no-console
      console.log("Adding content:", newContent);
      await addContentAPI(newContent);
      // Reload content list
      const data = await fetchContent();
      set({ content: data.content || [] });
      return true;
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("addContent error:", err);
      set({ error: err.message || String(err) });
      return false;
    }
  },

  // Delete content
  deleteContent: async (contentId: any) => {
    try {
      // eslint-disable-next-line no-console
      console.log("Deleting content id:", contentId);
      await deleteContentAPI(contentId);
      // Remove from local state (don't need to reload)
      set((state: any) => ({
        content: state.content.filter((c: any) => c._id !== contentId),
      }));
      return true;
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("deleteContent error:", err);
      set({ error: err.message || String(err) });
      return false;
    }
  },

  // Clear error
  clearError: () => set({ error: "" }),
}));
