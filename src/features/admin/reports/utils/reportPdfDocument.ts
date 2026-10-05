import { jsPDF } from 'jspdf';
import { Platform } from 'react-native';
import type {
  BalanceSheetReportResponse,
  ProfitLossReportResponse,
  TrialBalanceReportResponse,
} from '../types/reports.types';
import { formatINR } from '../../../../core/utils/currency';

const pt = (mm: number) => (mm * 72) / 25.4;

const uint8ToBase64 = (bytes: Uint8Array): string => {
  const binary: string[] = [];
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1) {
    binary.push(String.fromCharCode(bytes[i]));
  }
  const str = binary.join('');
  if (typeof btoa === 'function') {
    return btoa(str);
  }
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < str.length; i += 3) {
    const b1 = str.charCodeAt(i);
    const b2 = str.charCodeAt(i + 1);
    const b3 = str.charCodeAt(i + 2);
    const e1 = b1 >> 2;
    const e2 = ((b1 & 3) << 4) | (b2 >> 4);
    const e3 = isNaN(b2) ? 64 : ((b2 & 15) << 2) | (b3 >> 6);
    const e4 = isNaN(b2) || isNaN(b3) ? 64 : b3 & 63;
    output +=
      chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
  }
  return output;
};

export const isWebEnvironment = (): boolean =>
  typeof globalThis !== 'undefined' &&
  Boolean((globalThis as any).window) &&
  Boolean((globalThis as any).document);

/**
 * Draws standard official HRSJM header on a report PDF page.
 */
const drawReportHeader = (
  pdf: jsPDF,
  title: string,
  subtitle: string,
  metaDate: string,
  pageWidth: number = 210,
) => {
  // Brand header bar
  pdf.setFillColor(15, 40, 96); // Deep navy
  pdf.rect(0, 0, pageWidth, 24, 'F');

  // Gold accent strip
  pdf.setFillColor(201, 162, 39); // Gold
  pdf.rect(0, 24, pageWidth, 2, 'F');

  // Header texts
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', 14, 11);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(201, 162, 39);
  pdf.text('Regd. National Public Charitable NGO • HRSJM Financial Accounting System', 14, 18);

  // Document Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(15, 40, 96);
  pdf.text(title.toUpperCase(), 14, 36);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(subtitle, 14, 42);

  // As of / Period on right
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(30, 41, 59);
  pdf.text(`Report Period: ${metaDate}`, pageWidth - 14, 36, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 14, 42, { align: 'right' });

  // Divider line
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.4);
  pdf.line(14, 46, pageWidth - 14, 46);
};

/**
 * Draws footer with verification and signature spots.
 */
const drawReportFooter = (pdf: jsPDF, pageHeight: number = 297, pageWidth: number = 210) => {
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.4);
  pdf.line(14, pageHeight - 24, pageWidth - 14, pageHeight - 24);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text('This is an official system-generated accounting report of HRSJM.', 14, pageHeight - 16);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(15, 40, 96);
  pdf.text('Authorized Signatory', pageWidth - 14, pageHeight - 16, { align: 'right' });
};

// ==========================================
// 1. TRIAL BALANCE PDF
// ==========================================
export const generateTrialBalancePdf = (data: TrialBalanceReportResponse): jsPDF => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;

  drawReportHeader(pdf, 'Trial Balance Statement', 'Double-entry general ledger debit & credit balancing', `As of ${data.as_of_date}`, W);

  // Table header
  let y = 52;
  pdf.setFillColor(241, 245, 249);
  pdf.rect(14, y, W - 28, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(15, 40, 96);
  pdf.text('CODE', 18, y + 5.5);
  pdf.text('ACCOUNT NAME & TYPE', 42, y + 5.5);
  pdf.text('DEBIT (INR)', 140, y + 5.5, { align: 'right' });
  pdf.text('CREDIT (INR)', W - 18, y + 5.5, { align: 'right' });

  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);

  data.accounts.forEach((acc, idx) => {
    if (y > H - 35) {
      drawReportFooter(pdf, H, W);
      pdf.addPage();
      drawReportHeader(pdf, 'Trial Balance Statement (Cont.)', 'Double-entry general ledger debit & credit balancing', `As of ${data.as_of_date}`, W);
      y = 52;
      pdf.setFillColor(241, 245, 249);
      pdf.rect(14, y, W - 28, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 40, 96);
      pdf.text('CODE', 18, y + 5.5);
      pdf.text('ACCOUNT NAME & TYPE', 42, y + 5.5);
      pdf.text('DEBIT (INR)', 140, y + 5.5, { align: 'right' });
      pdf.text('CREDIT (INR)', W - 18, y + 5.5, { align: 'right' });
      y += 10;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
    }

    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(14, y - 4, W - 28, 6.5, 'F');
    }

    pdf.setTextColor(71, 85, 105);
    pdf.text(acc.account.account_code || '—', 18, y);
    pdf.setTextColor(15, 23, 42);
    pdf.text(acc.account.account_name, 42, y);

    pdf.setTextColor(15, 23, 42);
    pdf.text(acc.debit_balance > 0 ? formatINR(acc.debit_balance) : '—', 140, y, { align: 'right' });
    pdf.text(acc.credit_balance > 0 ? formatINR(acc.credit_balance) : '—', W - 18, y, { align: 'right' });

    y += 6.5;
  });

  // Total summary row
  y += 2;
  pdf.setFillColor(15, 40, 96);
  pdf.rect(14, y, W - 28, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text('TOTAL BALANCES', 18, y + 5.5);
  pdf.text(formatINR(data.total_debit), 140, y + 5.5, { align: 'right' });
  pdf.text(formatINR(data.total_credit), W - 18, y + 5.5, { align: 'right' });

  // Balancing banner
  y += 12;
  if (data.is_balanced) {
    pdf.setFillColor(220, 252, 231);
    pdf.rect(14, y, W - 28, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(22, 101, 52);
    pdf.text('✓ BALANCED — Total debits equal total credits perfectly.', 18, y + 5.5);
  } else {
    pdf.setFillColor(254, 226, 226);
    pdf.rect(14, y, W - 28, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(185, 28, 28);
    pdf.text(`⚠ OUT OF BALANCE — Net Difference: ${formatINR(Math.abs(data.difference))}`, 18, y + 5.5);
  }

  drawReportFooter(pdf, H, W);
  return pdf;
};

// ==========================================
// 2. PROFIT & LOSS PDF
// ==========================================
export const generateProfitLossPdf = (data: ProfitLossReportResponse): jsPDF => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;

  drawReportHeader(pdf, 'Statement of Profit & Loss', 'Income vs Expenses Statement for the Period', `${data.from_date} to ${data.to_date}`, W);

  let y = 52;

  // --- INCOME SECTION ---
  pdf.setFillColor(241, 245, 249);
  pdf.rect(14, y, W - 28, 7.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(15, 40, 96);
  pdf.text('1. INCOME & REVENUES', 18, y + 5.2);
  pdf.text('AMOUNT (INR)', W - 18, y + 5.2, { align: 'right' });

  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);

  data.income.items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(14, y - 4, W - 28, 6, 'F');
    }
    pdf.setTextColor(71, 85, 105);
    pdf.text(item.account.account_code || '—', 18, y);
    pdf.setTextColor(15, 23, 42);
    pdf.text(item.account.account_name, 42, y);
    pdf.text(formatINR(item.amount), W - 18, y, { align: 'right' });
    y += 6;
  });

  // Income subtotal
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 40, 96);
  pdf.text('Total Income (A)', 42, y + 2);
  pdf.text(formatINR(data.total_income), W - 18, y + 2, { align: 'right' });
  y += 10;

  // --- EXPENSES SECTION ---
  pdf.setFillColor(241, 245, 249);
  pdf.rect(14, y, W - 28, 7.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(15, 40, 96);
  pdf.text('2. EXPENDITURES & OUTFLOWS', 18, y + 5.2);
  pdf.text('AMOUNT (INR)', W - 18, y + 5.2, { align: 'right' });

  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);

  data.expenses.items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(14, y - 4, W - 28, 6, 'F');
    }
    pdf.setTextColor(71, 85, 105);
    pdf.text(item.account.account_code || '—', 18, y);
    pdf.setTextColor(15, 23, 42);
    pdf.text(item.account.account_name, 42, y);
    pdf.text(formatINR(item.amount), W - 18, y, { align: 'right' });
    y += 6;
  });

  // Expense subtotal
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 40, 96);
  pdf.text('Total Expenditures (B)', 42, y + 2);
  pdf.text(formatINR(data.total_expenses), W - 18, y + 2, { align: 'right' });
  y += 12;

  // --- NET SURPLUS / DEFICIT ---
  const isSurplus = data.result_type === 'SURPLUS';
  pdf.setFillColor(isSurplus ? 220 : 254, isSurplus ? 252 : 226, isSurplus ? 231 : 226);
  pdf.rect(14, y, W - 28, 10, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(isSurplus ? 22 : 185, isSurplus ? 101 : 28, isSurplus ? 52 : 28);
  pdf.text(`NET ${data.result_type} (A - B)`, 18, y + 6.8);
  pdf.text(formatINR(Math.abs(data.net_result)), W - 18, y + 6.8, { align: 'right' });

  drawReportFooter(pdf, H, W);
  return pdf;
};

// ==========================================
// 3. BALANCE SHEET PDF
// ==========================================
export const generateBalanceSheetPdf = (data: BalanceSheetReportResponse): jsPDF => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;

  drawReportHeader(pdf, 'Balance Sheet Statement', 'Statement of Financial Position (Assets vs Liabilities & Equity)', `As of ${data.as_of_date}`, W);

  let y = 52;

  // --- ASSETS ---
  pdf.setFillColor(241, 245, 249);
  pdf.rect(14, y, W - 28, 7.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(15, 40, 96);
  pdf.text('1. ASSETS', 18, y + 5.2);
  pdf.text('AMOUNT (INR)', W - 18, y + 5.2, { align: 'right' });

  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);

  data.assets.items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(14, y - 4, W - 28, 6, 'F');
    }
    pdf.setTextColor(71, 85, 105);
    pdf.text(item.account.account_code || '—', 18, y);
    pdf.setTextColor(15, 23, 42);
    pdf.text(item.account.account_name, 42, y);
    pdf.text(formatINR(item.amount), W - 18, y, { align: 'right' });
    y += 6;
  });

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 40, 96);
  pdf.text('Total Assets (A)', 42, y + 2);
  pdf.text(formatINR(data.total_assets), W - 18, y + 2, { align: 'right' });
  y += 10;

  // --- LIABILITIES ---
  pdf.setFillColor(241, 245, 249);
  pdf.rect(14, y, W - 28, 7.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(15, 40, 96);
  pdf.text('2. LIABILITIES', 18, y + 5.2);
  pdf.text('AMOUNT (INR)', W - 18, y + 5.2, { align: 'right' });

  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);

  data.liabilities.items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(14, y - 4, W - 28, 6, 'F');
    }
    pdf.setTextColor(71, 85, 105);
    pdf.text(item.account.account_code || '—', 18, y);
    pdf.setTextColor(15, 23, 42);
    pdf.text(item.account.account_name, 42, y);
    pdf.text(formatINR(item.amount), W - 18, y, { align: 'right' });
    y += 6;
  });

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 40, 96);
  pdf.text('Total Liabilities (B1)', 42, y + 2);
  pdf.text(formatINR(data.total_liabilities), W - 18, y + 2, { align: 'right' });
  y += 10;

  // --- EQUITY ---
  pdf.setFillColor(241, 245, 249);
  pdf.rect(14, y, W - 28, 7.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(15, 40, 96);
  pdf.text('3. FUND & CAPITAL EQUITY', 18, y + 5.2);
  pdf.text('AMOUNT (INR)', W - 18, y + 5.2, { align: 'right' });

  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);

  data.equity.items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(14, y - 4, W - 28, 6, 'F');
    }
    pdf.setTextColor(71, 85, 105);
    pdf.text(item.account.account_code || '—', 18, y);
    pdf.setTextColor(15, 23, 42);
    pdf.text(item.account.account_name, 42, y);
    pdf.text(formatINR(item.amount), W - 18, y, { align: 'right' });
    y += 6;
  });

  // Current year surplus addition
  pdf.setTextColor(15, 23, 42);
  pdf.text('Current Period Net Surplus / (Deficit)', 42, y);
  pdf.text(formatINR(data.equity.current_surplus_deficit), W - 18, y, { align: 'right' });
  y += 6;

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 40, 96);
  pdf.text('Total Fund Equity (B2)', 42, y + 2);
  pdf.text(formatINR(data.total_equity), W - 18, y + 2, { align: 'right' });
  y += 10;

  // Total Liabilities & Equity
  pdf.setFillColor(15, 40, 96);
  pdf.rect(14, y, W - 28, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text('TOTAL LIABILITIES & EQUITY (B = B1 + B2)', 18, y + 5.5);
  pdf.text(formatINR(data.total_liabilities_and_equity), W - 18, y + 5.5, { align: 'right' });

  y += 12;
  if (data.is_balanced) {
    pdf.setFillColor(220, 252, 231);
    pdf.rect(14, y, W - 28, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(22, 101, 52);
    pdf.text('✓ BALANCED — Total Assets equal Total Liabilities & Equity.', 18, y + 5.5);
  } else {
    pdf.setFillColor(254, 226, 226);
    pdf.rect(14, y, W - 28, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(185, 28, 28);
    pdf.text(`⚠ OUT OF BALANCE — Net Difference: ${formatINR(Math.abs(data.difference))}`, 18, y + 5.5);
  }

  drawReportFooter(pdf, H, W);
  return pdf;
};

// ==========================================
// EXPORT HELPERS (Native Device & Web)
// ==========================================
const getPdfBytes = (pdf: jsPDF): Uint8Array => {
  const bytes = new Uint8Array(pdf.output('arraybuffer'));
  if (!bytes.length) throw new Error('Generated PDF is empty.');
  return bytes;
};

export const downloadReportPdf = async (
  fileName: string,
  pdf: jsPDF,
): Promise<'downloaded' | 'opened'> => {
  if (Platform.OS !== 'web' || !isWebEnvironment()) {
    const base64 = uint8ToBase64(getPdfBytes(pdf));
    const RNFS = (await import('react-native-blob-util')).default;
    const dirs = RNFS.fs.dirs;
    const path = dirs.DownloadDir
      ? `${dirs.DownloadDir}/${fileName}`
      : `${dirs.DocumentDir}/${fileName}`;

    await RNFS.fs.writeFile(path, base64, 'base64');
    if (dirs.DownloadDir) {
      await (RNFS.fs.scanFile as any)(path).catch(() => undefined);
      return 'downloaded';
    }
    return 'opened';
  } else {
    const web: any = globalThis;
    const blob = pdf.output('blob');
    const url = web.URL.createObjectURL(blob);
    const link = web.document.createElement('a');
    link.href = url;
    link.download = fileName;
    web.document.body.appendChild(link);
    link.click();
    link.remove();
    web.window.setTimeout(() => web.URL.revokeObjectURL(url), 1000);
    return 'downloaded';
  }
};

export const shareReportPdf = async (
  fileName: string,
  title: string,
  pdf: jsPDF,
): Promise<'shared' | 'cancelled' | 'opened' | 'downloaded'> => {
  if (Platform.OS !== 'web' || !isWebEnvironment()) {
    const base64 = uint8ToBase64(getPdfBytes(pdf));
    const RNFS = (await import('react-native-blob-util')).default;
    const filePath = `${RNFS.fs.dirs.CacheDir}/${fileName}`;
    await RNFS.fs.writeFile(filePath, base64, 'base64');

    const NativeShare = (await import('react-native-share')).default;
    const shareResult = await NativeShare.open({
      url: `file://${filePath}`,
      type: 'application/pdf',
      title,
      subject: title,
      failOnCancel: false,
    });
    return shareResult?.dismissedAction ? 'cancelled' : 'shared';
  } else {
    return downloadReportPdf(fileName, pdf);
  }
};
