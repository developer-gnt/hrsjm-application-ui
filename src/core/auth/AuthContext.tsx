import React, { createContext, useContext, useMemo } from 'react';
import { useAuthStore } from '../../features/auth/store/authStore';
import type { AppUser } from '../api/types';

export type AuthStatus = 'restoring' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: AppUser | any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  const status = useAuthStore(s => s.status);
  const signIn = useAuthStore(s => s.signIn);
  const signOut = useAuthStore(s => s.signOut);

  const mappedStatus: AuthStatus =
    status === 'idle' || status === 'authenticating'
      ? 'restoring'
      : status === 'authenticated'
        ? 'authenticated'
        : 'unauthenticated';

  const refreshUser = async () => {
    await useAuthStore.getState().restoreSession();
  };

  const value = useMemo(
    () => ({
      status: mappedStatus,
      user,
      signIn: async (e: string, p: string) => {
        await signIn(e, p);
      },
      signOut,
      refreshUser,
    }),
    [mappedStatus, user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // If used outside provider, directly read from authStore
    const user = useAuthStore.getState().user;
    const status = useAuthStore.getState().status;
    const mappedStatus: AuthStatus =
      status === 'idle' || status === 'authenticating'
        ? 'restoring'
        : status === 'authenticated'
          ? 'authenticated'
          : 'unauthenticated';

    return {
      status: mappedStatus,
      user,
      signIn: async (e: string, p: string) => {
        await useAuthStore.getState().signIn(e, p);
      },
      signOut: async () => {
        await useAuthStore.getState().signOut();
      },
      refreshUser: async () => {
        await useAuthStore.getState().restoreSession();
      },
    };
  }
  return ctx;
}

export default AuthContext;
