/**
 * Accounting types — mirror the backend (AccountEntity, AccountType enum).
 * Shared by voucher forms (Phase 5) and the accounting module (Phase 6).
 */

export type AccountType =
  'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE' | 'FUND_EQUITY';

/** GET /accounts item (backend AccountEntity, camelCase meta). */
export interface AccountItem {
  id: string;
  account_code: string | null;
  account_name: string;
  account_type: AccountType;
  parent_account_id: string | null;
  description: string | null;
  is_active: boolean;
  parent?: AccountItem | null;
  created_at: string;
  updated_at: string;
}

/** Journal line inside an accounting entry (GET voucher :id). */
export interface AccountingEntryLine {
  id: string;
  account: AccountItem | null;
  debit: number;
  credit: number;
}

/** Accounting entry summary (journal header + lines). */
export interface AccountingEntrySummary {
  id: string;
  entry_number?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  narration?: string | null;
  entry_date?: string | null;
  lines?: AccountingEntryLine[];
}

/** Flat pagination shape used by expense/receipt list endpoints. */
export interface AccountingPagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/** Payment methods accepted on vouchers (backend enum, both voucher modules). */
export const VOUCHER_PAYMENT_METHODS = [
  'CASH',
  'BANK_TRANSFER',
  'CHEQUE',
  'UPI',
  'CARD',
  'OTHER',
] as const;

export type PaymentMethod = (typeof VOUCHER_PAYMENT_METHODS)[number];

/** Voucher lifecycle: POSTED on create; CANCELLED triggers a backend reversal. */
export type VoucherStatus = 'POSTED' | 'CANCELLED';
