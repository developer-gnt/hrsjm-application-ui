import { Platform } from 'react-native';
import { axiosInstance } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';

export type PassbookTransactionType = 'ALL' | 'PAYMENT_IN' | 'PAYMENT_OUT';
export type PassbookExportFormat = 'PDF' | 'XLSX' | 'CSV';

export interface PassbookExportParams {
  transactionType: PassbookTransactionType;
  fromDate?: string;
  toDate?: string;
  format: PassbookExportFormat;
}

export interface ExportPassbookResult {
  status: 'downloaded' | 'shared' | 'opened';
  filename: string;
  bytesCount: number;
}

const MIME_MAP: Record<PassbookExportFormat, string> = {
  PDF: 'application/pdf',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  CSV: 'text/csv; charset=utf-8',
};

const EXT_MAP: Record<PassbookExportFormat, string> = {
  PDF: 'pdf',
  XLSX: 'xlsx',
  CSV: 'csv',
};

/**
 * Robust ArrayBuffer to Base64 encoder safe for large files across JS runtimes.
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }

  if (typeof btoa === 'function') {
    return btoa(binary);
  }

  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < binary.length; i += 3) {
    const b1 = binary.charCodeAt(i);
    const b2 = binary.charCodeAt(i + 1);
    const b3 = binary.charCodeAt(i + 2);
    const e1 = b1 >> 2;
    const e2 = ((b1 & 3) << 4) | (b2 >> 4);
    const e3 = isNaN(b2) ? 64 : ((b2 & 15) << 2) | (b3 >> 6);
    const e4 = isNaN(b2) || isNaN(b3) ? 64 : b3 & 63;
    output +=
      chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
  }
  return output;
};

const isWebBrowser = (): boolean =>
  typeof globalThis !== 'undefined' &&
  Boolean((globalThis as any).window) &&
  Boolean((globalThis as any).document);

/**
 * Extracts filename from Content-Disposition header if available.
 */
const parseFilenameFromHeaders = (
  headers: Record<string, any> | undefined,
  fallback: string,
): string => {
  if (!headers) return fallback;
  const disposition =
    headers['content-disposition'] || headers['Content-Disposition'];
  if (disposition && typeof disposition === 'string') {
    const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }
  }
  return fallback;
};

/**
 * Calls backend GET /api/v1/passbook/export with query params:
 * transactionType, fromDate, toDate, format.
 * Receives the binary response, parses filename, and saves or shares the file.
 */
export const exportPassbookStatement = async (
  params: PassbookExportParams,
): Promise<ExportPassbookResult> => {
  const queryParams: Record<string, string> = {
    transactionType: params.transactionType,
    format: params.format,
  };

  if (params.fromDate && params.fromDate.trim()) {
    queryParams.fromDate = params.fromDate.trim();
  }
  if (params.toDate && params.toDate.trim()) {
    queryParams.toDate = params.toDate.trim();
  }

  const response = await axiosInstance.get(ApiRoutes.PASSBOOK.EXPORT, {
    params: queryParams,
    responseType: 'arraybuffer',
  });

  const arrayBuffer = response.data as ArrayBuffer;
  const rawContentType = response.headers['content-type'] ?? MIME_MAP[params.format];
  const contentType = String(rawContentType).toLowerCase();

  // If server returned an application/json error payload despite 200 or inside arraybuffer
  if (contentType.includes('application/json')) {
    const text = new TextDecoder().decode(new Uint8Array(arrayBuffer));
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || 'Passbook export failed on server');
    } catch (e: any) {
      if (e.message && e.message !== 'Passbook export failed on server') {
        throw new Error(e.message);
      }
    }
  }

  const ext = EXT_MAP[params.format];
  const dateSlug = params.fromDate
    ? `${params.fromDate}_to_${params.toDate || 'present'}`
    : 'lifetime';
  const defaultFilename = `HRSJM_Passbook_${params.transactionType}_${dateSlug}.${ext}`;
  const filename = parseFilenameFromHeaders(response.headers, defaultFilename);
  const mimeType = MIME_MAP[params.format];

  // 1. Web Environment: Trigger instant browser download via Blob
  if (Platform.OS === 'web' || isWebBrowser()) {
    const web: any = globalThis;
    const blob = new (web.Blob || (globalThis as any).Blob)([arrayBuffer as any], {
      type: mimeType,
    });
    const url = web.URL.createObjectURL(blob);
    const link = web.document.createElement('a');
    link.href = url;
    link.download = filename;
    web.document.body.appendChild(link);
    link.click();
    link.remove();
    web.window.setTimeout(() => web.URL.revokeObjectURL(url), 2000);

    return {
      status: 'downloaded',
      filename,
      bytesCount: arrayBuffer.byteLength,
    };
  }

  // 2. React Native (Android / iOS) Environment
  const base64Data = arrayBufferToBase64(arrayBuffer);
  let RNFS: any;
  try {
    const mod = typeof require !== 'undefined' ? require('react-native-blob-util') : null;
    RNFS = mod ? (mod.default || mod) : (await import('react-native-blob-util')).default;
  } catch {
    RNFS = (await import('react-native-blob-util')).default;
  }
  const dirs = RNFS.fs.dirs;

  // On Android, download directory is dirs.DownloadDir; on iOS dirs.DocumentDir
  const savePath = dirs.DownloadDir
    ? `${dirs.DownloadDir}/${filename}`
    : `${dirs.DocumentDir}/${filename}`;

  await RNFS.fs.writeFile(savePath, base64Data, 'base64');

  if (dirs.DownloadDir) {
    await (RNFS.fs.scanFile as any)(savePath).catch(() => undefined);
  }

  // Attempt to open native share sheet so user can send, open, or save
  try {
    let NativeShare: any;
    try {
      const shareMod = typeof require !== 'undefined' ? require('react-native-share') : null;
      NativeShare = shareMod ? (shareMod.default || shareMod) : (await import('react-native-share')).default;
    } catch {
      NativeShare = (await import('react-native-share')).default;
    }

    const shareRes = await NativeShare.open({
      url: `file://${savePath}`,
      type: mimeType,
      title: `HRSJM Passbook Export - ${filename}`,
      subject: `HRSJM Passbook Statement (${params.transactionType})`,
      failOnCancel: false,
    });

    return {
      status: shareRes?.dismissedAction ? 'downloaded' : 'shared',
      filename,
      bytesCount: arrayBuffer.byteLength,
    };
  } catch (_shareErr) {
    // If user cancelled share sheet or share is unavailable, file is still saved to downloads
    return {
      status: 'downloaded',
      filename,
      bytesCount: arrayBuffer.byteLength,
    };
  }
};
