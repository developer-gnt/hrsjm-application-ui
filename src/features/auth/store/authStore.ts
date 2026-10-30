import { create } from 'zustand';
import { tokenStorage } from '../../../core/storage/token-storage';
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

  /** Validates credentials against POST /auth/login and stores the token pair.
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

  /** Revokes the refresh token server-side (idempotent) and clears local state. */
  signOut: () => Promise<void>;

  /** Called by the refresh interceptor when the refresh token is explicitly exhausted —
   * local cleanup only, no server call (it already failed). */
  handleSessionExpired: () => void;
}

/** Fetches the user's effective permission keys into the permission store. */
const loadPermissions = async (): Promise<void> => {
  await usePermissionStore.getState().loadPermissions();
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
  },

  signIn: async (identifier, password, _rememberMe = true) => {
    set({ status: 'authenticating' });
    try {
      const { user, access_token, refresh_token } = await authService.login(
        identifier,
        password,
      );

      // Persist tokens across all storage engines
      await tokenStorage.setTokens(access_token, refresh_token);

      // Persist user profile
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
    await tokenStorage.setTokens(access_token, refresh_token);
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

  restoreSession: async () => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = await tokenStorage.getRefreshToken();
    const cachedUser = getPersistedUser();

    // If there is no token anywhere, user is genuinely not logged in
    if (!accessToken && !refreshToken) {
      set({ user: null, status: 'unauthenticated' });
      return false;
    }

    // 1. Instant Restoration: If we have a cached user and access token, immediately activate session!
    if (cachedUser && accessToken) {
      set({ user: cachedUser, status: 'authenticated' });
      loadPermissions().catch(() => undefined);

      // Silently verify or refresh in background
      (async () => {
        try {
          const freshProfile = await authService.getMe();
          if (freshProfile) {
            set({ user: freshProfile });
            try {
              appStorage.setString(
                StorageKeys.USER_DATA,
                JSON.stringify(freshProfile),
              );
            } catch {
              // ignore
            }
          }
        } catch (meError: any) {
          // If access token expired (401), try to refresh token silently
          if (meError?.response?.status === 401 && refreshToken) {
            try {
              const res = await authService.refresh(refreshToken);
              await tokenStorage.setTokens(res.access_token, res.refresh_token);
              if (res.user) {
                set({ user: res.user });
                try {
                  appStorage.setString(
                    StorageKeys.USER_DATA,
                    JSON.stringify(res.user),
                  );
                } catch {
                  // ignore
                }
              }
            } catch (refErr: any) {
              const isExplicitAuthReject =
                refErr?.response?.status === 401 ||
                refErr?.response?.status === 403;
              if (isExplicitAuthReject) {
                await tokenStorage.clearTokens();
                try {
                  appStorage.delete(StorageKeys.USER_DATA);
                } catch {
                  // ignore
                }
                usePermissionStore.getState().clear();
                set({ user: null, status: 'unauthenticated' });
              }
            }
          }
        }
      })();

      return true;
    }

    // 2. If access token is absent but we have a refresh token, rotate to a fresh pair
    if (refreshToken) {
      try {
        const { user, access_token, refresh_token } = await authService.refresh(
          refreshToken,
        );
        await tokenStorage.setTokens(access_token, refresh_token);
        try {
          appStorage.setString(StorageKeys.USER_DATA, JSON.stringify(user));
        } catch {
          // ignore
        }
        set({ user, status: 'authenticated' });
        await loadPermissions();
        return true;
      } catch (refreshErr: any) {
        const isExplicitAuthReject =
          refreshErr?.response?.status === 401 ||
          refreshErr?.response?.status === 403;

        // ONLY clear tokens and force logout if the server EXPLICITLY rejected the credentials.
        // Transient network drops, timeouts, or offline states MUST NEVER LOG THE USER OUT.
        if (isExplicitAuthReject) {
          await tokenStorage.clearTokens();
          try {
            appStorage.delete(StorageKeys.USER_DATA);
          } catch {
            // ignore
          }
          usePermissionStore.getState().clear();
          set({ user: null, status: 'unauthenticated' });
          return false;
        }

        // If offline / network error but we have cached credentials, keep user authenticated
        if (cachedUser) {
          set({ user: cachedUser, status: 'authenticated' });
          return true;
        }

        set({ status: 'unauthenticated' });
        return false;
      }
    }

    set({ user: null, status: 'unauthenticated' });
    return false;
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
