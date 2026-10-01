import AsyncStorage from '@react-native-async-storage/async-storage';

// Local-only preference for the Biometric Lock UI. This gates local app
// access only and never replaces server authentication. Enforcement itself
// requires the shared biometric native integration (pending).
const BIOMETRIC_LOCK_KEY = 'hrsjm.settings.biometricLock';

export async function getBiometricLockEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(BIOMETRIC_LOCK_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function setBiometricLockEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(BIOMETRIC_LOCK_KEY, enabled ? 'true' : 'false');
}
