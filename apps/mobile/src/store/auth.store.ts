import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { onAuthStateChanged } from '../services/auth';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => () => void; // returns unsubscribe
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set) => ({
    user: null,
    isLoading: true,
    isInitialized: false,

    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),

    initialize: () => {
      const timeoutId = setTimeout(() => {
        set((state) => {
          if (state.isLoading) {
            console.warn('[AuthStore] Auth initialization timed out, forcing isLoading to false');
            return { isLoading: false, isInitialized: true };
          }
          return {};
        });
      }, 2500);

      const unsubscribe = onAuthStateChanged((user) => {
        clearTimeout(timeoutId);
        set({ user, isLoading: false, isInitialized: true });
      });

      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    },
  }))
);

// Convenience selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsAuthenticated = (state: AuthState) => !!state.user;
