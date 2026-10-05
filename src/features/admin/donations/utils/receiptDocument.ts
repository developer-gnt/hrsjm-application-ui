/**
 * Builds the standalone HRSJM donation receipt document used by the
 * Download (PDF), Share and Print actions. The document contains ONLY
 * the receipt, so printing never includes the app chrome, navigation
 * or list UI.
 */
import { formatDateTime } from '../../../../core';
import { DonationReceiptModel } from '../types/donations.types';

/**
 * Returns true only when running in a real browser / web environment
 * that has a DOM (i.e. the webpack web build accessed from any browser).
 * Returns false only when running as a bare React Native app on Android
 * or iOS where globalThis.document is undefined.
 *
 * NOTE: Do NOT add URL.createObjectURL to this check — some mobile
 * browsers and restricted WebViews have a DOM but no createObjectURL.
 * Those environments are still "web" and should use the web PDF path.
 */
export const isWebEnvironment = (): boolean => {
  const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  return !!(web.document && web.window);
};

const formatAmount = (amount: number): string =>
  `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const escapeHtml = (value: string | null | undefined): string =>
  String(value ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Receipt stylesheet. Scoped to `.receipt-doc` so it can be injected
 * both as a standalone document (print) and as an offscreen node for
 * client-side PDF rendering without leaking rules into the app page.
 */
export const receiptStyles = (): string => `
  .receipt-doc {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      'Helvetica Neue', Arial, sans-serif;
    color: #0F172A;
    background: #ffffff;
    margin: 0;
    padding: 24px 16px;
  }
  .receipt { max-width: 720px; margin: 0 auto; border: 1px solid #E2E8F0;
    border-radius: 16px; padding: 24px; background: #ffffff; }
  .brand { text-align: center; margin-bottom: 16px; }
  .brand-logo { display: inline-block; width: 44px; height: 44px;
    border: 2px solid #C9A227; border-radius: 10px; line-height: 44px;
    font-size: 20px; font-weight: 800; color: #1B3F8F; }
  .brand-name { font-size: 22px; font-weight: 800; color: #1B3F8F;
    margin: 8px 0 0; }
  .brand-full { font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
    color: #1B3F8F; margin: 2px 0 0; }
  .brand-motto { font-size: 11px; color: #C9A227; margin: 2px 0 0; }
  .receipt-title { text-align: center; font-size: 20px; font-weight: 800;
    letter-spacing: 1px; color: #1B3F8F; margin: 12px 0 16px; }
  .meta { display: flex; justify-content: space-between; gap: 16px;
    margin-bottom: 16px; }
  .meta div { flex: 1; }
  .meta .label { font-size: 11px; color: #64748B; }
  .meta .value { font-size: 14px; font-weight: 700; color: #0F172A;
    margin-top: 2px; }
  .meta .right { text-align: right; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th, td { text-align: left; padding: 6px 4px; font-size: 13px;
    border-bottom: 1px solid #F1F5F9; vertical-align: top; }
  th { color: #64748B; font-weight: 400; width: 42%; }
  td { color: #0F172A; font-weight: 500; }
  .section-heading { font-size: 13px; font-weight: 700; color: #0F2860;
    margin: 0 0 8px; }
  .amount-box { background: #0F2860; color: #ffffff; border-radius: 12px;
    text-align: center; padding: 16px; margin-bottom: 16px; }
  .amount-box .label { font-size: 11px; letter-spacing: 1px;
    color: #FFF8E6; margin: 0; }
  .amount-box .value { font-size: 26px; font-weight: 800; margin: 4px 0 0; }
  .tax-note { background: #FFF8E6; border-radius: 10px; padding: 12px;
    font-size: 12px; color: #0F2860; margin-bottom: 16px; }
  .thanks { background: #EBF1FF; border-radius: 12px; text-align: center;
    padding: 14px; font-size: 12px; color: #1B3F8F; }
  .thanks strong { display: block; font-size: 13px; margin-bottom: 4px; }
`;

const buildReceiptBody = (receipt: DonationReceiptModel): string => {
  const donorRows: Array<[string, string]> = [
    ['Donor Name', escapeHtml(receipt.donorName)],
    ['Member ID', escapeHtml(receipt.memberCode)],
    ['Phone', escapeHtml(receipt.donorMobile)],
    ['Donation Type', escapeHtml(receipt.cause)],
    ['Amount', `<strong>${formatAmount(receipt.amount)}</strong>`],
    ['Payment Method', escapeHtml(receipt.paymentMethod)],
    ['Transaction ID', escapeHtml(receipt.transactionId)],
  ];

  const infoRows: Array<[string, string]> = [
    ['Donation ID', escapeHtml(receipt.id)],
    ['Receipt No.', escapeHtml(receipt.receiptNumber)],
    ['Date &amp; Time', escapeHtml(formatDateTime(receipt.receiptDate))],
    ['Amount', `<strong>${formatAmount(receipt.amount)}</strong>`],
    ['Donation Type', escapeHtml(receipt.cause)],
    ['Payment Method', escapeHtml(receipt.paymentMethod)],
    ['Transaction ID', escapeHtml(receipt.transactionId)],
  ];

  const toRows = (rows: Array<[string, string]>) =>
    rows
      .map(
        ([label, value]) =>
          `<tr><th scope="row">${label}</th><td>${value}</td></tr>`,
      )
      .join('');

  return `<div class="receipt">
    <div class="brand">
      <div class="brand-logo">H</div>
      <div class="brand-name">HRSJM</div>
      <div class="brand-full">HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION</div>
      <div class="brand-motto">मानव अधिकार • सामाजिक न्याय</div>
    </div>
    <div class="receipt-title">DONATION RECEIPT</div>
    <div class="meta">
      <div>
        <div class="label">Receipt No.</div>
        <div class="value">${escapeHtml(receipt.receiptNumber)}</div>
      </div>
      <div class="right">
        <div class="label">Date</div>
        <div class="value">${escapeHtml(formatDateTime(receipt.receiptDate))}</div>
      </div>
    </div>
    <table>${toRows(donorRows)}</table>
    <div class="amount-box">
      <p class="label">AMOUNT RECEIVED</p>
      <div class="value">${formatAmount(receipt.amount)}</div>
    </div>
    <p class="tax-note">
      Eligible for income tax deduction under Section 80G of the IT Act.
      Registration: NGO/80G/HRSJM/2024.
    </p>
    <h3 class="section-heading">Donation Information</h3>
    <table>${toRows(infoRows)}</table>
    <div class="thanks">
      <strong>Thank you for your generous support!</strong>
      Your contribution helps us in our mission for human rights and social justice.
    </div>
  </div>`;
};

export const buildReceiptHtml = (receipt: DonationReceiptModel): string =>
  `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>HRSJM Donation Receipt ${escapeHtml(receipt.receiptNumber)}</title>
<style>
  @page { size: A4; margin: 12mm; }
  ${receiptStyles()}
  @media print {
    .receipt-doc { padding: 0; }
    .receipt { border: none; border-radius: 0; max-width: none; }
  }
</style>
</head>
<body>
  <div class="receipt-doc">${buildReceiptBody(receipt)}</div>
</body>
</html>`;

/**
 * Generates a real PDF (A4) for the selected donation entirely on the
 * client. The receipt markup is rendered off-screen with html2canvas
 * (so ₹ / Devanagari text render exactly like on screen) and embedded
 * into a jsPDF document, sliced across pages when needed.
 * Returns the jsPDF instance (use `.save()` to download and
 * `.output('blob')` for sharing).
 */
export const generateReceiptPdf = async (
  receipt: DonationReceiptModel,
): Promise<any> => {
  const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const doc: any = web.document;
  if (!doc || !web.Blob) {
    // Running on native React Native (Android / iOS) where there is no DOM.
    // Callers should check isWebEnvironment() before calling this function,
    // or catch this specific error code to show a native fallback instead of
    // displaying the generic error message.
    const err: any = new Error(
      'PDF generation is not available in this environment.',
    );
    err.code = 'NOT_WEB';
    throw err;
  }

  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);
  const html2canvas = html2canvasModule.default;

  const host = doc.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  // Render wider than the on-screen receipt so its aspect ratio matches
  // an A4 page and the whole receipt fits a single page at full size.
  host.innerHTML = `<style>${receiptStyles()}</style>
    <style>
      .receipt-doc { width: 1040px; }
      .receipt-doc .receipt { max-width: none; }
    </style>
    <div class="receipt-doc" id="hrsjm-receipt-doc">${buildReceiptBody(receipt)}</div>`;
  doc.body.appendChild(host);

  let canvas: any;
  try {
    canvas = await html2canvas(host.querySelector('#hrsjm-receipt-doc'), {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });
  } finally {
    host.remove();
  }

  // JPEG keeps the PDF small enough to share on mobile; the receipt is
  // flat-coloured UI so 0.92 quality is visually lossless.
  const receiptImage = canvas.toDataURL('image/jpeg', 0.92);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidthMm = 210;
  const pageHeightMm = 297;
  const marginMm = 10;
  const contentWidthMm = pageWidthMm - marginMm * 2;
  const contentHeightMm = pageHeightMm - marginMm * 2;
  const naturalHeightMm = (canvas.height * contentWidthMm) / canvas.width;

  // Always fit the complete receipt on a single A4 page: shrink to the
  // page height when needed and centre the result.
  const renderWidthMm =
    naturalHeightMm > contentHeightMm
      ? contentWidthMm * (contentHeightMm / naturalHeightMm)
      : contentWidthMm;
  const renderHeightMm = Math.min(naturalHeightMm, contentHeightMm);
  const offsetX = marginMm + (contentWidthMm - renderWidthMm) / 2;

  pdf.addImage(
    receiptImage,
    'JPEG',
    offsetX,
    marginMm,
    renderWidthMm,
    renderHeightMm,
  );

  return pdf;
};

/**
 * Encodes bytes as base64 without relying on btoa or Buffer, neither of
 * which is available in the Hermes runtime on native React Native.
 * (Chunked so large PDFs do not blow the function-call stack.)
 */
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

/**
 * Downloads the receipt PDF on NATIVE mobile (bare React Native Android /
 * iOS). Flow:
 *   handleDownload → generateReceiptPdfDirect (jsPDF, no DOM needed)
 *   → base64 → react-native-blob-util writes a REAL .pdf file
 *   → Android: public Downloads folder (+ MediaStore scan so it appears
 *     in the Files / Downloads app)  iOS: app documents + native preview
 *
 * This is Download's own path — it never touches Share or the share sheet.
 */
export const downloadReceiptPdfNative = async (
  receipt: DonationReceiptModel,
): Promise<'downloaded' | 'opened'> => {
  console.log('Download receipt started (native)');
  console.log('Selected donation:', {
    id: receipt.id,
    receiptNumber: receipt.receiptNumber,
    donorName: receipt.donorName,
    amount: receipt.amount,
  });

  console.log('Generating receipt PDF...');
  const pdf = await generateReceiptPdfDirect(receipt);
  const bytes = new Uint8Array(pdf.output('arraybuffer'));
  console.log('PDF generated:', pdf);
  console.log('PDF byte length:', bytes.length);
  if (!bytes.length) {
    throw new Error('Generated PDF is empty.');
  }
  const base64 = uint8ToBase64(bytes);
  const fileName = receiptFileName(receipt);

  console.log('Download flow started → saving file', fileName);
  const RNFS = (await import('react-native-blob-util')).default;
  const dirs = RNFS.fs.dirs;

  // Android gets the user-visible public Downloads folder; anything
  // Android 11+ accepts direct app writes there and MediaStore scan makes
  // it show up in the Files app. iOS has no shared Downloads folder, so
  // the file is written to the app documents dir and opened in the native
  // document preview (where iOS lets the user save it to Files).
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
        // Register the file with Android's MediaStore so it is visible in
        // Files / Downloads apps without a reboot. (scanFile's declared
        // parameter type does not match its runtime API, hence the cast.)
        await (RNFS.fs.scanFile as any)(candidate.path).catch(
          () => undefined,
        );
      }
      console.log('Receipt PDF saved to:', candidate.path);
      return candidate.location;
    } catch (writeError) {
      console.error('Write failed for', candidate.path, writeError);
      lastError = writeError;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Unable to write the receipt PDF to device storage.');
};

export const receiptFileName = (receipt: DonationReceiptModel): string =>
  `HRSJM-Donation-Receipt-${receipt.receiptNumber}.pdf`;

/**
 * Shares the receipt as an ACTUAL PDF FILE on native mobile (bare React
 * Native Android / iOS). Flow:
 *   handleShare → generateReceiptPdfDirect (jsPDF, no DOM needed)
 *   → base64 → react-native-blob-util writes a real .pdf to the app cache
 *   → react-native-share opens the NATIVE share sheet with that file
 *     (it routes file:// paths through its FileProvider as content://
 *     URIs, which is what WhatsApp/Telegram/Gmail require)
 *   → WhatsApp receives HRSJM-Donation-Receipt-<no>.pdf as a document
 *
 * NEVER passes receipt text as the share message — text-only sharing is
 * exactly the behaviour this replaces. The Web Share API is not used on
 * native; the OS share sheet is driven by the native module.
 */
export const shareReceiptPdfNative = async (
  receipt: DonationReceiptModel,
): Promise<'shared' | 'cancelled'> => {
  console.log('Share Receipt started (native)');
  console.log('Selected donation:', {
    id: receipt.id,
    receiptNumber: receipt.receiptNumber,
    donorName: receipt.donorName,
    amount: receipt.amount,
  });

  console.log('GENERATING PDF FOR SHARE');
  const pdf = await generateReceiptPdfDirect(receipt);
  const bytes = new Uint8Array(pdf.output('arraybuffer'));
  console.log('PDF size:', bytes.length);
  if (!bytes.length) {
    throw new Error('Generated PDF is empty.');
  }
  const base64 = uint8ToBase64(bytes);
  const fileName = receiptFileName(receipt);

  console.log('Writing PDF to app cache:', fileName);
  const RNFS = (await import('react-native-blob-util')).default;
  const filePath = `${RNFS.fs.dirs.CacheDir}/${fileName}`;
  await RNFS.fs.writeFile(filePath, base64, 'base64');
  console.log('PDF FILE CREATED FOR SHARE:', filePath);

  console.log('OPENING SHARE');
  const NativeShare = (await import('react-native-share')).default;
  if (!NativeShare?.open) {
    // The react-native-share native module is not in this build (it is
    // added after the APK was built). Report it instead of failing with
    // a cryptic TypeError — and NEVER fall back to a download or text.
    throw new Error('Sharing the PDF is not supported on this device.');
  }
  // failOnCancel:false makes the module RESOLVE when the user cancels,
  // reporting it via dismissedAction — a cancel is normal behaviour, not
  // an error, so no message is shown for it.
  const shareResult = await NativeShare.open({
    url: `file://${filePath}`,
    type: 'application/pdf',
    title: 'HRSJM Donation Receipt',
    subject: `HRSJM Donation Receipt ${receipt.receiptNumber}`,
    failOnCancel: false,
  });
  console.log('Share sheet result:', shareResult);
  return shareResult?.dismissedAction ? 'cancelled' : 'shared';
};

/**
 * Generates a receipt PDF using jsPDF's programmatic drawing API only —
 * no html2canvas, no DOM globals. Safe to call in bare React Native on
 * Android and iOS (Hermes engine supports the jsPDF text/colour APIs).
 *
 * Returns a jsPDF instance. Use:
 *   pdf.output('datauristring')  → "data:application/pdf;base64,…"
 *   pdf.output('blob')           → Blob (requires globalThis.Blob)
 */
export const generateReceiptPdfDirect = async (
  receipt: DonationReceiptModel,
): Promise<any> => {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PW = 210;
  const m = 16; // margin (mm)
  const cw = PW - m * 2; // content width
  const col2 = m + cw * 0.47; // value column x

  // ── Colour helpers ───────────────────────────────────────────────────────
  const setBlue  = () => pdf.setTextColor(27, 63, 143);
  const setGold  = () => pdf.setTextColor(201, 162, 39);
  const setDark  = () => pdf.setTextColor(15, 24, 42);
  const setMuted = () => pdf.setTextColor(100, 116, 139);
  const setWhite = () => pdf.setTextColor(255, 255, 255);
  const hairline = (y: number) => {
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.2);
    pdf.line(m, y, PW - m, y);
  };

  let y = 22;

  // ── Brand ─────────────────────────────────────────────────────────────────
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  setBlue();
  pdf.text('HRSJM', PW / 2, y, { align: 'center' });
  y += 7;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  setBlue();
  pdf.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', PW / 2, y, { align: 'center' });
  y += 5;

  pdf.setFontSize(9);
  setGold();
  pdf.text('Manav Adhikar  \u2022  Samajik Nyaya', PW / 2, y, { align: 'center' });
  y += 11;

  // ── Title ─────────────────────────────────────────────────────────────────
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  setBlue();
  pdf.text('DONATION RECEIPT', PW / 2, y, { align: 'center' });
  y += 6;
  hairline(y);
  y += 8;

  // ── Receipt No + Date ─────────────────────────────────────────────────────
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  setMuted();
  pdf.text('Receipt No.', m, y);
  pdf.text('Date', PW - m, y, { align: 'right' });
  y += 5;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  setDark();
  pdf.text(String(receipt.receiptNumber ?? '\u2014'), m, y);
  pdf.text(formatDateTime(receipt.receiptDate) ?? '\u2014', PW - m, y, { align: 'right' });
  y += 4;
  hairline(y);
  y += 8;

  // ── Donor rows ─────────────────────────────────────────────────────────────
  const amountStr = `Rs. ${Number(receipt.amount || 0).toLocaleString('en-IN')}`;
  const donorRows: Array<[string, string]> = [
    ['Donor Name',      String(receipt.donorName     ?? '\u2014')],
    ['Member ID',       String(receipt.memberCode     ?? '\u2014')],
    ['Phone',           String(receipt.donorMobile    ?? '\u2014')],
    ['Donation Type',   String(receipt.cause          ?? '\u2014')],
    ['Amount',          amountStr],
    ['Payment Method',  String(receipt.paymentMethod  ?? '\u2014')],
    ['Transaction ID',  String(receipt.transactionId  ?? '\u2014')],
  ];

  pdf.setFontSize(10);
  for (const [label, value] of donorRows) {
    pdf.setFont('helvetica', 'normal');
    setMuted();
    pdf.text(label, m, y);
    setDark();
    pdf.text(value, col2, y);
    y += 4;
    pdf.setDrawColor(241, 245, 249);
    pdf.setLineWidth(0.1);
    pdf.line(m, y, PW - m, y);
    y += 5;
  }

  y += 3;

  // ── Amount highlight box ───────────────────────────────────────────────────
  const boxH = 22;
  pdf.setFillColor(15, 40, 96);
  pdf.roundedRect(m, y, cw, boxH, 3, 3, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(255, 248, 230);
  pdf.text('AMOUNT RECEIVED', PW / 2, y + 8, { align: 'center' });
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  setWhite();
  pdf.text(amountStr, PW / 2, y + 17, { align: 'center' });
  y += boxH + 5;

  // ── 80G tax note ───────────────────────────────────────────────────────────
  pdf.setFillColor(255, 248, 230);
  pdf.roundedRect(m, y, cw, 14, 3, 3, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(15, 40, 96);
  pdf.text(
    'Eligible for income tax deduction under Section 80G of the IT Act.',
    PW / 2, y + 5, { align: 'center' },
  );
  pdf.text('Registration: NGO/80G/HRSJM/2024.', PW / 2, y + 10, { align: 'center' });
  y += 19;

  // ── Donation Information ───────────────────────────────────────────────────
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 40, 96);
  pdf.text('Donation Information', m, y);
  y += 7;

  const infoRows: Array<[string, string]> = [
    ['Donation ID',     String(receipt.id            ?? '\u2014')],
    ['Receipt No.',     String(receipt.receiptNumber  ?? '\u2014')],
    ['Date & Time',     formatDateTime(receipt.receiptDate) ?? '\u2014'],
    ['Amount',          amountStr],
    ['Donation Type',   String(receipt.cause          ?? '\u2014')],
    ['Payment Method',  String(receipt.paymentMethod  ?? '\u2014')],
    ['Transaction ID',  String(receipt.transactionId  ?? '\u2014')],
  ];

  pdf.setFontSize(10);
  for (const [label, value] of infoRows) {
    pdf.setFont('helvetica', 'normal');
    setMuted();
    pdf.text(label, m, y);
    setDark();
    pdf.text(value, col2, y);
    y += 4;
    pdf.setDrawColor(241, 245, 249);
    pdf.setLineWidth(0.1);
    pdf.line(m, y, PW - m, y);
    y += 5;
  }

  y += 3;

  // ── Thank-you footer ───────────────────────────────────────────────────────
  pdf.setFillColor(235, 241, 255);
  pdf.roundedRect(m, y, cw, 18, 3, 3, 'F');
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  setBlue();
  pdf.text('Thank you for your generous support!', PW / 2, y + 7, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  setBlue();
  pdf.text(
    'Your contribution helps us in our mission for human rights and social justice.',
    PW / 2, y + 13, { align: 'center' },
  );

  return pdf;
};

/**
 * Saves an already-generated PDF Blob using the widest mobile-compatible
 * method: an <a download> click (Android/Chromium/desktop) and falls
 * back to opening the PDF in a viewer when the browser refuses
 * programmatic downloads. Returns what actually happened so the caller
 * can show an accurate message — never a fake "downloaded".
 */
export const saveReceiptBlob = (
  blob: Blob,
  fileName: string,
): 'downloaded' | 'opened' => {
  const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const win = web.window;
  const doc = web.document;
  if (!win || !doc || !web.URL?.createObjectURL) {
    throw new Error('Saving is not available in this environment.');
  }

  const url = web.URL.createObjectURL(blob);
  try {
    const link = doc.createElement('a');
    if (typeof link.download === 'string') {
      link.href = url;
      link.download = fileName;
      link.rel = 'noopener';
      link.style.display = 'none';
      doc.body.appendChild(link);
      link.click();
      link.remove();
      win.setTimeout(() => web.URL.revokeObjectURL(url), 1000);
      return 'downloaded';
    }
    // Browser without download attribute support — open the viewer.
    win.open(url, '_blank');
    win.setTimeout(() => web.URL.revokeObjectURL(url), 60_000);
    return 'opened';
  } catch {
    win.open(url, '_blank');
    win.setTimeout(() => web.URL.revokeObjectURL(url), 60_000);
    return 'opened';
  }
};

/**
 * Generates the receipt PDF for the selected donation and saves it in
 * the most appropriate way for the browser:
 * - iOS Safari: the native share sheet (includes "Save to Files"),
 *   since <a download> is unreliable there.
 * - Android Chrome / desktop: standard anchor download.
 * - Browsers without URL.createObjectURL: opens a data URI in a new
 *   tab — Chrome and Safari display PDFs from data URIs natively.
 */
export const downloadReceiptPDF = async (
  receipt: DonationReceiptModel,
): Promise<'downloaded' | 'opened' | 'shared' | 'cancelled'> => {
  const pdf = await generateReceiptPdf(receipt);
  const fileName = receiptFileName(receipt);

  const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const nav: any = web.navigator;
  const isIOS =
    /iPad|iPhone|iPod/.test(nav?.userAgent ?? '') ||
    (nav?.platform === 'MacIntel' && nav?.maxTouchPoints > 1);

  // iOS Safari — use the Web Share sheet so the user can "Save to Files".
  if (
    isIOS &&
    nav?.share &&
    typeof nav.canShare === 'function' &&
    typeof web.File === 'function'
  ) {
    const blob = pdf.output('blob');
    try {
      const file = new web.File([blob], fileName, {
        type: 'application/pdf',
      });
      if (nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: 'HRSJM Donation Receipt' });
        return 'shared';
      }
    } catch (shareError: any) {
      if (
        shareError?.name === 'AbortError' ||
        shareError?.name === 'NotAllowedError'
      ) {
        return 'cancelled'; // user dismissed the share sheet
      }
      // Fall through to the anchor / data-URI download path.
    }
  }

  // Standard anchor download (Android Chrome, desktop).
  if (web.URL?.createObjectURL) {
    const blob = pdf.output('blob');
    return saveReceiptBlob(blob, fileName);
  }

  // Fallback for browsers that have a DOM but no createObjectURL (some
  // Android WebViews, older mobile browsers). Open the PDF as a data URI —
  // Chrome and Safari will display it inline and the user can save it.
  const dataUri: string = pdf.output('datauristring');
  const win = web.window;
  if (win?.open) {
    win.open(dataUri, '_blank');
    return 'opened';
  }

  throw new Error('Unable to save the PDF in this browser environment.');
};


/**
 * Opens the receipt document and triggers the browser print dialog.
 * Falls back to a hidden iframe when popups are blocked.
 * Returns false when printing is not supported in the environment.
 */
export const printReceiptDocument = (html: string): boolean => {
  const web: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const win = web.window;
  const doc = web.document;
  if (!win || !doc) {
    return false;
  }

  try {
    const popup = win.open('', '_blank');
    if (popup) {
      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      popup.focus();
      popup.print();
      return true;
    }
  } catch {
    // Fall through to the iframe path.
  }

  try {
    const iframe = doc.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(iframe);
    iframe.srcdoc = html;
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      win.setTimeout(() => iframe.remove(), 60_000);
    };
    return true;
  } catch {
    return false;
  }
};