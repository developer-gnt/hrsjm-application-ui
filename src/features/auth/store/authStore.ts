import { create } from 'zustand';
import { tokenStorage } from '../../../core/storage/token-storage';
import { isJwtExpired } from '../../../core/utils/jwt';
import { appStorage } from '../../../core/storage/app-storage';
import { StorageKeys } from '../../../core/constants/storage-keys';
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
   * Session persists until the user explicitly signs out or uninstalls the app.
   * Throws the normalized ApiError so screens can render inline feedback. */
  signIn: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;

  /** Creates an account via POST /auth/register and stores the returned token
   * pair, but keeps status 'unauthenticated' until completeRegistration() so
   * the register flow can show its completion step first. */
  register: (payload: RegisterRequest) => Promise<void>;

  /** Activates the stored session after a successful registration. */
  completeRegistration: () => void;

  /** Cold-start session restoration: restores cached credentials and verifies
   * or refreshes tokens in the background without dropping active sessions. */
  restoreSession: () => Promise<boolean>;

  /** Sets or updates the active user profile in state and persistent storage. */
  setUser: (user: UserProfile | null) => void;

  /** Revokes the refresh token server-side (idempotent) and clears local secure storage. */
  signOut: () => Promise<void>;

  /** Called by the refresh interceptor when the refresh token is explicitly exhausted —
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

const getPersistedUser = (): UserProfile | null => {
  try {
    const raw = appStorage.getString(StorageKeys.USER_DATA);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore parsing errors
  }
  return null;
};

const initialPersistedUser = getPersistedUser();
const initialAccessToken = tokenStorage.getAccessToken();

export const useAuthStore = create<AuthState>()(set => ({
  user: initialPersistedUser,
  // If we already have stored access token and user profile, immediately start as authenticated
  status: initialPersistedUser && initialAccessToken ? 'authenticated' : 'idle',

  setUser: (user: UserProfile | null) => {
    try {
      if (user) {
        appStorage.setString(StorageKeys.USER_DATA, JSON.stringify(user));
      } else {
        appStorage.delete(StorageKeys.USER_DATA);
      }
    } catch {
      // ignore
    }
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

      try {
        appStorage.setString(StorageKeys.USER_DATA, JSON.stringify(user));
      } catch {
        // ignore
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
    try {
      appStorage.setString(StorageKeys.USER_DATA, JSON.stringify(user));
    } catch {
      // ignore
    }
    set({ user, status: 'unauthenticated' });
    await loadPermissions();
  },

  completeRegistration: () => {
    set({ status: 'authenticated' });
  },

  restoreSession: async (): Promise<boolean> => {
    try {
      // 1. Check cached session & tokens
      const session = await tokenStorage.getStoredSession();
      const accessToken = session?.accessToken || tokenStorage.getAccessToken();
      const refreshToken = session?.refreshToken || (await tokenStorage.getRefreshToken());
      let user = session?.user || getPersistedUser();

      // If there is no token anywhere, user is genuinely not logged in
      if (!accessToken && !refreshToken) {
        set({ user: null, status: 'unauthenticated' });
        return false;
      }

      // 2. Validate the access token expiration
      const isAccessExpired = isJwtExpired(accessToken, 30);

      // 3. If access token is valid, verify with backend (GET /auth/me) or activate cached user
      if (!isAccessExpired && accessToken) {
        tokenStorage.setAccessToken(accessToken);
        if (user) {
          set({ user, status: 'authenticated' });
          loadPermissions().catch(() => undefined);
        }

        try {
          const profile = await authService.getMe();
          if (profile && profile.status !== 'INACTIVE' && profile.status !== 'BLOCKED') {
            await tokenStorage.updateStoredUser(profile);
            try {
              appStorage.setString(StorageKeys.USER_DATA, JSON.stringify(profile));
            } catch {}
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
          // Server returned 401/403: token expired, proceed to refresh
        }
      }

      // 4. Access token expired or unvalidated: attempt to refresh using the refresh token
      if (refreshToken) {
        try {
          const refreshResponse = await authService.refresh(refreshToken);
          const { user: freshUser, access_token: newAccessToken, refresh_token: newRefreshToken } = refreshResponse;

          if (newAccessToken) {
            await tokenStorage.setTokens(newAccessToken, newRefreshToken || refreshToken, freshUser);
            try {
              appStorage.setString(StorageKeys.USER_DATA, JSON.stringify(freshUser));
            } catch {}
            set({ user: freshUser, status: 'authenticated' });
            await loadPermissions();
            return true;
          }
        } catch (refreshErr: any) {
          const isExplicitAuthReject =
            refreshErr?.response?.status === 401 ||
            refreshErr?.response?.status === 403;

          // ONLY clear tokens and force logout if server EXPLICITLY rejected credentials.
          // Transient network drops or offline states MUST NEVER LOG USER OUT.
          if (isExplicitAuthReject) {
            await tokenStorage.clearTokens();
            try {
              appStorage.delete(StorageKeys.USER_DATA);
            } catch {}
            usePermissionStore.getState().clear();
            set({ user: null, status: 'unauthenticated' });
            return false;
          }

          // If offline but we have cached credentials, keep user authenticated
          if (user) {
            set({ user, status: 'authenticated' });
            return true;
          }
        }
      }

      // 5. Both tokens are invalid and cannot be restored: clear storage
      await tokenStorage.clearTokens();
      try {
        appStorage.delete(StorageKeys.USER_DATA);
      } catch {}
      set({ user: null, status: 'unauthenticated' });
      return false;
    } catch (unexpectedError) {
      console.warn('Unexpected error during session restore:', unexpectedError);
      const fallbackUser = getPersistedUser();
      if (fallbackUser) {
        set({ user: fallbackUser, status: 'authenticated' });
        return true;
      }
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
    try {
      appStorage.delete(StorageKeys.USER_DATA);
    } catch {
      // ignore
    }
    usePermissionStore.getState().clear();
    set({ user: null, status: 'unauthenticated' });
  },

  handleSessionExpired: () => {
    tokenStorage.clearTokens();
    try {
      appStorage.delete(StorageKeys.USER_DATA);
    } catch {
      // ignore
    }
    usePermissionStore.getState().clear();
    set({ user: null, status: 'unauthenticated' });
  },
}));
