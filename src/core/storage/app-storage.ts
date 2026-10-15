import { createMMKV } from 'react-native-mmkv';
import { MMKV_INSTANCE_ID, StorageKeys } from '../constants/storage-keys';

const storage = createMMKV({ id: MMKV_INSTANCE_ID });

/**
 * Ultra-fast synchronous key/value storage for non-secret app preferences
 * (onboarding flag, theme, feature toggles). Secrets must go through
 * `secure-storage.ts` instead.
 */
export const appStorage = {
  getBool(key: string): boolean {
    return storage.getBoolean(key) ?? false;
  },

  setBool(key: string, value: boolean): void {
    storage.set(key, value);
  },

  getString(key: string): string | null {
    return storage.getString(key) ?? null;
  },

  setString(key: string, value: string): void {
    storage.set(key, value);
  },

  delete(key: string): void {
    storage.remove(key);
  },
};

export const appPreferences = {
  isOnboardingCompleted: (): boolean =>
    appStorage.getBool(StorageKeys.ONBOARDING_COMPLETED),

  setOnboardingCompleted: (completed: boolean): void =>
    appStorage.setBool(StorageKeys.ONBOARDING_COMPLETED, completed),

  isBiometricEnabled: (): boolean =>
    appStorage.getBool(StorageKeys.BIOMETRIC_ENABLED),

  setBiometricEnabled: (enabled: boolean): void =>
    appStorage.setBool(StorageKeys.BIOMETRIC_ENABLED, enabled),
};