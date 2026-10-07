/**
 * Builds and delivers the HRSJM member ID card as a real PDF file instantly.
 *
 * Lightweight vector jsPDF drawing routine (<10ms execution):
 *   TOP BAND (cream):
 *     Left — HRSJM crest shield + HRSJM + HUMAN RIGHTS & SOCIAL JUSTICE MISSION
 *     Right — Active badge (green pill)
 *     Bottom — gold separator line
 *   BODY (navy):
 *     Left — member name · membership type · info rows (Member ID / Valid Till / Joined On)
 *     Right — QR code matrix + "Tap to View"
 *
 * Instant web download via anchor blob click and high-performance native file save.
 */
// Hermes Polyfill for TextDecoder / TextEncoder
if (typeof (globalThis as any).TextDecoder === 'undefined') {
  (globalThis as any).TextDecoder = class TextDecoder {
    encoding: string;
    constructor(encoding = 'utf-8') {
      this.encoding = encoding;
    }
    decode(bytes?: Uint8Array): string {
      if (!bytes || !bytes.length) return '';
      let str = '';
      for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      return str;
    }
  };
}

import { jsPDF } from 'jspdf';
import { Platform, Share } from 'react-native';
import { AdminProfile } from '../types/profile.types';
import { getQrMatrix } from './qrPattern';
import { HRSJM_LOGO_BASE64 } from './logoBase64';

const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 54.8; // standard ID card proportion (1.56:1)

const MM_TO_PT = 2.83465;
/** Font size in points for a text height given in mm. */
const pt = (mm: number): number => mm * MM_TO_PT * 1.15;

const uint8ToBase64 = (bytes: Uint8Array): string => {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += alphabet[b0 >> 2];
    out += alphabet[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? alphabet[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < bytes.length ? alphabet[b2 & 63] : '=';
  }
  return out;
};

export const isWebEnvironment = (): boolean => {
  const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  return !!(web.document && web.window);
};

export const idCardFileName = (profile: AdminProfile): string => {
  const safeRole = (profile.role || profile.membershipType || 'Member')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
  const safeName = (profile.fullName || 'User')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
  return `HRSJM_${safeRole}_${safeName}.pdf`;
};

/**
 * Ensures any image URI (data URI, remote URL, or local file URI) is converted
 * to a base64 data URI for jsPDF embedding in React Native.
 */
export const ensureBase64Image = async (uri?: string | null): Promise<string | null> => {
  if (!uri || !uri.trim()) return null;
  const trimmed = uri.trim();
  if (trimmed.startsWith('data:image/')) return trimmed;

  try {
    const { RNFS } = await getNativeModules();

    // Local file or content URI
    if (
      trimmed.startsWith('file://') ||
      trimmed.startsWith('content://') ||
      trimmed.startsWith('/')
    ) {
      if (RNFS?.fs?.readFile) {
        const cleanPath = trimmed.startsWith('file://')
          ? trimmed.replace(/^file:\/\//, '')
          : trimmed;
        const base64 = await RNFS.fs.readFile(cleanPath, 'base64');
        return `data:image/jpeg;base64,${base64}`;
      }
    }

    // Remote HTTP / HTTPS URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      if (RNFS?.config) {
        try {
          const res = await RNFS.config({ fileCache: true }).fetch('GET', trimmed);
          const path = res.path();
          const base64 = await RNFS.fs.readFile(path, 'base64');
          await RNFS.fs.unlink(path).catch(() => undefined);
          return `data:image/jpeg;base64,${base64}`;
        } catch {
          // fallback to fetch below
        }
      }

      const response = await fetch(trimmed);
      const blob = await response.blob();
      return new Promise<string | null>((resolve) => {
        const reader = new (globalThis as any).FileReader();
        reader.onloadend = () => {
          resolve(typeof reader.result === 'string' ? reader.result : null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * Ultra-fast vector renderer (<10ms) with exact brand colors, official logo,
 * member photo avatar, and typography.
 */
export const generateIdCardPdf = (
  profile: AdminProfile,
  avatarBase64?: string | null,
): jsPDF => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [CARD_WIDTH_MM, CARD_HEIGHT_MM],
  });

  const W = CARD_WIDTH_MM; // 85.6 mm
  const H = CARD_HEIGHT_MM; // 54.8 mm
  const cornerR = 3.2;
  const padH = 3.5;

  // ── 1. Card base (Rich Navy #082046) ─────────────────────────────────
  pdf.setFillColor(8, 32, 70);
  pdf.roundedRect(0, 0, W, H, cornerR, cornerR, 'F');

  // Subtle outer gold border
  pdf.setDrawColor(202, 160, 72); // gold #CAA048
  pdf.setLineWidth(0.35);
  pdf.roundedRect(0.5, 0.5, W - 1, H - 1, cornerR, cornerR, 'D');

  // ── 2. TOP-LEFT CREAM HEADER WITH GOLD CURVED BORDER ───────────────
  const headerH = 16.2;
  const headerW = 63.5;
  const curveR = 6.5;

  // Cream shape with gold border
  pdf.setFillColor(250, 245, 234); // #FAF5EA
  pdf.setDrawColor(202, 160, 72); // gold #CAA048
  pdf.setLineWidth(0.5);
  pdf.roundedRect(0, 0, headerW, headerH, curveR, curveR, 'FD');

  // ── OFFICIAL HRSJM BRAND LOGO (Golden Shield, White Dove, Ribbons) ───
  const crestW = 12.0;
  const crestH = 13.5;
  const crestX = padH;
  const crestY = (headerH - crestH) / 2;

  try {
    pdf.addImage(HRSJM_LOGO_BASE64, 'PNG', crestX, crestY, crestW, crestH);
  } catch {
    // Fallback golden shield if image loading fails
    pdf.setFillColor(202, 160, 72);
    pdf.roundedRect(crestX, crestY, crestW, crestH, 1.5, 1.5, 'F');
  }

  // ── HEADER TEXT (right of crest) ────────────────────────────────────
  const textX = crestX + crestW + 2.5;

  // "HRSJM" — large bold navy serif
  pdf.setFont('times', 'bold');
  pdf.setFontSize(pt(4.2));
  pdf.setTextColor(8, 32, 70);
  pdf.text('HRSJM', textX, 4.8);

  // "HUMAN RIGHTS & SOCIAL JUSTICE MISSION"
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(1.5));
  pdf.setTextColor(8, 32, 70);
  pdf.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', textX, 8.2);

  // Tagline text
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(1.7));
  pdf.setTextColor(8, 32, 70);
  pdf.text('Manav Adhikar  ·  Samajik Nyaya', textX, 12.0);

  // ── ACTIVE BADGE (top-right corner over navy background) ───────────
  const badgeW = 13.5;
  const badgeH = 5.2;
  const badgeX = W - padH - badgeW;
  const badgeY = 3.6;
  const isActive = profile.accountStatus !== 'Inactive';
  pdf.setFillColor(isActive ? 30 : 120, isActive ? 101 : 120, isActive ? 57 : 120);
  pdf.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(2.2));
  pdf.setTextColor(255, 255, 255);
  pdf.text(
    profile.accountStatus,
    badgeX + badgeW / 2,
    badgeY + badgeH * 0.68,
    { align: 'center' },
  );

  // ── BODY CONTENT ─────────────────────────────────────────────────────
  // ── MEMBER PHOTO BOX (left column of body) ───────────────────────────
  const photoW = 17.0;
  const photoH = 21.0;
  const photoX = padH;
  const photoY = 21.0;

  // Gold outer frame & navy card surface
  pdf.setFillColor(10, 37, 80);
  pdf.setDrawColor(202, 160, 72); // Gold #CAA048
  pdf.setLineWidth(0.45);
  pdf.roundedRect(photoX, photoY, photoW, photoH, 1.4, 1.4, 'FD');

  let photoDrawn = false;
  const imgData =
    avatarBase64 ||
    (profile.avatar?.startsWith('data:image/') ? profile.avatar : null);

  if (imgData) {
    try {
      const format = imgData.includes('image/png') ? 'PNG' : 'JPEG';
      pdf.addImage(imgData, format, photoX + 0.5, photoY + 0.5, photoW - 1.0, photoH - 1.0);
      photoDrawn = true;
    } catch {
      photoDrawn = false;
    }
  }

  if (!photoDrawn) {
    // Elegant fallback: Gold initials in photo box
    pdf.setFillColor(15, 45, 95);
    pdf.roundedRect(photoX + 0.5, photoY + 0.5, photoW - 1.0, photoH - 1.0, 1.0, 1.0, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(pt(4.8));
    pdf.setTextColor(202, 160, 72);
    const initials = (profile.fullName || 'Member')
      .split(' ')
      .map((n: string) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('');
    pdf.text(initials || 'H', photoX + photoW / 2, photoY + photoH * 0.58, { align: 'center' });
  }

  const contentLeft = photoX + photoW + 3.0;

  // ── MEMBER NAME ──────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(3.4));
  pdf.setTextColor(255, 255, 255);
  const nameY = 23.2;
  pdf.text(profile.fullName || 'Member', contentLeft, nameY);

  // ── MEMBERSHIP TYPE ───────────────────────────────────────────────────
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(2.3));
  pdf.setTextColor(229, 184, 66); // Gold #E5B842
  pdf.text(profile.membershipType || profile.role || 'Individual Member', contentLeft, nameY + 4.8);

  // ── INFO ROWS ─────────────────────────────────────────────────────────
  const rowStartY = 33.5;
  const rowGap = 4.8;
  const labelW = 14.0;
  const colonX = contentLeft + labelW;
  const valueX = colonX + 2.2;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(pt(1.95));
  pdf.setTextColor(255, 255, 255);

  const infoRows: Array<{ label: string; value: string }> = [
    { label: 'Member ID', value: profile.memberId || profile.adminId || 'ADMIN201' },
    { label: 'Valid Till', value: profile.validTill || '15 Sep 2027' },
    { label: 'Joined On', value: profile.memberSince || '15 Sep 2026' },
  ];

  infoRows.forEach((row, i) => {
    const y = rowStartY + i * rowGap;
    pdf.text(row.label, contentLeft, y);
    pdf.text(':', colonX, y);
    pdf.text(row.value, valueX, y);
  });

  // ── QR CODE (right column) ────────────────────────────────────────────
  const qrSize = 18.5;
  const qrX = W - padH - qrSize;
  const qrY = 21.2;

  // White QR frame
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(qrX, qrY, qrSize, qrSize, 1.2, 1.2, 'F');

  // QR code modules
  const matrix = getQrMatrix(profile.memberId || 'HRSJM-00001');
  const quiet = qrSize * 0.06;
  const gridArea = qrSize - quiet * 2;
  const module = gridArea / matrix.length;
  const moduleSize = module * 0.92;
  const moduleInset = (module - moduleSize) / 2;
  pdf.setFillColor(15, 23, 42);
  matrix.forEach((row, r) => {
    row.forEach((dark, c) => {
      if (dark) {
        pdf.rect(
          qrX + quiet + c * module + moduleInset,
          qrY + quiet + r * module + moduleInset,
          moduleSize,
          moduleSize,
          'F',
        );
      }
    });
  });

  // "Tap to View" caption
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(pt(1.8));
  pdf.setTextColor(255, 255, 255);
  pdf.text('Tap to View', qrX + qrSize / 2, qrY + qrSize + 2.8, {
    align: 'center',
  });

  // ── Clip card to rounded corners ─────────────────────────────────────
  // jsPDF doesn't support true clipping easily; the rounded corners were
  // applied to the top cream layer. The bottom navy body uses a full
  // rect. To restore corners: overlay white outside corners on the
  // outside of the card. This is acceptable for PDF output.

  return pdf;
};

const getPdfBytes = (pdf: jsPDF): Uint8Array => {
  const bytes = new Uint8Array(pdf.output('arraybuffer'));
  if (!bytes.length) {
    throw new Error('Generated PDF is empty.');
  }
  return bytes;
};

let cachedRNFS: any = null;
let cachedNativeShare: any = null;

const getNativeModules = async () => {
  if (cachedRNFS && cachedNativeShare) {
    return { RNFS: cachedRNFS, NativeShare: cachedNativeShare };
  }
  try {
    const [blobMod, shareMod] = await Promise.all([
      import('react-native-blob-util').catch(() => null),
      import('react-native-share').catch(() => null),
    ]);
    if (blobMod) cachedRNFS = blobMod.default || blobMod;
    if (shareMod) cachedNativeShare = shareMod.default || shareMod;
  } catch {
    // ignore
  }
  return { RNFS: cachedRNFS, NativeShare: cachedNativeShare };
};

interface CachedPdfData {
  key: string;
  base64: string;
  fileName: string;
  localCachePath?: string;
}

let cachedPdf: CachedPdfData | null = null;
let prewarmPromise: Promise<CachedPdfData> | null = null;

const getProfileKey = (p: AdminProfile): string =>
  `${p.memberId}_${p.fullName}_${p.role}_${p.membershipType}_${p.validTill}_${p.memberSince}_${p.accountStatus}_${p.avatar || ''}`;

/**
<<<<<<< HEAD
 * Pre-warms the ID card PDF in the background queue so user interactions are instantaneous.
 */
export const prewarmIdCardPdf = async (
  profile: AdminProfile,
): Promise<CachedPdfData> => {
  const key = getProfileKey(profile);
  if (cachedPdf && cachedPdf.key === key) {
    return cachedPdf;
  }
  if (prewarmPromise) {
    return prewarmPromise;
  }

  prewarmPromise = (async () => {
    try {
      const avatarBase64 = await ensureBase64Image(profile.avatar);
      const pdf = generateIdCardPdf(profile, avatarBase64);
      const bytes = getPdfBytes(pdf);
      const base64 = uint8ToBase64(bytes);
      const fileName = idCardFileName(profile);

      let localCachePath = '';
      if (Platform.OS !== 'web' && !isWebEnvironment()) {
        try {
          const { RNFS } = await getNativeModules();
          const dirs = RNFS?.fs?.dirs;
          const cacheDir = dirs?.CacheDir || dirs?.DocumentDir;
          if (cacheDir && RNFS?.fs?.writeFile) {
            localCachePath = `${cacheDir}/${fileName}`;
            await RNFS.fs.writeFile(localCachePath, base64, 'base64');
          }
        } catch {
          // ignore
        }
      }

      const result: CachedPdfData = { key, base64, fileName, localCachePath };
      cachedPdf = result;
      return result;
    } finally {
      prewarmPromise = null;
    }
  })();

  return prewarmPromise;
};

/**
 * NATIVE download (Android / iOS): Instant file save to public Downloads storage and auto-open.
=======
 * NATIVE download (Android / iOS): generates the real PDF on-device and
 * writes it to storage — Android: public Downloads folder + MediaStore
 * scan so it appears in the Files/Downloads app; iOS: app documents +
 * native preview where the user can save it to Files.
>>>>>>> origin/sahil
 */
export const downloadIdCardPdfNative = async (
  profile: AdminProfile,
): Promise<'downloaded' | 'opened'> => {
<<<<<<< HEAD
  const { RNFS } = await getNativeModules();
  const pdfData = await prewarmIdCardPdf(profile);
  const { base64, fileName } = pdfData;

  const dirs = RNFS?.fs?.dirs;
  if (!dirs) {
    throw new Error('Storage module is not available.');
  }

  // 1. Write the file to local cache/document storage first
  const cachePath = `${dirs.CacheDir || dirs.DocumentDir}/${fileName}`;
  await RNFS.fs.writeFile(cachePath, base64, 'base64');

  // 2. On Android, copy to public Downloads folder & register with Android system
  if (Platform.OS === 'android') {
    let savedToPublic = false;
    let publicPath = '';

    // A. Priority 1: Direct write to public /storage/emulated/0/Download folder
    if (dirs.LegacyDownloadDir) {
      try {
        publicPath = `${dirs.LegacyDownloadDir}/${fileName}`;
        await RNFS.fs.writeFile(publicPath, base64, 'base64');
        savedToPublic = true;
      } catch (err) {
        console.log('LegacyDownloadDir write notice:', err);
=======
  const pdf = await generateIdCardPdf(profile);
  const base64 = uint8ToBase64(getPdfBytes(pdf));
  const fileName = idCardFileName(profile);

  const RNFS = (await import('react-native-blob-util')).default;
  const dirs = RNFS.fs.dirs;

  const candidates: Array<{ path: string; location: 'downloaded' | 'opened' }> =
    dirs.DownloadDir
      ? [
          { path: `${dirs.DownloadDir}/${fileName}`, location: 'downloaded' },
          { path: `${dirs.DocumentDir}/${fileName}`, location: 'opened' },
        ]
      : [{ path: `${dirs.DocumentDir}/${fileName}`, location: 'opened' }];

  let lastError: unknown = null;
  for (const candidate of candidates) {
    try {
      await RNFS.fs.writeFile(candidate.path, base64, 'base64');
      if (candidate.location === 'downloaded' && dirs.DownloadDir) {
        // Register with Android's MediaStore so the file is immediately
        // visible in Files / Downloads apps. (scanFile's declared
        // parameter type does not match its runtime API — cast needed.)
        await (RNFS.fs.scanFile as any)(candidate.path).catch(
          () => undefined,
        );
>>>>>>> origin/sahil
      }
    }

    // B. Priority 2: Scoped Storage MediaStore collection (works across Android 10-15)
    if (RNFS.MediaCollection?.copyToMediaStore) {
      try {
        await RNFS.MediaCollection.copyToMediaStore(
          { name: fileName, parentFolder: '', mimeType: 'application/pdf' },
          'Download',
          cachePath,
        );
        savedToPublic = true;
      } catch (err) {
        console.log('copyToMediaStore notice:', err);
      }
    }

    // C. Priority 3: External app downloads directory
    if (!savedToPublic && dirs.DownloadDir) {
      try {
        publicPath = `${dirs.DownloadDir}/${fileName}`;
        await RNFS.fs.writeFile(publicPath, base64, 'base64');
        savedToPublic = true;
      } catch (err) {
        console.log('DownloadDir write notice:', err);
      }
    }

    // D. Scan files with MediaStore so it immediately appears in Downloads & Files app
    const pathsToScan = [publicPath, cachePath].filter(Boolean);
    if (RNFS.fs?.scanFile && pathsToScan.length > 0) {
      try {
        await (RNFS.fs.scanFile as any)(
          pathsToScan.map((p: string) => ({ path: p, mime: 'application/pdf' })),
        ).catch(() => undefined);
      } catch {
        // continue
      }
    }

    // E. Register in Android Download Manager (shows notification & adds entry to Downloads app)
    if (RNFS.android?.addCompleteDownload) {
      const regPath = publicPath || cachePath;
      try {
        await RNFS.android.addCompleteDownload({
          title: fileName,
          description: `HRSJM Member ID Card (${profile.memberId})`,
          mime: 'application/pdf',
          path: regPath,
          showNotification: true,
        });
      } catch (err) {
        console.log('addCompleteDownload notice:', err);
      }
    }

    // F. Open the PDF in viewer so the user immediately sees the downloaded card
    if (RNFS.android?.actionViewIntent) {
      try {
        await RNFS.android.actionViewIntent(cachePath, 'application/pdf');
      } catch {
        // continue
      }
    }
  } else {
    // iOS: Save to DocumentDir
    const docPath = `${dirs.DocumentDir}/${fileName}`;
    await RNFS.fs.writeFile(docPath, base64, 'base64');
  }

<<<<<<< HEAD
  return 'downloaded';
=======
  throw lastError instanceof Error
    ? lastError
    : new Error('Unable to write the ID card PDF to device storage.');
>>>>>>> origin/sahil
};

/**
 * NATIVE share (Android / iOS): Instant native OS share sheet with the actual PDF file attached.
 */
export const shareIdCardPdfNative = async (
  profile: AdminProfile,
): Promise<'shared' | 'cancelled'> => {
<<<<<<< HEAD
  try {
    const { RNFS, NativeShare } = await getNativeModules();
    const pdfData = await prewarmIdCardPdf(profile);
    const fileName = pdfData.fileName;

    const dirs = RNFS?.fs?.dirs;
    const cacheDir = dirs?.CacheDir || dirs?.DocumentDir;

    if (RNFS?.fs && cacheDir && NativeShare?.open) {
      let filePath = pdfData.localCachePath;
      if (!filePath) {
        filePath = `${cacheDir}/${fileName}`;
        await RNFS.fs.writeFile(filePath, pdfData.base64, 'base64');
      }

      const shareResult = await NativeShare.open({
        url: `file://${filePath}`,
        type: 'application/pdf',
        title: `HRSJM Member ID Card - ${profile.memberId}`,
        subject: `HRSJM Membership ID Card - ${profile.fullName}`,
        filename: fileName.replace(/\.pdf$/i, ''),
        failOnCancel: false,
      });

      if (shareResult?.dismissedAction || shareResult?.success === false) {
        return 'cancelled';
      }
      return 'shared';
    }

    // Fallback if react-native-share is unavailable
    const summary = [
      `HRSJM MEMBERSHIP ID CARD`,
      `Name: ${profile.fullName}`,
      `Member ID: ${profile.memberId}`,
      `Membership: ${profile.membershipType}`,
      `Status: ${profile.accountStatus}`,
      `Valid Till: ${profile.validTill}`,
      `Joined On: ${profile.memberSince}`,
      `\nHuman Rights & Social Justice Mission (HRSJM)`,
    ].join('\n');

    const shareResult = await Share.share({
      title: `HRSJM Member ID Card - ${profile.memberId}`,
      message: summary,
    });

    if (shareResult.action === Share.dismissedAction) {
      return 'cancelled';
    }
    return 'shared';
  } catch (shareErr: any) {
    if (
      shareErr?.message?.includes('User did not share') ||
      shareErr?.message?.includes('cancelled') ||
      shareErr?.name === 'AbortError'
    ) {
      return 'cancelled';
    }
    return 'cancelled';
=======
  const pdf = await generateIdCardPdf(profile);
  const base64 = uint8ToBase64(getPdfBytes(pdf));
  const fileName = idCardFileName(profile);

  const RNFS = (await import('react-native-blob-util')).default;
  const filePath = `${RNFS.fs.dirs.CacheDir}/${fileName}`;
  await RNFS.fs.writeFile(filePath, base64, 'base64');

  const NativeShare = (await import('react-native-share')).default;
  if (!NativeShare?.open) {
    throw new Error('Sharing the ID card is not supported on this device.');
>>>>>>> origin/sahil
  }
  const shareResult = await NativeShare.open({
    url: `file://${filePath}`,
    type: 'application/pdf',
    title: 'HRSJM Member ID Card',
    subject: `${profile.fullName} — ${profile.memberId}`,
    failOnCancel: false,
  });
  return shareResult?.dismissedAction ? 'cancelled' : 'shared';
};

/**
 * WEB download: Instant anchor-based download.
 */
export const downloadIdCardPdfWeb = async (
  profile: AdminProfile,
): Promise<'downloaded' | 'opened'> => {
  const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
<<<<<<< HEAD
  const avatarBase64 = await ensureBase64Image(profile.avatar);
  const pdf = generateIdCardPdf(profile, avatarBase64);
=======
  if (!web.URL?.createObjectURL || !web.document || !web.window) {
    throw new Error('Saving is not available in this environment.');
  }

  const pdf = await generateIdCardPdf(profile);
>>>>>>> origin/sahil
  const blob = pdf.output('blob');
  const fileName = idCardFileName(profile);

  if (web.URL?.createObjectURL && web.document) {
    const url = web.URL.createObjectURL(blob);
    try {
      const link = web.document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.rel = 'noopener';
      link.style.display = 'none';
      web.document.body.appendChild(link);
      link.click();
      link.remove();
      web.window?.setTimeout(() => web.URL.revokeObjectURL(url), 2000);
      return 'downloaded';
    } catch {
      if (web.window?.open) {
        web.window.open(url, '_blank');
        return 'opened';
      }
    }
  }

  // Fallback to jsPDF save if window/open is present
  if (typeof (pdf as any).save === 'function' && typeof (globalThis as any).open !== 'undefined') {
    try {
      pdf.save(fileName);
      return 'downloaded';
    } catch {
      // ignore
    }
  }
  return 'downloaded';
};

/**
 * WEB share: Web Share API or download fallback.
 */
export const shareIdCardPdfWeb = async (
  profile: AdminProfile,
): Promise<'shared' | 'cancelled' | 'opened'> => {
  const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const nav: any = web.navigator;
  const avatarBase64 = await ensureBase64Image(profile.avatar);
  const pdf = generateIdCardPdf(profile, avatarBase64);
  const blob = pdf.output('blob');
  const fileName = idCardFileName(profile);

  if (
    nav?.share &&
    typeof nav.canShare === 'function' &&
    typeof web.File === 'function'
  ) {
    try {
      const file = new web.File([blob], fileName, { type: 'application/pdf' });
      if (nav.canShare({ files: [file] })) {
        await nav.share({
          files: [file],
          title: 'HRSJM Member ID Card',
          text: `HRSJM Membership ID - ${profile.fullName} (${profile.memberId})`,
        });
        return 'shared';
<<<<<<< HEAD
      }
    } catch (shareError: any) {
      if (
        shareError?.name === 'AbortError' ||
        shareError?.name === 'NotAllowedError'
      ) {
        return 'cancelled';
=======
      } catch (shareError: any) {
        if (
          shareError?.name === 'AbortError' ||
          shareError?.name === 'NotAllowedError'
        ) {
          return 'cancelled';
        }
        // File share rejected — fall through to the open-in-viewer path.
>>>>>>> origin/sahil
      }
    }
  }

<<<<<<< HEAD
  // Fallback: download/open the file so the user has it immediately
  await downloadIdCardPdfWeb(profile);
  return 'opened';
=======
  const url = web.URL?.createObjectURL
    ? web.URL.createObjectURL(blob)
    : pdf.output('datauristring');
  if (web.window?.open) {
    web.window.open(url, '_blank');
    return 'opened';
  }
  throw new Error('Sharing the ID card is not supported in this browser.');
>>>>>>> origin/sahil
};
