import { apiClient } from '../../src/core/api/client';
import { paymentsService } from '../../src/features/admin/payments/services/payments.service';
import { expensesService } from '../../src/features/admin/expenses/services/expenses.service';
import { receiptEntriesService } from '../../src/features/admin/receipts/services/receipt-entries.service';

jest.mock('../../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

/**
 * Phase 5 wire contracts: verify has NO notes field (whitelist 400s), voucher
 * create bodies match the backend DTOs exactly, and cancellation sends
 * status CANCELLED (+ optional reason) to the :id/status route.
 */
describe('payments service contract', () => {
  beforeEach(() => jest.clearAllMocks());

  it('verify posts gateway_payment_id (never notes) to /:id/verify', async () => {
    (mockedApiClient.post as jest.Mock).mockResolvedValue({
      data: { payment: { id: 'p1' }, receipt: { id: 'r1' } },
    });

    await paymentsService.verify('p1', { gateway_payment_id: 'GP-123' });

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/membership-payments/p1/verify',
      { gateway_payment_id: 'GP-123' },
    );
  });

  it('setStatus patches {status, notes} to /:id/status', async () => {
    (mockedApiClient.patch as jest.Mock).mockResolvedValue({ data: { id: 'p1' } });

    await paymentsService.setStatus('p1', { status: 'FAILED', notes: 'bad gateway' });

    expect(mockedApiClient.patch).toHaveBeenCalledWith(
      '/membership-payments/p1/status',
      { status: 'FAILED', notes: 'bad gateway' },
    );
  });

  it('list forwards status + search and returns camelCase meta', async () => {
    (mockedApiClient.get as jest.Mock).mockResolvedValue({
      data: {
        items: [{ id: 'p1' }],
        meta: { page: 1, limit: 15, total: 21, totalPages: 2 },
      },
    });

    const result = await paymentsService.list({
      page: 1,
      limit: 15,
      status: 'PENDING',
      search: 'raza',
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/membership-payments',
      { params: { page: 1, limit: 15, status: 'PENDING', search: 'raza' } },
    );
    expect(result.meta.totalPages).toBe(2);
  });
});

describe('voucher services contract', () => {
  beforeEach(() => jest.clearAllMocks());

  it('expense create posts the exact CreateExpenseEntryDto shape', async () => {
    (mockedApiClient.post as jest.Mock).mockResolvedValue({
      data: { id: 'e1', voucher_number: 'EXP-20261001-00001' },
    });

    await expensesService.create({
      expense_date: '2026-10-01',
      paid_to: 'Vendor A',
      expense_account_id: 'acc-exp',
      paid_from_account_id: 'acc-bank',
      amount: 1500.5,
      payment_method: 'BANK_TRANSFER',
      reference_number: 'REF-1',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/expense-entries', {
      expense_date: '2026-10-01',
      paid_to: 'Vendor A',
      expense_account_id: 'acc-exp',
      paid_from_account_id: 'acc-bank',
      amount: 1500.5,
      payment_method: 'BANK_TRANSFER',
      reference_number: 'REF-1',
    });
  });

  it('expense cancel PATCHes status CANCELLED with optional reason', async () => {
    (mockedApiClient.patch as jest.Mock).mockResolvedValue({ data: { id: 'e1' } });

    await expensesService.cancel('e1', 'Duplicate entry');
    expect(mockedApiClient.patch).toHaveBeenCalledWith('/expense-entries/e1/status', {
      status: 'CANCELLED',
      cancellation_reason: 'Duplicate entry',
    });

    await expensesService.cancel('e1');
    expect(mockedApiClient.patch).toHaveBeenCalledWith('/expense-entries/e1/status', {
      status: 'CANCELLED',
    });
  });

  it('expense list normalizes flat pagination to camelCase meta', async () => {
    (mockedApiClient.get as jest.Mock).mockResolvedValue({
      data: { items: [{ id: 'e1' }], total: 31, page: 2, limit: 15, total_pages: 3 },
    });

    const result = await expensesService.list({ page: 2, limit: 15 });

    expect(result.meta).toEqual({
      page: 2,
      limit: 15,
      total: 31,
      totalPages: 3,
    });
  });

  it('receipt create posts the exact CreateReceiptEntryDto shape', async () => {
    (mockedApiClient.post as jest.Mock).mockResolvedValue({
      data: { id: 'r1', voucher_number: 'REC-20261001-00001' },
    });

    await receiptEntriesService.create({
      receipt_date: '2026-10-01',
      received_from: 'Donor B',
      income_account_id: 'acc-income',
      received_in_account_id: 'acc-bank',
      amount: 2500,
      payment_method: 'CASH',
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/receipt-entries', {
      receipt_date: '2026-10-01',
      received_from: 'Donor B',
      income_account_id: 'acc-income',
      received_in_account_id: 'acc-bank',
      amount: 2500,
      payment_method: 'CASH',
    });
  });

  it('receipt cancel PATCHes status CANCELLED', async () => {
    (mockedApiClient.patch as jest.Mock).mockResolvedValue({ data: { id: 'r1' } });

    await receiptEntriesService.cancel('r1', 'Wrong account');
    expect(mockedApiClient.patch).toHaveBeenCalledWith('/receipt-entries/r1/status', {
      status: 'CANCELLED',
      cancellation_reason: 'Wrong account',
    });
  });
});