import { create } from "zustand";
interface User {
  id: string;
  username: string;
}
interface AuthStore {
  //states
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  //action
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}
export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, token: null }),
}));
