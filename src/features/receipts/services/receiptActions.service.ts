import { Alert, Platform } from 'react-native';
import type { DonationRecord } from '../../donations/types/donation.types';
import type { DonationReceiptModel } from '../../admin/donations/types/donations.types';
import {
  generateReceiptPdfDirect,
  buildReceiptHtml,
  printReceiptDocument,
} from '../../admin/donations/utils/receiptDocument';
import {
  downloadOrOpenPdf,
  sharePdfDocument,
  showDownloadSuccessFeedback,
} from '../../membership/utils/membershipDocumentGenerator';

export const mapDonationRecordToReceiptModel = (r: DonationRecord): DonationReceiptModel => ({
  id: r.id || `rec-don-${Date.now()}`,
  receiptNumber: r.receiptNo || `HRSJM-REC-${Date.now()}`,
  receiptDate: r.isoDate || r.dateTime || r.date || new Date().toISOString(),
  donorName: r.donorName || 'Donor',
  donorMobile: (r as any).donorPhone || (r as any).donorMobile || null,
  donorEmail: (r as any).donorEmail || null,
  memberCode: (r as any).memberId || null,
  cause: r.cause || r.title || 'HRSJM General Fund',
  amount: Number(r.amount) || 0,
  paymentMethod: r.paymentMethod || 'CASHFREE',
  transactionId: r.transactionId || null,
  status: r.status || 'Completed',
  notes: r.description || null,
  source: r.type || 'Donation',
});

export const getReceiptFileName = (record: DonationRecord): string => {
  const cleanNo = (record.receiptNo || 'Receipt').replace(/[^a-zA-Z0-9_-]/g, '_');
  const type = record.type === 'Membership' ? 'Membership' : 'Donation';
  return `HRSJM_${type}_Receipt_${cleanNo}.pdf`;
};

/**
 * Downloads the actual receipt PDF across Web, Android and iOS.
 */
export const executeDownloadReceipt = async (record: DonationRecord): Promise<void> => {
  const receiptModel = mapDonationRecordToReceiptModel(record);
  const fileName = getReceiptFileName(record);

  const pdf = await generateReceiptPdfDirect(receiptModel);
  const result = await downloadOrOpenPdf(pdf, fileName, {
    title: `Receipt ${receiptModel.receiptNumber}`,
  });

  await showDownloadSuccessFeedback(result, `Receipt ${receiptModel.receiptNumber}`);
};

/**
 * Prints the receipt document using the system print dialog (Web AirPrint/browser or Native Mobile print sheet).
 */
export const executePrintReceipt = async (record: DonationRecord): Promise<void> => {
  const receiptModel = mapDonationRecordToReceiptModel(record);
  const webGlobal: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const isWeb =
    Platform.OS === 'web' ||
    (typeof webGlobal.window !== 'undefined' && typeof webGlobal.document !== 'undefined');

  if (isWeb) {
    const html = buildReceiptHtml(receiptModel);
    const handled = printReceiptDocument(html);
    if (!handled && webGlobal.window?.print) {
      webGlobal.window.print();
    }
  } else {
    // Native mobile: generate PDF and launch system sheet with print capability
    const fileName = getReceiptFileName(record);
    const pdf = await generateReceiptPdfDirect(receiptModel);
    const result = await downloadOrOpenPdf(pdf, fileName, {
      title: `Receipt ${receiptModel.receiptNumber}`,
    });
    if (result.filePath) {
      await sharePdfDocument(result.filePath, `Print Receipt ${receiptModel.receiptNumber}`);
    }
  }
};

/**
 * Shares the receipt PDF as a real file attachment (WhatsApp, Mail, AirDrop, etc.).
 */
export const executeShareReceipt = async (record: DonationRecord): Promise<void> => {
  const receiptModel = mapDonationRecordToReceiptModel(record);
  const fileName = getReceiptFileName(record);
  const webGlobal: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const isWeb =
    Platform.OS === 'web' ||
    (typeof webGlobal.window !== 'undefined' && typeof webGlobal.document !== 'undefined');

  if (isWeb) {
    const pdf = await generateReceiptPdfDirect(receiptModel);
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;

    // Check if Web Share API with File sharing is supported (e.g. mobile Safari on iOS)
    if (nav?.canShare && typeof File !== 'undefined') {
      try {
        const blob = pdf.output('blob');
        const file = new File([blob], fileName, { type: 'application/pdf' });
        if (nav.canShare({ files: [file] })) {
          await nav.share({
            files: [file],
            title: `HRSJM Receipt ${receiptModel.receiptNumber}`,
            text: `HRSJM Donation Receipt No. ${receiptModel.receiptNumber}`,
          });
          return;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // User cancelled
      }
    }

    // Fallback on Web: download the PDF and trigger text share if supported
    await downloadOrOpenPdf(pdf, fileName, {
      title: `Receipt ${receiptModel.receiptNumber}`,
    });

    if (nav?.share) {
      try {
        await nav.share({
          title: `HRSJM Receipt ${receiptModel.receiptNumber}`,
          text: `HRSJM Receipt No. ${receiptModel.receiptNumber}`,
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
  } else {
    // Native mobile: share the actual PDF file as an attachment
    const pdf = await generateReceiptPdfDirect(receiptModel);
    const result = await downloadOrOpenPdf(pdf, fileName, {
      title: `Receipt ${receiptModel.receiptNumber}`,
    });
    if (result.filePath) {
      await sharePdfDocument(result.filePath, `HRSJM Receipt ${receiptModel.receiptNumber}`);
    }
  }
};

