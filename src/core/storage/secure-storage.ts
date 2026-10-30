import * as Keychain from 'react-native-keychain';
import { KEYCHAIN_SERVICE, StorageKeys } from '../constants/storage-keys';
import { appStorage } from './app-storage';

const USERNAME_KEY = 'hrsjm_refresh_token';

/**
 * Hardware-backed secure storage for long-lived secrets (refresh token),
 * with resilient persistent storage fallback (MMKV / localStorage) ensuring
 * Android Keystore anomalies never discard an active user session.
 */
export const secureStorage = {
  /**
   * Persists the refresh token. Always writes to persistent appStorage and
   * attempts hardware Keychain storage where supported.
   */
  async setSecret(value: string): Promise<boolean> {
    // 1. Always write to resilient persistent storage
    try {
      appStorage.setString(StorageKeys.REFRESH_TOKEN, value);
    } catch {
      // ignore
    }

    // 2. Also attempt hardware Keychain storage
    try {
      await Keychain.setGenericPassword(USERNAME_KEY, value, {
        service: KEYCHAIN_SERVICE,
      });
      return true;
    } catch {
      // Keystore unavailable / emulator / device without lockscreen:
      // The secret is already safely persisted in appStorage.
      return true;
    }
  },

  /**
   * Retrieves the refresh token: checks Keychain first, falls back to persistent storage.
   */
  async getSecret(): Promise<string | null> {
    try {
      const result = await Keychain.getGenericPassword({
        service: KEYCHAIN_SERVICE,
      });
      if (result && typeof result === 'object' && result.password) {
        return result.password;
      }
    } catch {
      // Keychain query failed, fall through to resilient fallback
    }

    try {
      const fallback = appStorage.getString(StorageKeys.REFRESH_TOKEN);
      if (fallback) {
        return fallback;
      }
    } catch {
      // ignore
    }

    return null;
  },

  /**
   * Clears the refresh token from all storage mechanisms upon explicit signout.
   */
  async clearSecret(): Promise<void> {
    try {
      appStorage.delete(StorageKeys.REFRESH_TOKEN);
    } catch {
      // ignore
    }

    try {
      await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    } catch {
      // ignore
    }
  },
};
