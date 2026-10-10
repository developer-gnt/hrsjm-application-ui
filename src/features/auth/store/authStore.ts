import { create } from 'zustand';
import { tokenStorage } from '../../../core/storage/token-storage';
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

  /** Validates credentials against POST /auth/login and stores the token pair.
   * `rememberMe=false` keeps the session memory-only (no relaunch restore).
   * Throws the normalized ApiError so screens can render inline feedback. */
  signIn: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;

  /** Creates an account via POST /auth/register and stores the returned token
   * pair, but keeps status 'unauthenticated' until completeRegistration() so
   * the register flow can show its completion step first. */
  register: (payload: RegisterRequest) => Promise<void>;

  /** Activates the stored session after a successful registration. */
  completeRegistration: () => void;

  /** Cold-start session restoration: exchanges the stored refresh token for a
   * fresh pair via POST /auth/refresh. Returns whether a session was restored. */
  restoreSession: () => Promise<boolean>;

  /** Revokes the refresh token server-side (idempotent) and clears local state. */
  signOut: () => Promise<void>;

  /** Called by the refresh interceptor when the refresh token is exhausted —
   * local cleanup only, no server call (it already failed). */
  handleSessionExpired: () => void;
}

/** Fetches the user's effective permission keys into the permission store. */
const loadPermissions = async (): Promise<void> => {
  await usePermissionStore.getState().loadPermissions();
};

export const useAuthStore = create<AuthState>()(set => ({
  user: null,
  status: 'idle',

  signIn: async (identifier, password, rememberMe = true) => {
    set({ status: 'authenticating' });
    try {
      const { user, access_token, refresh_token } = await authService.login(
        identifier,
        password,
      );
      await tokenStorage.setTokens(access_token, refresh_token);
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
    await tokenStorage.setTokens(access_token, refresh_token);
    set({ user, status: 'unauthenticated' });
    await loadPermissions();
  },

  completeRegistration: () => {
    set({ status: 'authenticated' });
  },

  restoreSession: async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
      set({ user: null, status: 'unauthenticated' });
      return false;
    }

    try {
      // Refresh returns a fresh token pair (rotated) plus the current profile.
      const { user, access_token, refresh_token } = await authService.refresh(
        refreshToken,
      );
      await tokenStorage.setTokens(access_token, refresh_token);
      set({ user, status: 'authenticated' });
      await loadPermissions();
      return true;
    } catch {
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