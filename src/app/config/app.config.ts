import { Platform } from 'react-native';

/**
 * Resolves the API base URL based on build environment and platform.
 *
 * In development (__DEV__ === true):
 * - Android emulator maps to host machine via http://10.0.2.2:3000/api/v1
 * - Web/other platforms map to http://localhost:3000/api/v1
 *
 * In production release (__DEV__ === false):
 * - Must be an explicitly configured HTTPS URL (e.g. REACT_APP_API_BASE_URL)
 * - Fails startup immediately if localhost, 10.0.2.2, or non-HTTPS URL is used.
 */
export function resolveApiBaseUrl(
  isDev: boolean = typeof __DEV__ !== 'undefined' ? __DEV__ : true,
  customProdUrl?: string,
): string {
  if (isDev) {
    return Platform.OS === 'android'
      ? 'http://10.0.2.2:3000/api/v1'
      : 'http://localhost:3000/api/v1';
  }

  const configuredProdUrl =
    customProdUrl ??
    (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) ??
    '';

  if (!configuredProdUrl || !configuredProdUrl.trim()) {
    throw new Error(
      'FATAL CONFIG ERROR: Production API Base URL is required for release builds. Please set REACT_APP_API_BASE_URL to an approved HTTPS endpoint.',
    );
  }

  if (
    configuredProdUrl.includes('10.0.2.2') ||
    configuredProdUrl.includes('localhost') ||
    configuredProdUrl.includes('127.0.0.1')
  ) {
    throw new Error(
      `FATAL CONFIG ERROR: Insecure emulator or localhost URL detected in production release build: ${configuredProdUrl}`,
    );
  }

  if (!configuredProdUrl.startsWith('https://')) {
    throw new Error(
      `FATAL CONFIG ERROR: Production API URL must use HTTPS. Received: ${configuredProdUrl}`,
    );
  }

  return configuredProdUrl.trim();
}

/**
 * Application-level configuration. Imported by core (leaf module — no imports
 * back into src) so there is exactly one place to change environment settings.
 */
export const APP_CONFIG = {
  appName: 'HRSJM Admin',
  version: '1.0.0',
  apiBaseUrl: resolveApiBaseUrl(),
  requestTimeoutMs: 15000,
} as const;
