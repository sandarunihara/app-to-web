import { create } from 'zustand';
import type { UserProfile } from '../types/models';

interface UserState {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set: any) => ({
  user: null,
  setUser: (user: UserProfile) => set({ user }),
  updateUser: (updates: Partial<UserProfile>) =>
    set((state: any) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  clearUser: () => set({ user: null }),
}));
