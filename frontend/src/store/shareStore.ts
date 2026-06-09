import { create } from "zustand";
import { createShareLinkAPI, deleteShareLinkAPI } from "@/lib/apiClient";

interface ShareState {
  link: string;
  loading: boolean;
  error: string;
  generateLink: () => Promise<string | null>;
  deactivateLink: () => Promise<void>;
  copyLink: () => void;
  reset: () => void;
}

export const useShareStore = create<ShareState>((set, get) => ({
  // ── STATE ──────────────────────────────────────────────────────────────
  link: "",
  loading: false,
  error: "",

  // ── ACTIONS ────────────────────────────────────────────────────────────

  /**
   * Call the backend to get or create a share link.
   * Backend returns { hash } — we build the full URL here on the client.
   */
  generateLink: async () => {
    set({ loading: true, error: "" });

    try {
      const { hash } = await createShareLinkAPI();

      // Build the full shareable URL from the hash
      const shareLink = `${window.location.origin}/brain/${hash}`;

      set({ link: shareLink });
      return shareLink;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Delete the share link from the backend and clear local state.
   */
  deactivateLink: async () => {
    set({ loading: true, error: "" });
    try {
      await deleteShareLinkAPI();
      set({ link: "" });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Copy the current share link to the clipboard.
   */
  copyLink: () => {
    const { link } = get();
    if (link) {
      navigator.clipboard.writeText(link);
    }
  },

  reset: () => set({ link: "", error: "" }),
}));
