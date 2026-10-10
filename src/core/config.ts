import { API_BASE_URL } from './api/client';
import { APP_CONFIG } from '../app/config/app.config';

export const APP_VERSION = APP_CONFIG.version || '1.0.0';
export const PRIVACY_POLICY_URL = 'https://hrsjm.org/privacy';
export const TERMS_CONDITIONS_URL = 'https://hrsjm.org/terms';

export { API_BASE_URL, APP_CONFIG };
export default { API_BASE_URL, APP_CONFIG, APP_VERSION, PRIVACY_POLICY_URL, TERMS_CONDITIONS_URL };
