import { appPreferences } from '../../../core/storage/app-storage';

// Local-only preference for the Biometric Lock UI.
export async function getBiometricLockEnabled(): Promise<boolean> {
  try {
    return appPreferences.isBiometricEnabled();
  } catch {
    return false;
  }
}

export async function setBiometricLockEnabled(enabled: boolean): Promise<void> {
  appPreferences.setBiometricEnabled(enabled);
}
