import { create } from "zustand";
import { createShareLinkAPI } from "@/lib/apiClient";

export const useShareStore = create((set) => ({
  // STATE
  link: "",
  loading: false,
  error: "",

  // ACTIONS

  // Generate share link
  generateLink: async () => {
    set({ loading: true, error: "" });

    try {
      const response = await createShareLinkAPI();
      const shareLink = `${window.location.origin}/brain/${response.hash}`;
      set({ link: shareLink });
      return shareLink;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Copy to clipboard
  copyLink: () => {
    const state = (set as any).getState?.() || { link: "" };
    if (state.link) {
      navigator.clipboard.writeText(state.link);
    }
  },

  // Clear
  reset: () => set({ link: "", error: "" }),
}));
