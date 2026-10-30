import { create } from 'zustand';
import { tokenStorage } from '../../../core/storage/token-storage';
import { isJwtExpired } from '../../../core/utils/jwt';
import { usePermissionStore } from '../../../core/permissions/permission.store';
import { authService, RegisterRequest } from '../services/auth.service';
import { UserProfile } from '../types/auth.types';

export type AuthStatus =
  | 'idle' // app boot, session not yet resolved
  | 'authenticating' // login or restore in flight
  | 'authenticated'
  | 'unauthenticated';

interface AuthState {
  user: UserProfile | null;
  status: AuthStatus;

  /** Validates credentials against POST /auth/login and stores the token pair securely.
   * `rememberMe=false` keeps the session memory-only (no relaunch restore).
   * Throws the normalized ApiError so screens can render inline feedback. */
  signIn: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;

  /** Creates an account via POST /auth/register and stores the returned token
   * pair, but keeps status 'unauthenticated' until completeRegistration() so
   * the register flow can show its completion step first. */
  register: (payload: RegisterRequest) => Promise<void>;

  /** Activates the stored session after a successful registration. */
  completeRegistration: () => void;

  /** Cold-start session restoration: validates stored access token or exchanges
   * the stored refresh token for a fresh pair via POST /auth/refresh. Returns whether
   * a session was successfully restored. */
  restoreSession: () => Promise<boolean>;

  /** Sets or updates the active user profile in state. */
  setUser: (user: UserProfile | null) => void;

  /** Revokes the refresh token server-side (idempotent) and clears local secure storage. */
  signOut: () => Promise<void>;

  /** Called by the refresh interceptor when the refresh token is exhausted —
   * local cleanup only, no server call (it already failed). */
  handleSessionExpired: () => void;
}

/** Fetches the user's effective permission keys into the permission store. */
const loadPermissions = async (): Promise<void> => {
  try {
    await usePermissionStore.getState().loadPermissions();
  } catch {
    // Non-fatal if offline or permissions endpoint fails
  }
};

export const useAuthStore = create<AuthState>()(set => ({
  user: null,
  status: 'idle',

  setUser: (user: UserProfile | null) => {
    set({ user });
    if (user) {
      tokenStorage.updateStoredUser(user).catch(() => undefined);
    }
  },

  signIn: async (identifier, password, rememberMe = true) => {
    set({ status: 'authenticating' });
    try {
      const { user, access_token, refresh_token } = await authService.login(
        identifier,
        password,
      );

      await tokenStorage.setTokens(access_token, refresh_token, user);
      if (!rememberMe) {
        // Session lives for this run only — no restore on relaunch.
        await tokenStorage.setRefreshToken(null);
      }

      set({ user, status: 'authenticated' });
      await loadPermissions();
    } catch (error) {
      set({ user: null, status: 'unauthenticated' });
      throw error;
    }
  },

  register: async payload => {
    const { user, access_token, refresh_token } = await authService.register(
      payload,
    );
    await tokenStorage.setTokens(access_token, refresh_token, user);
    set({ user, status: 'unauthenticated' });
    await loadPermissions();
  },

  completeRegistration: () => {
    set({ status: 'authenticated' });
  },

  restoreSession: async (): Promise<boolean> => {
    try {
      // 1. Retrieve saved session from secure hardware storage
      const session = await tokenStorage.getStoredSession();
      if (!session || (!session.accessToken && !session.refreshToken)) {
        set({ user: null, status: 'unauthenticated' });
        return false;
      }

      const accessToken = session.accessToken;
      const refreshToken = session.refreshToken;
      let user = session.user || null;

      // 2. Validate the access token
      const isAccessExpired = isJwtExpired(accessToken, 30);

      // 3. If access token is mathematically valid, verify with backend (GET /auth/me)
      if (!isAccessExpired && accessToken) {
        try {
          tokenStorage.setAccessToken(accessToken);
          const profile = await authService.getMe();
          if (profile && profile.status === 'ACTIVE') {
            await tokenStorage.updateStoredUser(profile);
            set({ user: profile, status: 'authenticated' });
            await loadPermissions();
            return true;
          }
        } catch (err: any) {
          const httpStatus = err?.response?.status || err?.status;
          if (httpStatus !== 401 && httpStatus !== 403) {
            // Temporary network glitch / offline: preserve session with cached user
            if (user) {
              set({ user, status: 'authenticated' });
              return true;
            }
          }
          // Server explicitly returned 401/403: token expired/invalid, proceed to refresh
        }
      }

      // 4. Access token expired or unvalidated: attempt to refresh using the refresh token
      if (refreshToken) {
        try {
          const refreshResponse = await authService.refresh(refreshToken);
          const { user: freshUser, access_token: newAccessToken, refresh_token: newRefreshToken } = refreshResponse;

          if (newAccessToken) {
            await tokenStorage.setTokens(newAccessToken, newRefreshToken || refreshToken, freshUser);
            set({ user: freshUser, status: 'authenticated' });
            await loadPermissions();
            return true;
          }
        } catch (refreshErr) {
          console.warn('Session refresh failed during startup:', refreshErr);
        }
      }

      // 5. Both access token and refresh token are invalid or refresh failed: clear storage
      await tokenStorage.clearTokens();
      set({ user: null, status: 'unauthenticated' });
      return false;
    } catch (unexpectedError) {
      console.warn('Unexpected error during session restore:', unexpectedError);
      await tokenStorage.clearTokens();
      set({ user: null, status: 'unauthenticated' });
      return false;
    }
  },

  signOut: async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Server-side revoke is best-effort; local session must always clear.
    }
    await tokenStorage.clearTokens();
    usePermissionStore.getState().clear();
    set({ user: null, status: 'unauthenticated' });
  },

  handleSessionExpired: () => {
    tokenStorage.clearTokens();
    usePermissionStore.getState().clear();
    set({ user: null, status: 'unauthenticated' });
  },
}));
