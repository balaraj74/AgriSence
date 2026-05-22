import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';

/**
 * useAuth — provides the current user and loading state.
 * Initializes the Firebase auth listener on first mount.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, isLoading, isInitialized };
}
