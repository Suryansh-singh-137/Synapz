import { create } from "zustand";
import { chatAPI } from "@/lib/apiClient";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; link: string }>;
}

export const useChatStore = create((set) => ({
  // STATE
  messages: [],
  loading: false,
  error: "",

  // ACTIONS

  // Send message
  sendMessage: async (query) => {
    // Add user message immediately
    set((state) => ({
      messages: [...state.messages, { role: "user", content: query }],
      loading: true,
      error: "",
    }));

    try {
      const response = await chatAPI(query);

      // Add assistant response
      set((state) => ({
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: response.answer || response.message,
            sources: response.sources,
          },
        ],
      }));

      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Clear chat
  clearChat: () => set({ messages: [], error: "" }),

  // Clear error
  clearError: () => set({ error: "" }),
}));
