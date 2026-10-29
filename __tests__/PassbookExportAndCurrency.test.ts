import { formatINR, formatPdfINR } from '../src/core/utils/currency';
import { generatePassbookPdf } from '../src/features/admin/accounting/services/passbookPdfExport';

describe('Currency and Passbook PDF Export', () => {
  describe('formatPdfINR', () => {
    it('formats amounts cleanly with Rs. prefix instead of unicode rupee', () => {
      const formatted = formatPdfINR(296258, { noDecimals: true });
      expect(formatted).toBe('Rs. 2,96,258');
      expect(formatted).not.toContain('₹');
      expect(formatted).not.toContain('¹');
    });

    it('formats zero correctly', () => {
      const formatted = formatPdfINR(0, { noDecimals: true });
      expect(formatted).toBe('Rs. 0');
    });

    it('formats decimal amounts when requested', () => {
      const formatted = formatPdfINR(6209.5);
      expect(formatted).toBe('Rs. 6,209.50');
    });

    it('handles null/undefined gracefully', () => {
      expect(formatPdfINR(null, { noDecimals: true })).toBe('Rs. 0');
      expect(formatPdfINR(undefined, { noDecimals: true })).toBe('Rs. 0');
    });
  });

  describe('generatePassbookPdf', () => {
    it('generates a jsPDF instance without corrupting KPI numbers to superscript 1', () => {
      const sampleData = {
        periodLabel: 'October 2026',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
        summary: {
          opening_balance: 0,
          total_credit: 296258,
          total_debit: 6209,
          closing_balance: 290049,
        },
        transactions: [
          {
            id: 'tx-1',
            entry_id: 'tx-1',
            entry_number: 'REC-001',
            entry_date: '2026-10-15',
            entry_type: 'DONATION',
            account_id: 'acc-1',
            account_name: 'Public Donation',
            account_code: '4001',
            account_type: 'INCOME',
            narration: 'Generous donation',
            debit: 0,
            credit: 50000,
            running_balance: 50000,
            payment_method: 'ONLINE',
          },
        ],
      };

      const doc = generatePassbookPdf(sampleData as any);
      expect(doc).toBeDefined();

      const output = doc.output();
      // Output must not contain corrupted superscript 1 in front of numbers
      expect(output).not.toContain('( ¹');
      // Output must contain the formatted "Rs. 2,96,258"
      expect(output).toContain('Rs. 2,96,258');
      expect(output).toContain('Rs. 6,209');
      expect(output).toContain('Rs. 0');
      expect(output).toContain('Rs. 2,90,049');
    });
  });
});
