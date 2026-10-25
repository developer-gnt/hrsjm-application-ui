/**
 * Application-level configuration.
 * Simply change CURRENT_ENV to 'local' or 'production'.
 */
export type AppEnvironment = 'local' | 'production';

// Switch between 'local' and 'production' here:
export const CURRENT_ENV: AppEnvironment = 'production';

const API_BASE_URLS: Record<AppEnvironment, string> = {
  // Local development backend
  local: 'http://localhost:3000/api/v1',
  // Production VPS backend (Hostinger hPanel VPS)
  production: 'http://194.164.151.17:3000/api/v1',
};

export const APP_CONFIG = {
  appName: 'HRSJM Admin',
  version: '1.0.0',
  env: CURRENT_ENV,
  apiBaseUrl: API_BASE_URLS[CURRENT_ENV],
  requestTimeoutMs: 15000,
} as const;