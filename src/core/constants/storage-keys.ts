export const StorageKeys = {
  ACCESS_TOKEN: 'hrsjm_access_token',
  REFRESH_TOKEN: 'hrsjm_refresh_token',
  USER_DATA: 'hrsjm_user_data',
  USER_PERMISSIONS: 'hrsjm_user_permissions',
  APP_THEME: 'hrsjm_app_theme',
  ONBOARDING_COMPLETED: 'hrsjm_onboarding_completed',
  BIOMETRIC_ENABLED: 'hrsjm_biometric_enabled',
} as const;

/** Keychain service identifier under which the refresh token is stored. */
export const KEYCHAIN_SERVICE = 'com.hrsjm.admin';

/** MMKV instance id for non-secret app preferences. */
export const MMKV_INSTANCE_ID = 'hrsjm-app-prefs';
