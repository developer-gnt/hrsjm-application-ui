import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { authEvents } from '../api/client';
import type { AppUser } from '../api/types';
import { authService } from './auth.service';
import { clearSession, getSession, saveSession } from './storage';

type AuthStatus = 'restoring' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: AppUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // Re-validates the profile against /auth/me and updates the stored session
  // (used by the settings module after a profile edit).
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [user, setUser] = useState<AppUser | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    // Restore an existing session; re-validate the profile against /auth/me
    // so a stale role/status does not linger across app restarts.
    (async () => {
      const session = await getSession();
      if (!session) {
        if (mounted.current) {
          setStatus('unauthenticated');
        }
        return;
      }
      setUser(session.user);
      setStatus('authenticated');
      try {
        const fresh = await authService.me();
        if (mounted.current) {
          setUser(fresh);
          await saveSession({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            user: fresh,
          });
        }
      } catch {
        // 401 is handled globally (session cleared + sign-out event); other
        // errors (offline etc.) keep the restored session usable offline.
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = authEvents.onUnauthorized(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (identifier: string, password: string) => {
    const { user: loggedInUser, access_token, refresh_token } = await authService.login(
      identifier,
      password,
    );
    await saveSession({
      accessToken: access_token,
      refreshToken: refresh_token,
      user: loggedInUser,
    });
    setUser(loggedInUser);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const refreshUser = useCallback(async () => {
    const fresh = await authService.me();
    if (mounted.current) {
      setUser(fresh);
    }
    const session = await getSession();
    if (session) {
      await saveSession({ ...session, user: fresh });
    }
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signOut, refreshUser }),
    [status, user, signIn, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
