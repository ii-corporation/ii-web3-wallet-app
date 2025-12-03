import { create } from 'zustand';

interface AuthFlowState {
  hasSyncedUser: boolean;
  isNavigating: boolean;
  lastAuthState: boolean | null;
  setHasSyncedUser: (value: boolean) => void;
  setIsNavigating: (value: boolean) => void;
  setLastAuthState: (value: boolean | null) => void;
  resetAuthFlow: () => void;
}

export const useAuthFlowStore = create<AuthFlowState>((set) => ({
  hasSyncedUser: false,
  isNavigating: false,
  lastAuthState: null,
  setHasSyncedUser: (value) => set({ hasSyncedUser: value }),
  setIsNavigating: (value) => set({ isNavigating: value }),
  setLastAuthState: (value) => set({ lastAuthState: value }),
  resetAuthFlow: () => set({ hasSyncedUser: false, isNavigating: false, lastAuthState: null }),
}));
