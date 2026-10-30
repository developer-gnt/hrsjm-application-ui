/**
 * Fast, robust JWT decode and expiry check without external dependencies.
 */

export interface JwtPayload {
  sub?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export function parseJwtPayload(token: string): JwtPayload | null {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    let jsonStr: string;
    if (typeof atob === 'function') {
      jsonStr = atob(base64);
    } else if (typeof Buffer !== 'undefined') {
      jsonStr = Buffer.from(base64, 'base64').toString('utf8');
    } else {
      // Fallback for environments without atob or Buffer
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let str = '';
      for (let i = 0; i < base64.length; i += 4) {
        const b0 = chars.indexOf(base64.charAt(i));
        const b1 = chars.indexOf(base64.charAt(i + 1));
        const b2 = chars.indexOf(base64.charAt(i + 2));
        const b3 = chars.indexOf(base64.charAt(i + 3));

        const c0 = (b0 << 2) | (b1 >> 4);
        const c1 = ((b1 & 15) << 4) | (b2 >> 2);
        const c2 = ((b2 & 3) << 6) | b3;

        str += String.fromCharCode(c0);
        if (b2 !== 64 && b2 !== -1) str += String.fromCharCode(c1);
        if (b3 !== 64 && b3 !== -1) str += String.fromCharCode(c2);
      }
      jsonStr = decodeURIComponent(escape(str));
    }

    return JSON.parse(jsonStr) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token has expired.
 * @param token The raw JWT string
 * @param clockSkewSeconds Margin of safety in seconds (default: 30)
 * @returns true if token is missing, invalid, or expired; false if valid
 */
export function isJwtExpired(token: string | null | undefined, clockSkewSeconds: number = 30): boolean {
  if (!token) return true;

  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    // If token has no exp field, consider it valid until rejected by server
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds + clockSkewSeconds >= payload.exp;
}

