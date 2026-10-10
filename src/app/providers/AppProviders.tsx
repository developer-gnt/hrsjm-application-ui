import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setSessionExpiredHandler } from '../../core/api/client';
import { useAuthStore } from '../../features/auth/store/authStore';
import { FeedbackProvider } from '../../core/feedback/FeedbackContext';

/**
 * Shared React Query client — server-state cache for feature hooks.
 * Conservative defaults until per-feature hooks tune staleTime per module.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * Root provider composition. Also wires the API layer's session-expired
 * callback (refresh token exhausted) to the auth store so a dead session
 * always lands back on the login screen — the single place this wiring
 * happens to keep the dependency direction app → features → core.
 */
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    setSessionExpiredHandler(() => {
      useAuthStore.getState().handleSessionExpired();
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <FeedbackProvider>{children}</FeedbackProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default AppProviders;