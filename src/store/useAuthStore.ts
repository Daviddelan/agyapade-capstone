import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  lastActivity: number;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateLastActivity: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  lastActivity: Date.now(),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  updateLastActivity: () => set({ lastActivity: Date.now() }),
  logout: async () => {
    try {
      await auth.signOut();
      set({ user: null });
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },
}));

// Initialize auth state listener
auth.onAuthStateChanged((user) => {
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setLoading(false);
});