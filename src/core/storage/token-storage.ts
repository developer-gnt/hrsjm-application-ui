import { secureStorage } from './secure-storage';

/**
 * Token store implementing the project token strategy (spec §14):
 * - Access token: short-lived, memory only — never persisted.
 * - Refresh token: long-lived, hardware-backed secure storage (Keychain).
 */
let inMemoryAccessToken: string | null = null;

export const tokenStorage = {
  getAccessToken: (): string | null => {
    return inMemoryAccessToken;
  },

  setAccessToken: (token: string | null): void => {
    inMemoryAccessToken = token;
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
    if (refreshToken) {
      await secureStorage.setSecret(refreshToken);
    }
  },

  clearTokens: async (): Promise<void> => {
    inMemoryAccessToken = null;
    await secureStorage.clearSecret();
  },
};