import * as Keychain from 'react-native-keychain';
import { KEYCHAIN_SERVICE } from '../constants/storage-keys';

const USERNAME_KEY = 'hrsjm_refresh_token';

/**
 * Hardware-backed secure storage for long-lived secrets (refresh token).
 * Never use this for non-sensitive data — see `app-storage.ts` for preferences.
 */
export const secureStorage = {
  /**
   * Persists a secret value. Returns false when the device keystore is
   * unavailable (e.g. locked emulator keystore) so callers can decide to
   * keep the session memory-only rather than fail the login.
   */
  async setSecret(value: string): Promise<boolean> {
    try {
      const result = await Keychain.setGenericPassword(USERNAME_KEY, value, {
        service: KEYCHAIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return result !== false;
    } catch {
      return false;
    }
  },

  async getSecret(): Promise<string | null> {
    try {
      const result = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
      if (result === false) {
        return null;
      }
      return result.password || null;
    } catch {
      return null;
    }
  },

  async clearSecret(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    } catch {
      // Idempotent clear — nothing to do if the entry is already gone.
    }
  },
};