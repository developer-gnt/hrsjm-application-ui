import { Platform } from 'react-native';

// Backend: HRSJM-back-api (/api/v1). All endpoints live under this prefix (BRD standard).
// 10.0.2.2 is the Android emulator alias for the host machine's localhost.
export const API_BASE_URL = Platform.select({
  android: 'http://localhost:3000/api/v1',
  default: 'http://localhost:3000/api/v1',
}) as string;

export const API_TIMEOUT_MS = 15000;

export const APP_VERSION = '0.1.0';

// Legal document URLs (configuration point - swap for the production URLs
// when the legal content is hosted).
export const PRIVACY_POLICY_URL = 'https://hrsjm.org/privacy-policy';
export const TERMS_CONDITIONS_URL = 'https://hrsjm.org/terms-and-conditions';
