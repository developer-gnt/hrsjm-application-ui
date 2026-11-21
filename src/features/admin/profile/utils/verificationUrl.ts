/**
 * Resolves the publicly accessible verification URL for member QR codes.
 *
 * CRITICAL FIX:
 * Standard smartphone cameras (iPhone / Android) treat plain text like "ADMIN529"
 * as a search term, prompting a Google Search instead of opening the verification portal.
 *
 * Wrapping the member ID in a valid HTTP(S) URL directs standard cameras
 * directly to the Central Member Registry & Verification portal.
 */
import { Platform } from 'react-native';

export function getPublicVerificationUrl(tokenOrId: string): string {
  const clean = encodeURIComponent(String(tokenOrId || '').trim());
  const localLanIp = '192.168.0.164';

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';

    // If running locally, route to the accessible LAN IP so iPhone / Android on Wi-Fi load the verification screen
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${localLanIp}${port}/#/verify/${clean}`;
    }
    return `${window.location.origin}/#/verify/${clean}`;
  }

  // Default accessible verification URL for mobile native & devices on network
  return `http://${localLanIp}:8089/#/verify/${clean}`;
}

export default getPublicVerificationUrl;
