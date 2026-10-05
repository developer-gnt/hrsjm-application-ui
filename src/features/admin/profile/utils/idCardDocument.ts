/**
 * Builds and delivers the HRSJM member ID card as a real PDF file.
 *
 * One jsPDF drawing routine (no DOM required, Hermes-safe) renders the
 * card at true CR80-size proportions, mirroring the approved reference
 * design used by the on-screen `MyIdCard` component:
 *   crest + HRSJM header → member photo/name/Active → icon info rows
 *   → QR column (verification caption, HRSJM MEMBER badge, tagline)
 *   → gold footer strip (HUMAN RIGHTS | SOCIAL JUSTICE | EQUALITY |
 *   EMPOWERMENT).
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

const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 71; // reference aspect ratio (width × 0.83)

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

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return ((parts[0]?.substring(0, 2) as string) || 'AU').toUpperCase();
};

/**
 * Renders the membership card with jsPDF's programmatic API only — no
 * html2canvas, no DOM globals — so the identical routine runs on
 * Android, iOS and web. Returns the jsPDF instance.
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
  const pad = W * 0.045;
  const footerH = W * 0.055;

  // ── Card body: navy face ─────────────────────────────────────────────
  pdf.setFillColor(15, 40, 96); // primaryDark navy
  pdf.roundedRect(0, 0, W, H, W * 0.045, W * 0.045, 'F');

  // Subtle diagonal background bands (upper-right treatment).
  pdf.setFillColor(255, 255, 255);
  pdf.setGState(new (pdf as any).GState({ opacity: 0.045 }));
  pdf.circle(W * 0.98, H * 0.06, W * 0.32, 'F');
  pdf.circle(W * 0.78, H * 0.02, W * 0.18, 'F');
  pdf.setGState(new (pdf as any).GState({ opacity: 1 }));

  // ── Header: crest + HRSJM + full name + Hindi ────────────────────────
  const crestSize = W * 0.082;
  const crestX = pad;
  const crestY = pad * 0.75;
  // Shield crest stand-in (gold outline, blue fill, gold H).
  pdf.setFillColor(27, 63, 143);
  pdf.setDrawColor(201, 162, 39);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(
    crestX,
    crestY,
    crestSize,
    crestSize * 1.12,
    crestSize * 0.14,
    crestSize * 0.14,
    'FD',
  );
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(crestSize * 0.42));
  pdf.setTextColor(201, 162, 39);
  pdf.text('H', crestX + crestSize / 2, crestY + crestSize * 0.72, {
    align: 'center',
  });

  const headerX = crestX + crestSize + pad * 0.55;
  pdf.setFontSize(pt(W * 0.056));
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('HRSJM', headerX, crestY + crestSize * 0.5);

  pdf.setFontSize(pt(W * 0.021));
  pdf.setFont('helvetica', 'bold');
  pdf.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', headerX, crestY + crestSize * 0.78);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(230, 195, 80);
  // Standard PDF fonts cannot encode Devanagari, so the PDF mirrors the
  // receipt document's transliteration of the Hindi motto.
  pdf.text('Manav Adhikar · Samajik Nyaya', headerX, crestY + crestSize * 1.05);

  // ── Member identity: photo, name, membership type, Active badge ─────
  const photoW = W * 0.15;
  const photoH = photoW * 1.25;
  const photoY = pad * 0.75 + crestSize * 1.12 + pad * 0.7;
  pdf.setFillColor(235, 241, 255);
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(pad, photoY, photoW, photoH, W * 0.02, W * 0.02, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(photoW * 0.34));
  pdf.setTextColor(27, 63, 143);
  pdf.text(initials(profile.fullName), pad + photoW / 2, photoY + photoH * 0.6, {
    align: 'center',
  });

  const nameX = pad + photoW + pad * 0.5;
  pdf.setFontSize(pt(W * 0.058));
  pdf.setTextColor(255, 255, 255);
  pdf.text(profile.fullName || '—', nameX, photoY + photoH * 0.45);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(pt(W * 0.04));
  pdf.setTextColor(201, 162, 39);
  pdf.text(profile.membershipType || '—', nameX, photoY + photoH * 0.78);

  const badgeW = W * 0.155;
  const badgeX = W - pad - badgeW;
  pdf.setFillColor(16, 185, 129);
  pdf.roundedRect(
    badgeX,
    photoY + photoH * 0.18,
    badgeW,
    photoH * 0.3,
    W * 0.018,
    W * 0.018,
    'F',
  );
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(W * 0.03));
  pdf.setTextColor(255, 255, 255);
  pdf.text(profile.accountStatus, badgeX + badgeW / 2, photoY + photoH * 0.39, {
    align: 'center',
  });

  // ── Info rows (left) with small icons ────────────────────────────────
  const rowsY = photoY + photoH + pad * 1.15;
  const rowGap = (H - footerH - rowsY - pad * 0.4) / 4;
  const iconX = pad + W * 0.014;
  const labelX = pad + W * 0.045;
  const valueX = pad + W * 0.33;

  const fields: Array<{
    label: string;
    value: string;
    kind: 'person' | 'calendar' | 'star' | 'badge';
  }> = [
    { label: 'Member ID', value: profile.memberId, kind: 'person' },
    { label: 'Date of Birth', value: profile.dateOfBirth, kind: 'calendar' },
    { label: 'Member Since', value: profile.memberSince, kind: 'star' },
    { label: 'Valid Till', value: profile.validTill, kind: 'badge' },
  ];

  const drawIcon = (kind: string, cx: number, cy: number, r: number) => {
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.3);
    switch (kind) {
      case 'person':
        pdf.circle(cx, cy - r * 0.35, r * 0.38, 'S');
        pdf.line(cx - r * 0.6, cy + r * 0.75, cx - r * 0.6, cy + r * 0.45);
        pdf.line(cx - r * 0.6, cy + r * 0.75, cx + r * 0.6, cy + r * 0.75);
        pdf.line(cx + r * 0.6, cy + r * 0.75, cx + r * 0.6, cy + r * 0.45);
        break;
      case 'calendar':
        pdf.rect(cx - r * 0.6, cy - r * 0.5, r * 1.2, r, 'S');
        pdf.line(cx - r * 0.25, cy - r * 0.75, cx - r * 0.25, cy - r * 0.45);
        pdf.line(cx + r * 0.25, cy - r * 0.75, cx + r * 0.25, cy - r * 0.45);
        pdf.line(cx - r * 0.35, cy, cx + r * 0.35, cy);
        break;
      case 'star': {
        // Five-point star polygon.
        const points: number[][] = [];
        for (let i = 0; i < 10; i += 1) {
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const radius = i % 2 === 0 ? r * 0.75 : r * 0.32;
          points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
        }
        pdf.setFillColor(201, 162, 39);
        for (let i = 0; i < 5; i += 1) {
          const [x1, y1] = points[i * 2];
          const [xm, ym] = points[(i * 2 + 1) % 10];
          const [x2, y2] = points[(i * 2 + 2) % 10];
          pdf.triangle(x1, y1, xm, ym, x2, y2, 'F');
        }
        break;
      }
      case 'badge':
      default:
        pdf.circle(cx, cy, r * 0.62, 'S');
        pdf.line(cx - r * 0.22, cy, cx - r * 0.04, cy + r * 0.22);
        pdf.line(cx - r * 0.04, cy + r * 0.22, cx + r * 0.28, cy - r * 0.2);
        break;
    }
  };

  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    const y = rowsY + i * rowGap;
    drawIcon(field.kind, iconX, y - 1, W * 0.016);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(pt(W * 0.032));
    pdf.setTextColor(201, 162, 39);
    pdf.text(field.label, labelX, y);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(pt(W * 0.032));
    pdf.setTextColor(255, 255, 255);
    pdf.text(field.value || '—', valueX, y);
  }

  // ── QR code (real encoder output, identical to the on-screen card) ──
  const qrSize = W * 0.19;
  const qrX = W - pad - qrSize;
  const qrY = photoY + photoH * 0.62;
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(qrX, qrY, qrSize, qrSize, W * 0.012, W * 0.012, 'F');

  const matrix = getQrMatrix(profile.memberId);
  const quiet = qrSize * 0.06;
  const module = (qrSize - quiet * 2) / matrix.length;
  const moduleSize = module * 0.9;
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

  const qrCenterX = qrX + qrSize / 2;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(pt(W * 0.026));
  pdf.setTextColor(255, 255, 255);
  pdf.text('Scan QR for', qrCenterX, qrY + qrSize + 3.4, { align: 'center' });
  pdf.text('verification', qrCenterX, qrY + qrSize + 5.8, { align: 'center' });

  // ── HRSJM MEMBER outlined badge ──────────────────────────────────────
  const memberBadgeW = W * 0.245;
  const memberBadgeH = W * 0.038;
  const memberBadgeY = qrY + qrSize + 7.6;
  pdf.setDrawColor(201, 162, 39);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(
    qrCenterX - memberBadgeW / 2,
    memberBadgeY,
    memberBadgeW,
    memberBadgeH,
    W * 0.012,
    W * 0.012,
    'S',
  );
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(W * 0.026));
  pdf.setTextColor(255, 255, 255);
  pdf.text(
    'HRSJM MEMBER',
    qrCenterX,
    memberBadgeY + memberBadgeH * 0.68,
    { align: 'center' },
  );

  // ── Tagline ───────────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(pt(W * 0.025));
  pdf.setTextColor(255, 255, 255);
  pdf.text('Together for a Fairer,', qrCenterX, memberBadgeY + memberBadgeH + 4, {
    align: 'center',
  });
  pdf.text(
    'More Just Society',
    qrCenterX,
    memberBadgeY + memberBadgeH + 6.2,
    { align: 'center' },
  );

  // ── Gold footer strip ────────────────────────────────────────────────
  pdf.setFillColor(201, 162, 39);
  pdf.rect(0, H - footerH, W, footerH, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(pt(W * 0.024));
  pdf.setTextColor(15, 40, 96);
  const footerItems = ['HUMAN RIGHTS', 'SOCIAL JUSTICE', 'EQUALITY', 'EMPOWERMENT'];
  const slot = W / footerItems.length;
  footerItems.forEach((item, i) => {
    pdf.text(item, slot * i + slot / 2, H - footerH / 2 + 1.2, {
      align: 'center',
    });
    if (i > 0) {
      pdf.setDrawColor(15, 40, 96);
      pdf.setLineWidth(0.25);
      pdf.line(
        slot * i,
        H - footerH * 0.78,
        slot * i,
        H - footerH * 0.22,
      );
    }
  });

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
