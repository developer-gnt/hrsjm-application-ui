import { fetchAggregatedPassbookLedger } from '../../src/features/admin/accounting/services/ledger.service';
import { expensesService } from '../../src/features/admin/expenses/services/expenses.service';
import { receiptEntriesService } from '../../src/features/admin/receipts/services/receipt-entries.service';
import { donationsService } from '../../src/features/admin/donations/services/donations.service';
import { paymentsService } from '../../src/features/admin/payments/services/payments.service';
import { apiClient } from '../../src/core/api/client';

jest.mock('../../src/features/admin/expenses/services/expenses.service');
jest.mock('../../src/features/admin/receipts/services/receipt-entries.service');
jest.mock('../../src/features/admin/donations/services/donations.service');
jest.mock('../../src/features/admin/payments/services/payments.service');
jest.mock('../../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('Passbook Ledger Aggregation Deduplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (expensesService.list as jest.Mock).mockResolvedValue({ items: [], meta: {} });
    (paymentsService.list as jest.Mock).mockResolvedValue({ items: [], meta: {} });
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { items: [] } });
  });

  it('deduplicates a donation when both official receipt voucher and raw donation entity exist', async () => {
    // Official posted receipt entry created by backend when payment succeeds
    const mockReceipt = {
      id: 'rec-uuid-001',
      voucher_number: 'REC-20261030-00039',
      receipt_date: '2026-10-30T09:00:00Z',
      received_from: 'Khan (Member: HRSJM-00026)',
      amount: 500,
      payment_method: 'UPI',
      reference_number: 'pay_cf_12345',
      description:
        '[Application Donation] Donation for Cause: HRSJM NGO Donation | Donor: Khan | Status: Member: Khan (ID: HRSJM-00026) | Source: Application | Payment ID: pay_cf_12345',
      status: 'POSTED',
      income_account: {
        id: 'acc-4003',
        account_name: 'Donation Income',
        account_code: '4003',
      },
    };

    // Raw donation record in donations table
    const mockDonation = {
      id: '544caf5b-1234-4567-8901-abcdef123456',
      donor_name: 'Khan',
      amount: 500,
      cause: 'HRSJM NGO Donation',
      status: 'SUCCESS',
      created_at: '2026-10-30T09:00:00Z',
    };

    (receiptEntriesService.list as jest.Mock).mockResolvedValue({
      items: [mockReceipt],
      meta: { total: 1 },
    });
    (donationsService.getDonations as jest.Mock).mockResolvedValue({
      items: [mockDonation],
      meta: { total: 1 },
    });

    const result = await fetchAggregatedPassbookLedger({
      fromDate: '2026-10-01',
      toDate: '2026-10-31',
    });

    // 1. Must contain ONLY ONE transaction
    expect(result.transactions).toHaveLength(1);

    // 2. The single transaction should be the official receipt entry with UPI payment method
    const tx = result.transactions[0];
    expect(tx.entry_number).toBe('REC-20261030-00039');
    expect(tx.payment_method).toBe('UPI');
    expect(tx.credit).toBe(500);
    expect(['DONATION', 'CAUSE_FUND']).toContain(tx.category_tag);

    // 3. The raw duplicate DON-544CAF5B must NOT be present
    const duplicate = result.transactions.find((t) => t.entry_number.startsWith('DON-'));
    expect(duplicate).toBeUndefined();

    // 4. Summary total credit must be exactly 500 (NOT double-counted as 1000)
    expect(result.summary.total_credit).toBe(500);
    expect(result.summary.closing_balance).toBe(500);
  });

  it('keeps raw donation if no official receipt entry covers it', async () => {
    const standaloneDonation = {
      id: '99887766-0000-1111-2222-333344445555',
      donor_name: 'Independent Supporter',
      amount: 1500,
      cause: 'Child Welfare Relief',
      status: 'SUCCESS',
      created_at: '2026-10-15T12:00:00Z',
    };

    (receiptEntriesService.list as jest.Mock).mockResolvedValue({ items: [], meta: {} });
    (donationsService.getDonations as jest.Mock).mockResolvedValue({
      items: [standaloneDonation],
      meta: { total: 1 },
    });

    const result = await fetchAggregatedPassbookLedger({
      fromDate: '2026-10-01',
      toDate: '2026-10-31',
    });

    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].entry_number).toBe('DON-99887766');
    expect(result.transactions[0].credit).toBe(1500);
    expect(result.summary.total_credit).toBe(1500);
  });

  it('omits failed or cancelled donations from ledger credits', async () => {
    const failedDonation = {
      id: 'failed-donation-123',
      donor_name: 'Failed Donor',
      amount: 2500,
      cause: 'Education Fund',
      status: 'FAILED',
      created_at: '2026-10-15T12:00:00Z',
    };

    (receiptEntriesService.list as jest.Mock).mockResolvedValue({ items: [], meta: {} });
    (donationsService.getDonations as jest.Mock).mockResolvedValue({
      items: [failedDonation],
      meta: { total: 1 },
    });

    const result = await fetchAggregatedPassbookLedger({
      fromDate: '2026-10-01',
      toDate: '2026-10-31',
    });

    expect(result.transactions).toHaveLength(0);
    expect(result.summary.total_credit).toBe(0);
  });
});
