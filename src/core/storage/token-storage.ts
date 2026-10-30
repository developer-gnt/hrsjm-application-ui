import { secureStorage, StoredSession } from './secure-storage';

/**
 * High-performance, secure Token Store.
 * - Access token: stored securely in hardware-backed storage & cached in memory for zero-latency synchronous reads (axios interceptors).
 * - Refresh token: stored securely in hardware-backed storage.
 * - User Profile: cached securely to allow fast app boot and smooth offline resilience.
 */

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;
let inMemoryUser: any | null = null;
let isInitialized = false;

export const tokenStorage = {
  /**
   * Initializes token cache on application startup.
   */
  async init(): Promise<StoredSession | null> {
    try {
      const session = await secureStorage.getSession();
      if (session) {
        inMemoryAccessToken = session.accessToken || null;
        inMemoryRefreshToken = session.refreshToken || null;
        inMemoryUser = session.user || null;
      }
      isInitialized = true;
      return session;
    } catch {
      isInitialized = true;
      return null;
    }
  },

  /**
   * Synchronous access token retrieval (used by auth request interceptor).
   */
  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },

  /**
   * Asynchronous access token retrieval with auto-initialization fallback.
   */
  async getAccessTokenAsync(): Promise<string | null> {
    if (inMemoryAccessToken) return inMemoryAccessToken;
    const session = await secureStorage.getSession();
    if (session?.accessToken) {
      inMemoryAccessToken = session.accessToken;
      return session.accessToken;
    }
    return null;
  },

  /**
   * Updates the in-memory access token and synchronizes with secure storage.
   */
  setAccessToken(token: string | null): void {
    inMemoryAccessToken = token;
    // Async background persistence
    secureStorage.getSession().then(session => {
      secureStorage.setSession({
        ...(session || { refreshToken: null, user: null }),
        accessToken: token,
      }).catch(() => undefined);
    }).catch(() => undefined);
  },

  /**
   * Asynchronous refresh token retrieval.
   */
  async getRefreshToken(): Promise<string | null> {
    if (inMemoryRefreshToken) return inMemoryRefreshToken;
    const session = await secureStorage.getSession();
    if (session?.refreshToken) {
      inMemoryRefreshToken = session.refreshToken;
      return session.refreshToken;
    }
    return null;
  },

  async setRefreshToken(token: string | null): Promise<void> {
    inMemoryRefreshToken = token;
    const session = (await secureStorage.getSession()) || { accessToken: inMemoryAccessToken, user: inMemoryUser };
    await secureStorage.setSession({
      ...session,
      refreshToken: token,
    });
  },

  /**
   * Retrieves the full persistent session (access token, refresh token, user profile).
   */
  async getStoredSession(): Promise<StoredSession | null> {
    const session = await secureStorage.getSession();
    if (session) {
      inMemoryAccessToken = session.accessToken || null;
      inMemoryRefreshToken = session.refreshToken || null;
      inMemoryUser = session.user || null;
    }
    return session;
  },

  /**
   * Atomically stores a fresh token pair and profile in secure storage.
   */
  async setTokens(
    accessToken: string | null,
    refreshToken: string | null,
    user?: any | null,
  ): Promise<void> {
    inMemoryAccessToken = accessToken;
    inMemoryRefreshToken = refreshToken;
    if (user !== undefined) {
      inMemoryUser = user;
    }

    await secureStorage.setSession({
      accessToken,
      refreshToken,
      user: inMemoryUser,
    });
  },

  /**
   * Updates only the cached user profile without changing active tokens.
   */
  async updateStoredUser(user: any | null): Promise<void> {
    inMemoryUser = user;
    const session = await secureStorage.getSession();
    if (session) {
      await secureStorage.setSession({
        ...session,
        user,
      });
    }
  },

  /**
   * Securely purges all tokens and cached session data on explicit logout.
   */
  async clearTokens(): Promise<void> {
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
    inMemoryUser = null;
    await secureStorage.clearSession();
  },
};
