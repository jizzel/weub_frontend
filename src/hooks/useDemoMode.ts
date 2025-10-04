/**
 * Hook to track if the app is in demo mode (API unavailable)
 */

import { create } from 'zustand';

interface DemoModeState {
  isDemoMode: boolean;
  setDemoMode: (isDemoMode: boolean) => void;
}

export const useDemoMode = create<DemoModeState>((set) => ({
  isDemoMode: false,
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
}));
