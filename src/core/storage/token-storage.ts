import { secureStorage } from './secure-storage';
import { appStorage } from './app-storage';
import { StorageKeys } from '../constants/storage-keys';

/**
 * Robust token store implementing persistent session strategy:
 * - Access token: fast memory cache backed synchronously by MMKV on native
 *   and localStorage on web, so app restarts, background kills, and tab reloads
 *   never drop an active user session.
 * - Refresh token: hardware-backed secure storage (Keychain) with persistent
 *   MMKV/localStorage fallback ensuring long-term continuity until explicit signout.
 */
let inMemoryAccessToken: string | null = null;

const getWebStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (inMemoryAccessToken) return inMemoryAccessToken;

    // 1. Check native MMKV persistent storage
    try {
      const persisted = appStorage.getString(StorageKeys.ACCESS_TOKEN);
      if (persisted) {
        inMemoryAccessToken = persisted;
        return persisted;
      }
    } catch {
      // ignore
    }

    // 2. Check web browser localStorage
    const storage = getWebStorage();
    if (storage) {
      try {
        const persisted = storage.getItem('__hrsjm_access_token');
        if (persisted) {
          inMemoryAccessToken = persisted;
          return persisted;
        }
      } catch {
        // ignore storage errors
      }
    }

    return null;
  },

  setAccessToken: (token: string | null): void => {
    inMemoryAccessToken = token;

    try {
      if (token) {
        appStorage.setString(StorageKeys.ACCESS_TOKEN, token);
      } else {
        appStorage.delete(StorageKeys.ACCESS_TOKEN);
      }
    } catch {
      // ignore
    }

    const storage = getWebStorage();
    if (storage) {
      try {
        if (token) {
          storage.setItem('__hrsjm_access_token', token);
        } else {
          storage.removeItem('__hrsjm_access_token');
        }
      } catch {
        // ignore storage errors
      }
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    return secureStorage.getSecret();
  },

  setRefreshToken: async (token: string | null): Promise<void> => {
    if (token) {
      await secureStorage.setSecret(token);
    } else {
      await secureStorage.clearSecret();
    }
  },

  /** Stores a fresh token pair in one call (login / refresh rotation). */
  setTokens: async (
    accessToken: string | null,
    refreshToken: string | null,
  ): Promise<void> => {
    tokenStorage.setAccessToken(accessToken);

    if (refreshToken) {
      await secureStorage.setSecret(refreshToken);
    }
  },

  clearTokens: async (): Promise<void> => {
    inMemoryAccessToken = null;

    try {
      appStorage.delete(StorageKeys.ACCESS_TOKEN);
    } catch {
      // ignore
    }

    const storage = getWebStorage();
    if (storage) {
      try {
        storage.removeItem('__hrsjm_access_token');
      } catch {
        // ignore storage errors
      }
    }

    await secureStorage.clearSecret();
  },
};
