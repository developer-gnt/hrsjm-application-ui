import { Platform } from 'react-native';
import { API_BASE_URL } from '../../../../core/api/client';

// Real in-memory cache for user-uploaded documents (populated dynamically from actual file uploads)
export const UPLOADED_DOCUMENTS_CACHE: Record<string, string> = {};

export function registerUploadedDocument(fileName?: string, uri?: string): void {
  if (!fileName || !uri) return;
  const cleanName = fileName.trim().toLowerCase();
  UPLOADED_DOCUMENTS_CACHE[cleanName] = uri;
  try {
    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : null;
    if (win) {
      if (win.sessionStorage && uri.length < 5 * 1024 * 1024) {
        win.sessionStorage.setItem('doc_cache_' + cleanName, uri);
      }
      if (win.localStorage && uri.length < 5 * 1024 * 1024) {
        win.localStorage.setItem('doc_cache_' + cleanName, uri);
      }
    }
  } catch {}
}

export function getAllUploadedDocuments(): Record<string, string> {
  const result: Record<string, string> = { ...UPLOADED_DOCUMENTS_CACHE };
  try {
    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : null;
    if (win?.localStorage) {
      for (let i = 0; i < win.localStorage.length; i++) {
        const key = win.localStorage.key(i);
        if (key && key.startsWith('doc_cache_')) {
          const fileName = key.replace('doc_cache_', '');
          const uri = win.localStorage.getItem(key);
          if (uri && !result[fileName]) {
            result[fileName] = uri;
          }
        }
      }
    }
    if (win?.sessionStorage) {
      for (let i = 0; i < win.sessionStorage.length; i++) {
        const key = win.sessionStorage.key(i);
        if (key && key.startsWith('doc_cache_')) {
          const fileName = key.replace('doc_cache_', '');
          const uri = win.sessionStorage.getItem(key);
          if (uri && !result[fileName]) {
            result[fileName] = uri;
          }
        }
      }
    }
  } catch {}
  return result;
}

export function resolveUploadedFileUri(fileName?: string, explicitUri?: string): string | undefined {
  const isWeb = Platform.OS === 'web' || typeof (globalThis as any).document !== 'undefined';
  const isNativeMobileUri = Boolean(
    explicitUri && (explicitUri.startsWith('content://') || explicitUri.startsWith('file:///'))
  );

  // 1. If explicitUri is already a self-contained data URL or web HTTP URL, use it directly
  if (explicitUri) {
    if (
      explicitUri.startsWith('data:') ||
      explicitUri.startsWith('http://') ||
      explicitUri.startsWith('https://') ||
      explicitUri.startsWith('blob:')
    ) {
      return explicitUri;
    }

    // Relative backend uploads path
    if (explicitUri.startsWith('/uploads') || explicitUri.startsWith('uploads/')) {
      const cleanPath = explicitUri.startsWith('/') ? explicitUri : '/' + explicitUri;
      const backendBase = (API_BASE_URL || '').replace(/\/api\/v1\/?$/, '');
      return backendBase + cleanPath;
    }

    // On native mobile (Android / iOS), content:// and file:/// are directly loadable
    if (!isWeb && isNativeMobileUri) {
      return explicitUri;
    }
  }

  const cleanName = (fileName || '').trim().toLowerCase();

  // 2. Direct match in runtime cache
  if (cleanName && UPLOADED_DOCUMENTS_CACHE[cleanName]) {
    return UPLOADED_DOCUMENTS_CACHE[cleanName];
  }

  // 3. Check browser sessionStorage & localStorage
  try {
    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : null;
    if (cleanName && win) {
      if (win.sessionStorage) {
        const cached = win.sessionStorage.getItem('doc_cache_' + cleanName);
        if (cached) return cached;
      }
      if (win.localStorage) {
        const cachedLocal = win.localStorage.getItem('doc_cache_' + cleanName);
        if (cachedLocal) return cachedLocal;
      }
    }
  } catch {}

  // 4. Return explicitUri if valid on current platform, or undefined
  if (isWeb && isNativeMobileUri) {
    // Unrenderable in browser
    return undefined;
  }

  return explicitUri || undefined;
}
