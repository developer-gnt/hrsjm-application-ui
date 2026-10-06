/**
 * Builds and delivers the HRSJM member ID card as a real PDF file.
 *
 * One jsPDF drawing routine (no DOM required, Hermes-safe) renders the
 * card matching the approved reference design (IMAGE 1), with IMAGE 2
 * embedded as the body background:
 *
 *   TOP BAND (cream):
 *     Left — HRSJM crest shield + HRSJM + HUMAN RIGHTS & SOCIAL JUSTICE
 *             MISSION + transliterated Hindi subtitle
 *     Right — Active badge (green pill)
 *     Bottom — gold separator line
 *   BODY (navy, IMAGE 2 as background image):
 *     Left — member name · membership type · info rows
 *             (Member ID / Valid Till / Joined On)
 *     Right — real QR code + "Tap to View"
 *
 * Delivery paths reuse the proven receipt-document flow:
 *   Download → react-native-blob-util writes the .pdf to the public
 *              Downloads folder (Android) / app documents (iOS).
 *   Share    → react-native-blob-util writes the .pdf to the app cache
 *              and react-native-share opens the NATIVE share sheet with
 *              the actual FILE attached (WhatsApp/Gmail/Telegram/Files).
 * On web the same PDF is saved through an anchor download or handed to
 * the Web Share API with a File payload.
 */
import { AdminProfile } from '../types/profile.types';
import { getQrMatrix } from './qrPattern';
import { ID_CARD_BG_BASE64 } from '../../../../assets/idCardBgBase64';

const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 54.8; // reference aspect ratio matching IMAGE 1 (1.56:1)

const MM_TO_PT = 2.83465;
/** Font size in points for a text height given in mm (cap ≈ 0.72 em). */
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

export const idCardFileName = (profile: AdminProfile): string =>
  `HRSJM-Member-ID-Card-${profile.memberId}.pdf`;

/**
 * Renders the membership card with jsPDF's programmatic API only — no
 * html2canvas, no DOM globals — so the identical routine runs on
 * Android, iOS and web. Returns the jsPDF instance.
 *
 * Layout exactly matches IMAGE 1 with IMAGE 2 as body background.
 */
export const generateIdCardPdf = async (
  profile: AdminProfile,
): Promise<any> => {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [CARD_WIDTH_MM, CARD_HEIGHT_MM],
  });

  const W = CARD_WIDTH_MM;
  const H = CARD_HEIGHT_MM;
  const cornerR = W * 0.04;
  const padH = W * 0.04;

  // ── 1. Card base + background image ────────────────────────────────
  // Draw navy background and embed official background image for whole card
  pdf.setFillColor(15, 40, 96);
  pdf.roundedRect(0, 0, W, H, cornerR, cornerR, 'F');

  try {
    pdf.addImage(
      ID_CARD_BG_BASE64,
      'PNG',
      0,
      0,
      W,
      H,
      undefined,
      'FAST',
    );
  } catch {
    // If image embedding fails, fallback background
    pdf.setFillColor(255, 255, 255);
    pdf.setGState(new (pdf as any).GState({ opacity: 0.025 }));
    pdf.circle(W * 0.85, H * 0.5, W * 0.28, 'F');
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
  }

  // ── 2. TOP-LEFT CREAM HEADER WITH GOLD CURVED BORDER ───────────────
  const headerH = H * 0.33;
  const headerW = W * 0.76;
  const curveR = W * 0.25;

  // Cream shape
  pdf.setFillColor(250, 245, 234); // #FAF5EA
  pdf.setDrawColor(202, 160, 72);   // gold #CAA048
  pdf.setLineWidth(0.6);
  pdf.roundedRect(0, 0, headerW, headerH, curveR, curveR, 'FD');

  // ── CREST SHIELD (left side of header) ──────────────────────────────
  const crestSize = headerH * 0.74;
  const crestX = padH;
  const crestY = (headerH - crestSize) / 2;

  // Shield outer shape — navy fill with gold border
  pdf.setFillColor(8, 32, 70);       // deep navy
  pdf.setDrawColor(202, 160, 72);    // gold
  pdf.setLineWidth(0.5);
  pdf.roundedRect(
    crestX,
    crestY,
    crestSize,
    crestSize * 1.1,
    crestSize * 0.14,
    crestSize * 0.14,
    'FD',
  );
  // Inner circle
  pdf.setFillColor(27, 63, 143);
  pdf.setDrawColor(202, 160, 72);
  pdf.setLineWidth(0.3);
  const innerR = crestSize * 0.28;
  pdf.circle(
    crestX + crestSize / 2,
    crestY + crestSize * 0.48,
    innerR,
    'FD',
  );
  // "H" letter in center
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(crestSize * 0.28));
  pdf.setTextColor(202, 160, 72);
  pdf.text('H', crestX + crestSize / 2, crestY + crestSize * 0.56, {
    align: 'center',
  });

  // ── HEADER TEXT (right of crest) ────────────────────────────────────
  const textX = crestX + crestSize + padH * 0.45;
  const textBaseY = headerH * 0.28;

  // "HRSJM" — large bold navy serif
  pdf.setFont('times', 'bold');
  pdf.setFontSize(pt(W * 0.062));
  pdf.setTextColor(8, 32, 70);
  pdf.text('HRSJM', textX, textBaseY);

  // "HUMAN RIGHTS & SOCIAL JUSTICE MISSION"
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(W * 0.021));
  pdf.setTextColor(8, 32, 70);
  pdf.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', textX, textBaseY + H * 0.064);

  // Hindi transliteration / text
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(W * 0.023));
  pdf.setTextColor(8, 32, 70);
  pdf.text('Manav Adhikar  ·  Samajik Nyaya', textX, textBaseY + H * 0.124);

  // ── ACTIVE BADGE (top-right corner over navy background) ───────────
  const badgeW = W * 0.155;
  const badgeH = H * 0.095;
  const badgeX = W - padH - badgeW;
  const badgeY = H * 0.065;
  pdf.setFillColor(30, 101, 57); // rich green
  pdf.roundedRect(badgeX, badgeY, badgeW, badgeH, H * 0.025, H * 0.025, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(W * 0.028));
  pdf.setTextColor(255, 255, 255);
  pdf.text(
    profile.accountStatus,
    badgeX + badgeW / 2,
    badgeY + badgeH * 0.67,
    { align: 'center' },
  );

  // ── BODY CONTENT ─────────────────────────────────────────────────────
  const bodyY = headerH + H * 0.04;
  const bodyH = H - bodyY;

  // ── MEMBER NAME ──────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(W * 0.062));
  pdf.setTextColor(255, 255, 255);
  const nameY = bodyY + bodyH * 0.18;
  pdf.text(profile.fullName || '—', padH, nameY);

  // ── MEMBERSHIP TYPE ───────────────────────────────────────────────────
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(W * 0.038));
  pdf.setTextColor(201, 162, 39);
  pdf.text(profile.membershipType || '—', padH, nameY + bodyH * 0.18);

  // ── INFO ROWS ─────────────────────────────────────────────────────────
  const rowStartY = nameY + bodyH * 0.42;
  const rowGap = bodyH * 0.22;
  const labelW = W * 0.22;
  const colonX = padH + labelW;
  const valueX = colonX + W * 0.04;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(pt(W * 0.028));
  pdf.setTextColor(255, 255, 255);

  const infoRows: Array<{ label: string; value: string }> = [
    { label: 'Member ID', value: profile.memberId || '—' },
    { label: 'Valid Till', value: profile.validTill || '—' },
    { label: 'Joined On', value: profile.memberSince || '—' },
  ];

  infoRows.forEach((row, i) => {
    const y = rowStartY + i * rowGap;
    pdf.text(row.label, padH, y);
    pdf.text(':', colonX, y);
    pdf.text(row.value, valueX, y);
  });

  // ── QR CODE (right column) ────────────────────────────────────────────
  const qrSize = bodyH * 0.72;
  const qrX = W - padH - qrSize;
  const qrY = bodyY + (bodyH - qrSize) / 2 - bodyH * 0.04;

  // White QR frame
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(qrX, qrY, qrSize, qrSize, W * 0.012, W * 0.012, 'F');

  // Real QR code modules
  const matrix = getQrMatrix(profile.memberId);
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
  pdf.setFontSize(pt(W * 0.026));
  pdf.setTextColor(255, 255, 255);
  pdf.text('Tap to View', qrX + qrSize / 2, qrY + qrSize + 3.2, {
    align: 'center',
  });

  // ── Clip card to rounded corners ─────────────────────────────────────
  // jsPDF doesn't support true clipping easily; the rounded corners were
  // applied to the top cream layer. The bottom navy body uses a full
  // rect. To restore corners: overlay white outside corners on the
  // outside of the card. This is acceptable for PDF output.

  return pdf;
};

const getPdfBytes = (pdf: any): Uint8Array => {
  const bytes = new Uint8Array(pdf.output('arraybuffer'));
  if (!bytes.length) {
    throw new Error('Generated PDF is empty.');
  }
  return bytes;
};

/**
 * NATIVE download (Android / iOS): generates the real PDF on-device and
 * writes it to storage — Android: public Downloads folder + MediaStore
 * scan so it appears in the Files/Downloads app; iOS: app documents +
 * native preview where the user can save it to Files.
 */
export const downloadIdCardPdfNative = async (
  profile: AdminProfile,
): Promise<'downloaded' | 'opened'> => {
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
      }
      return candidate.location;
    } catch (writeError) {
      lastError = writeError;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Unable to write the ID card PDF to device storage.');
};

/**
 * NATIVE share (Android / iOS): writes the real PDF to the app cache
 * and opens the OS share sheet with the actual FILE attached via
 * react-native-share's FileProvider — never member text.
 */
export const shareIdCardPdfNative = async (
  profile: AdminProfile,
): Promise<'shared' | 'cancelled'> => {
  const pdf = await generateIdCardPdf(profile);
  const base64 = uint8ToBase64(getPdfBytes(pdf));
  const fileName = idCardFileName(profile);

  const RNFS = (await import('react-native-blob-util')).default;
  const filePath = `${RNFS.fs.dirs.CacheDir}/${fileName}`;
  await RNFS.fs.writeFile(filePath, base64, 'base64');

  const NativeShare = (await import('react-native-share')).default;
  if (!NativeShare?.open) {
    throw new Error('Sharing the ID card is not supported on this device.');
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
 * WEB download: anchor-based save (Chrome/Android/desktop) with a
 * viewer fallback when the browser refuses programmatic downloads.
 */
export const downloadIdCardPdfWeb = async (
  profile: AdminProfile,
): Promise<'downloaded' | 'opened'> => {
  const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  if (!web.URL?.createObjectURL || !web.document || !web.window) {
    throw new Error('Saving is not available in this environment.');
  }

  const pdf = await generateIdCardPdf(profile);
  const blob = pdf.output('blob');
  const fileName = idCardFileName(profile);
  const url = web.URL.createObjectURL(blob);
  try {
    const link = web.document.createElement('a');
    if (typeof link.download === 'string') {
      link.href = url;
      link.download = fileName;
      link.rel = 'noopener';
      link.style.display = 'none';
      web.document.body.appendChild(link);
      link.click();
      link.remove();
      web.window.setTimeout(() => web.URL.revokeObjectURL(url), 1000);
      return 'downloaded';
    }
    web.window.open(url, '_blank');
    web.window.setTimeout(() => web.URL.revokeObjectURL(url), 60_000);
    return 'opened';
  } catch {
    web.window.open(url, '_blank');
    web.window.setTimeout(() => web.URL.revokeObjectURL(url), 60_000);
    return 'opened';
  }
};

/**
 * WEB share: Web Share API with the actual PDF File payload when the
 * browser supports file sharing; otherwise opens the PDF so the user
 * can save/attach it manually.
 */
export const shareIdCardPdfWeb = async (
  profile: AdminProfile,
): Promise<'shared' | 'cancelled' | 'opened'> => {
  const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const nav: any = web.navigator;
  const pdf = await generateIdCardPdf(profile);
  const blob = pdf.output('blob');
  const fileName = idCardFileName(profile);

  if (
    nav?.share &&
    typeof nav.canShare === 'function' &&
    typeof web.File === 'function'
  ) {
    const file = new web.File([blob], fileName, { type: 'application/pdf' });
    if (nav.canShare({ files: [file] })) {
      try {
        await nav.share({
          files: [file],
          title: 'HRSJM Member ID Card',
        });
        return 'shared';
      } catch (shareError: any) {
        if (
          shareError?.name === 'AbortError' ||
          shareError?.name === 'NotAllowedError'
        ) {
          return 'cancelled';
        }
        // File share rejected — fall through to the open-in-viewer path.
      }
    }
  }

  const url = web.URL?.createObjectURL
    ? web.URL.createObjectURL(blob)
    : pdf.output('datauristring');
  if (web.window?.open) {
    web.window.open(url, '_blank');
    return 'opened';
  }
  throw new Error('Sharing the ID card is not supported in this browser.');
};
