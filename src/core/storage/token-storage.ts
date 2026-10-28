import { secureStorage } from './secure-storage';

/**
 * Token store implementing the project token strategy (spec §14):
 * - Access token: short-lived in memory; on web preview, backed by localStorage
 *   so browser reloads and tab navigations do not drop authentication.
 * - Refresh token: long-lived, hardware-backed secure storage (Keychain / web storage).
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
    inMemoryAccessToken = accessToken;
    const storage = getWebStorage();
    if (storage) {
      try {
        if (accessToken) {
          storage.setItem('__hrsjm_access_token', accessToken);
        } else {
          storage.removeItem('__hrsjm_access_token');
        }
      } catch {
        // ignore storage errors
      }
    }
    if (refreshToken) {
      await secureStorage.setSecret(refreshToken);
    }
  },

  clearTokens: async (): Promise<void> => {
    inMemoryAccessToken = null;
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
