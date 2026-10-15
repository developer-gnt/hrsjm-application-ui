import { useCallback, useEffect, useState } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';
import { appPreferences } from '../../../core/storage/app-storage';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: false });

export type BiometryLabel = 'Face ID' | 'Touch ID' | 'Fingerprint';

const labelForBiometry = (biometryType: string | undefined): BiometryLabel => {
  switch (biometryType) {
    case 'FaceID':
      return 'Face ID';
    case 'TouchID':
      return 'Touch ID';
    default:
      return 'Fingerprint';
  }
};

/**
 * Biometric availability + the enable-after-first-login flow (BRD
 * TC-ADMIN-004). Availability comes from the device sensor; the enabled flag
 * is a user preference stored in MMKV and only offered after a successful
 * credential login.
 */
export const useBiometrics = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryLabel, setBiometryLabel] = useState<BiometryLabel>('Fingerprint');
  const [isEnabled, setIsEnabled] = useState(appPreferences.isBiometricEnabled());

  useEffect(() => {
    let cancelled = false;
    rnBiometrics
      .isSensorAvailable()
      .then(({ available, biometryType }) => {
        if (cancelled) return;
        setIsAvailable(available);
        setBiometryLabel(labelForBiometry(biometryType));
      })
      .catch(() => {
        if (!cancelled) setIsAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Runs the native biometric prompt. Resolves true only on success. */
  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Unlock HRSJM Admin',
        cancelButtonText: 'Cancel',
      });
      return success;
    } catch {
      return false;
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    appPreferences.setBiometricEnabled(enabled);
    setIsEnabled(enabled);
  }, []);

  return { isAvailable, isEnabled, biometryLabel, authenticate, setEnabled };
};

export default useBiometrics;