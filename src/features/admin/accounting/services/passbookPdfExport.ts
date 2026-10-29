import { jsPDF } from 'jspdf';
import { formatPdfINR } from '../../../../core/utils/currency';
import {
  downloadReportPdf,
  shareReportPdf,
} from '../../reports/utils/reportPdfDocument';
import type { LedgerSummary, LedgerTransaction } from '../types/accounting.types';

export interface PassbookExportData {
  periodLabel: string;
  fromDate?: string;
  toDate?: string;
  summary: LedgerSummary;
  transactions: LedgerTransaction[];
}

/**
 * Generates an executive-grade PDF Statement for Passbook & Balance.
 */
export const generatePassbookPdf = (data: PassbookExportData): jsPDF => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  let y = 10;

  // 1. Header Bar (Navy with Gold Accent)
  pdf.setFillColor(15, 40, 96); // #0F2860
  pdf.rect(0, 0, pageWidth, 24, 'F');

  pdf.setFillColor(234, 162, 36); // Gold #EAA224
  pdf.rect(0, 24, pageWidth, 2.5, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', margin, 11);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(243, 186, 71);
  pdf.text(
    'Regd. National Public Charitable Trust • Official Passbook & Accounts Ledger',
    margin,
    18,
  );

  y = 36;

  // 2. Document Title & Period Subheading
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(15, 40, 96);
  pdf.text('PASSBOOK & STATEMENT OF ACCOUNT', margin, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Itemized summary of all credits, expenses, and running balances', margin, y + 6);

  // Period / Date on right
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(30, 41, 59);
  pdf.text(`Period: ${data.periodLabel}`, pageWidth - margin, y, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(
    `Generated: ${new Date().toLocaleDateString('en-GB')}`,
    pageWidth - margin,
    y + 6,
    { align: 'right' },
  );

  y += 14;

  // Divider line
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageWidth - margin, y);

  y += 6;

  // 3. KPI Summary Table / Box Grid (2x2 or 4-box layout)
  const cardWidth = (pageWidth - 2 * margin - 9) / 4;
  const cardHeight = 18;

  const kpis = [
    {
      label: 'TOTAL CREDITS',
      value: formatPdfINR(data.summary.total_credit || 0, { noDecimals: true }),
      color: [37, 99, 235], // Blue
      bg: [238, 244, 255],
    },
    {
      label: 'TOTAL EXPENSES',
      value: formatPdfINR(data.summary.total_debit || 0, { noDecimals: true }),
      color: [220, 38, 38], // Red
      bg: [254, 242, 242],
    },
    {
      label: 'OPENING BALANCE',
      value: formatPdfINR(data.summary.opening_balance || 0, { noDecimals: true }),
      color: [180, 83, 9], // Amber
      bg: [255, 251, 235],
    },
    {
      label: 'CLOSING BALANCE',
      value: formatPdfINR(data.summary.closing_balance || 0, { noDecimals: true }),
      color: [15, 40, 96], // Navy
      bg: [248, 250, 252],
    },
  ];

  kpis.forEach((kpi, index) => {
    const cardX = margin + index * (cardWidth + 3);
    pdf.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    pdf.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(kpi.label, cardX + 3, y + 5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    pdf.text(kpi.value, cardX + 3, y + 13);
  });

  y += cardHeight + 8;

  // 4. Transaction Table
  const tableHeaders = [
    { text: '#', width: 8, align: 'center' as const },
    { text: 'Date', width: 22, align: 'left' as const },
    { text: 'Particulars / Description', width: 62, align: 'left' as const },
    { text: 'Voucher #', width: 26, align: 'left' as const },
    { text: 'Credit (INR)', width: 22, align: 'right' as const },
    { text: 'Debit (INR)', width: 22, align: 'right' as const },
    { text: 'Balance (INR)', width: 20, align: 'right' as const },
  ];

  // Draw table header row
  const drawTableHeader = (currentY: number) => {
    pdf.setFillColor(15, 40, 96);
    pdf.rect(margin, currentY, pageWidth - 2 * margin, 7, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);

    let hx = margin;
    tableHeaders.forEach(h => {
      if (h.align === 'right') {
        pdf.text(h.text, hx + h.width - 2, currentY + 5, { align: 'right' });
      } else if (h.align === 'center') {
        pdf.text(h.text, hx + h.width / 2, currentY + 5, { align: 'center' });
      } else {
        pdf.text(h.text, hx + 2, currentY + 5);
      }
      hx += h.width;
    });
  };

  drawTableHeader(y);
  y += 7;

  // Render rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);

  const txList = data.transactions;
  if (txList.length === 0) {
    pdf.setTextColor(148, 163, 184);
    pdf.text('No transactions recorded for this period.', margin + 4, y + 8);
    y += 16;
  } else {
    txList.forEach((tx, idx) => {
      // Check for page break
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 15;
        drawTableHeader(y);
        y += 7;
      }

      const isEven = idx % 2 === 0;
      if (isEven) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, y, pageWidth - 2 * margin, 6.5, 'F');
      }

      pdf.setDrawColor(241, 245, 249);
      pdf.line(margin, y + 6.5, pageWidth - margin, y + 6.5);

      let rx = margin;

      // 1. S.No
      pdf.setTextColor(100, 116, 139);
      pdf.text(String(idx + 1), rx + tableHeaders[0].width / 2, y + 4.5, {
        align: 'center',
      });
      rx += tableHeaders[0].width;

      // 2. Date
      const dateStr = tx.entry_date
        ? tx.entry_date.slice(0, 10).split('-').reverse().join('/')
        : '-';
      pdf.setTextColor(30, 41, 59);
      pdf.text(dateStr, rx + 2, y + 4.5);
      rx += tableHeaders[1].width;

      // 3. Particulars
      const name = tx.account_name || tx.narration || tx.paid_to || tx.received_from || 'Transaction';
      const cleanName = name.length > 34 ? `${name.slice(0, 32)}...` : name;
      pdf.text(cleanName, rx + 2, y + 4.5);
      rx += tableHeaders[2].width;

      // 4. Voucher #
      const vNum = tx.entry_number || tx.reference_id || '-';
      const cleanVNum = vNum.length > 14 ? `${vNum.slice(0, 13)}.` : vNum;
      pdf.setTextColor(100, 116, 139);
      pdf.text(cleanVNum, rx + 2, y + 4.5);
      rx += tableHeaders[3].width;

      // 5. Credit
      const cr = Number(tx.credit) || 0;
      if (cr > 0) {
        pdf.setTextColor(22, 163, 74); // Green
        pdf.text(cr.toLocaleString('en-IN'), rx + tableHeaders[4].width - 2, y + 4.5, {
          align: 'right',
        });
      } else {
        pdf.setTextColor(203, 213, 225);
        pdf.text('-', rx + tableHeaders[4].width - 2, y + 4.5, { align: 'right' });
      }
      rx += tableHeaders[4].width;

      // 6. Debit
      const dr = Number(tx.debit) || 0;
      if (dr > 0) {
        pdf.setTextColor(220, 38, 38); // Red
        pdf.text(dr.toLocaleString('en-IN'), rx + tableHeaders[5].width - 2, y + 4.5, {
          align: 'right',
        });
      } else {
        pdf.setTextColor(203, 213, 225);
        pdf.text('-', rx + tableHeaders[5].width - 2, y + 4.5, { align: 'right' });
      }
      rx += tableHeaders[5].width;

      // 7. Balance
      const bal = Number(tx.running_balance) || 0;
      pdf.setTextColor(15, 40, 96);
      pdf.text(bal.toLocaleString('en-IN'), rx + tableHeaders[6].width - 2, y + 4.5, {
        align: 'right',
      });

      y += 6.5;
    });
  }

  // Footer note on last page
  const totalPages = (pdf.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.4);
    pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text(
      'This is a computer-generated passbook statement from the HRSJM Financial Management System.',
      margin,
      pageHeight - 7,
    );
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 7,
      { align: 'right' },
    );
  }

  return pdf;
};

/**
 * Handles generating and triggering the download/share sheet for Passbook PDF.
 */
export const exportPassbookPdf = async (
  data: PassbookExportData,
): Promise<'shared' | 'downloaded' | 'cancelled' | 'opened'> => {
  const pdf = generatePassbookPdf(data);
  const safePeriod = data.periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `HRSJM_Passbook_Statement_${safePeriod}.pdf`;
  const title = `HRSJM Passbook Statement (${data.periodLabel})`;

  return shareReportPdf(fileName, title, pdf);
};
