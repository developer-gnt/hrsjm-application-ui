/**
 * Application-level configuration. Imported by core (leaf module — no imports
 * back into src) so there is exactly one place to change environment settings.
 */
export const APP_CONFIG = {
  appName: 'HRSJM Admin',
  version: '1.0.0',
  // Android emulator reaches the host machine via 10.0.2.2. Physical devices
  // must use the LAN IP of the dev machine; release builds the production host.
  // Backend port comes from HRSJM-back-api APP_PORT (default 3000).
  apiBaseUrl: 'http://localhost:3000/api/v1',
  requestTimeoutMs: 15000,
} as const;