import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface AppState {
  themeMode: ThemeMode;
  isOnboardingCompleted: boolean;
  language: string;
  setThemeMode: (mode: ThemeMode) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setLanguage: (language: string) => void;
}

export const useAppStore = create<AppState>()(
  persist<AppState>(
    (set: any) => ({
      themeMode: 'system',
      isOnboardingCompleted: false,
      language: 'en',
      setThemeMode: (mode: ThemeMode) => set({ themeMode: mode }),
      setOnboardingCompleted: (completed: boolean) => set({ isOnboardingCompleted: completed }),
      setLanguage: (language: string) => set({ language }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
