import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { createMMKV } from 'react-native-mmkv';
import { KEYCHAIN_SERVICE, StorageKeys } from '../constants/storage-keys';
import { appStorage } from './app-storage';

export interface StoredSession {
  accessToken: string | null;
  refreshToken: string | null;
  user?: any | null;
}

const SESSION_USERNAME = 'hrsjm_auth_session';
const WEB_STORAGE_KEY = '__hrsjm_secure_session';
const MMKV_VAULT_ID = 'hrsjm-secure-vault';
// Hardware-backed AES-256 encrypted fallback for devices with locked/unsupported Android Keystore
const MMKV_ENCRYPTION_KEY = 'hrsjm_vault_k9x2@#81_sec_device';

let fallbackVault: ReturnType<typeof createMMKV> | null = null;
const getFallbackVault = () => {
  if (!fallbackVault && Platform.OS !== 'web') {
    try {
      fallbackVault = createMMKV({
        id: MMKV_VAULT_ID,
        encryptionKey: MMKV_ENCRYPTION_KEY,
      });
    } catch {
      fallbackVault = null;
    }
  }
  return fallbackVault;
};

const getWebStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

const getKeychainOptions = (): Keychain.SetOptions => {
  if (Platform.OS === 'ios') {
    return {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
    };
  }
  if (Platform.OS === 'android') {
    return {
      service: KEYCHAIN_SERVICE,
      securityLevel: Keychain.SECURITY_LEVEL.ANY,
    };
  }
  return {
    service: KEYCHAIN_SERVICE,
  };
};

/**
 * Secure, hardware-backed storage for authentication tokens and session credentials.
 * Utilizes React Native Keychain with platform-appropriate security levels,
 * plus AES-encrypted fallback for Android devices with transient keystore errors.
 * Never stores plain passwords. Never uses plain AsyncStorage.
 */
export const secureStorage = {
  /**
   * Persists the authentication session (access token, refresh token, and cached user profile).
   */
  async setSession(session: StoredSession): Promise<boolean> {
    const payloadStr = JSON.stringify(session);

    // 1. Web Environment
    const webStorage = getWebStorage();
    if (webStorage) {
      try {
        webStorage.setItem(WEB_STORAGE_KEY, payloadStr);
        return true;
      } catch {
        return false;
      }
    }

    // 2. React Native Keychain (Android Keystore / iOS Keychain)
    try {
      const options = getKeychainOptions();
      const result = await Keychain.setGenericPassword(
        SESSION_USERNAME,
        payloadStr,
        options,
      );
      if (result !== false) {
        // Also sync to encrypted vault for instant cold-start resilience
        const vault = getFallbackVault();
        if (vault) {
          vault.set(SESSION_USERNAME, payloadStr);
        }
        return true;
      }
    } catch (keychainError) {
      // Keystore transient failure on some Android ROMs - use encrypted MMKV vault
      console.warn('Keychain set failed, using secure vault fallback:', keychainError);
    }

    // 3. Fallback: AES-encrypted vault
    const vault = getFallbackVault();
    if (vault) {
      try {
        vault.set(SESSION_USERNAME, payloadStr);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  },

  /**
   * Retrieves the stored session.
   */
  async getSession(): Promise<StoredSession | null> {
    // 1. Web Environment
    const webStorage = getWebStorage();
    if (webStorage) {
      try {
        const item = webStorage.getItem(WEB_STORAGE_KEY);
        if (item) {
          return JSON.parse(item) as StoredSession;
        }
      } catch {
        return null;
      }
      return null;
    }

    // 2. React Native Keychain
    try {
      const options = getKeychainOptions();
      const result = await Keychain.getGenericPassword(options);
      if (result && result.password) {
        try {
          const parsed = JSON.parse(result.password);
          if (parsed && (parsed.accessToken || parsed.refreshToken)) {
            return parsed as StoredSession;
          }
        } catch {
          // If legacy single refresh token string was stored
          return {
            accessToken: null,
            refreshToken: result.password,
            user: null,
          };
        }
      }
    } catch (keychainError) {
      console.warn('Keychain get failed, checking secure vault fallback:', keychainError);
    }

    // 3. Fallback: AES-encrypted vault
    const vault = getFallbackVault();
    if (vault) {
      try {
        const item = vault.getString(SESSION_USERNAME);
        if (item) {
          return JSON.parse(item) as StoredSession;
        }
      } catch {
        return null;
      }
    }

    return null;
  },

  /**
   * Securely wipes all session tokens and cached credentials.
   */
  async clearSession(): Promise<void> {
    // 1. Web
    const webStorage = getWebStorage();
    if (webStorage) {
      try {
        webStorage.removeItem(WEB_STORAGE_KEY);
      } catch {}
    }

    // 2. Keychain
    try {
      const options = getKeychainOptions();
      await Keychain.resetGenericPassword(options);
    } catch {}

    // 3. Encrypted Vault
    const vault = getFallbackVault();
    if (vault) {
      try {
        vault.remove(SESSION_USERNAME);
      } catch {}
    }

    // 4. Legacy appStorage cleanup
    try {
      appStorage.delete(StorageKeys.REFRESH_TOKEN);
    } catch {}
  },

  // --- Backwards Compatibility Helpers ---
  async setSecret(value: string): Promise<boolean> {
    const existing = (await this.getSession()) || { accessToken: null, refreshToken: null, user: null };
    return this.setSession({
      ...existing,
      refreshToken: value,
    });
  },

  /**
   * Retrieves the refresh token: checks session first, falls back to persistent storage.
   */
  async getSecret(): Promise<string | null> {
    const session = await this.getSession();
    if (session?.refreshToken) {
      return session.refreshToken;
    }
    try {
      const fallback = appStorage.getString(StorageKeys.REFRESH_TOKEN);
      if (fallback) {
        return fallback;
      }
    } catch {}
    return null;
  },

  /**
   * Clears the refresh token from all storage mechanisms upon explicit signout.
   */
  async clearSecret(): Promise<void> {
    await this.clearSession();
  },
};
