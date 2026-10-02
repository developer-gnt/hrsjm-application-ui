import {
  createExpenseSchema,
} from '../../src/features/admin/expenses/types/expenses.schemas';
import {
  createReceiptSchema,
} from '../../src/features/admin/receipts/types/receipts.schemas';

const VALID_EXPENSE = {
  expense_date: '2026-10-01',
  paid_to: 'Vendor A',
  expense_account_id: '11111111-1111-4111-8111-111111111111',
  paid_from_account_id: '22222222-2222-4222-8222-222222222222',
  amount: '1500.50',
  payment_method: 'BANK_TRANSFER' as const,
  reference_number: '',
  description: '',
};

const VALID_RECEIPT = {
  receipt_date: '2026-10-01',
  received_from: 'Donor B',
  income_account_id: '33333333-3333-4333-8333-333333333333',
  received_in_account_id: '22222222-2222-4222-8222-222222222222',
  amount: '2500',
  payment_method: 'CASH' as const,
  reference_number: '',
  description: '',
};

describe('voucher create schemas (mirror backend DTOs)', () => {
  it('accepts valid expense payloads', () => {
    expect(createExpenseSchema.safeParse(VALID_EXPENSE).success).toBe(true);
  });

  it('rejects non-positive or over-precise amounts', () => {
    expect(
      createExpenseSchema.safeParse({ ...VALID_EXPENSE, amount: '0' }).success,
    ).toBe(false);
    expect(
      createExpenseSchema.safeParse({ ...VALID_EXPENSE, amount: '10.999' }).success,
    ).toBe(false);
    expect(
      createExpenseSchema.safeParse({ ...VALID_EXPENSE, amount: '-5' }).success,
    ).toBe(false);
  });

  it('rejects malformed voucher dates', () => {
    expect(
      createExpenseSchema.safeParse({ ...VALID_EXPENSE, expense_date: '01-10-2026' })
        .success,
    ).toBe(false);
  });

  it('requires account UUIDs (picker output)', () => {
    expect(
      createExpenseSchema.safeParse({ ...VALID_EXPENSE, expense_account_id: '' })
        .success,
    ).toBe(false);
    expect(
      createExpenseSchema.safeParse({ ...VALID_EXPENSE, paid_from_account_id: 'abc' })
        .success,
    ).toBe(false);
  });

  it('rejects payee names over 150 chars (DTO MaxLength)', () => {
    expect(
      createExpenseSchema.safeParse({ ...VALID_EXPENSE, paid_to: 'x'.repeat(151) })
        .success,
    ).toBe(false);
  });

  it('accepts valid receipt payloads', () => {
    expect(createReceiptSchema.safeParse(VALID_RECEIPT).success).toBe(true);
  });

  it('rejects receipts with missing income or bank accounts', () => {
    expect(
      createReceiptSchema.safeParse({ ...VALID_RECEIPT, income_account_id: '' })
        .success,
    ).toBe(false);
    expect(
      createReceiptSchema.safeParse({
        ...VALID_RECEIPT,
        received_in_account_id: '',
      }).success,
    ).toBe(false);
  });

  it('rejects payer names over 150 chars', () => {
    expect(
      createReceiptSchema.safeParse({ ...VALID_RECEIPT, received_from: 'y'.repeat(151) })
        .success,
    ).toBe(false);
  });
});