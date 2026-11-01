import { create } from "zustand";
import { chatAPI } from "@/lib/apiClient";
import { ChatMessage } from "@/lib/types";

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string;
  sendMessage: (query: string) => Promise<boolean>;
  clearChat: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // STATE
  messages: [],
  loading: false,
  error: "",

  // ACTIONS
  sendMessage: async (query: string) => {
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
    } catch (err: any) {
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
