/**
 * Accounting types — mirror the backend (AccountEntity, AccountType enum, Ledger, Journal Entries).
 * Shared by voucher forms (Phase 5) and the accounting module (Phase 6).
 */

export type AccountType =
  'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE' | 'FUND_EQUITY';

export type AccountCategory = 'ALL' | AccountType;

/** GET /accounts item (backend AccountEntity). */
export interface AccountItem {
  id: string;
  account_code: string | null;
  account_name: string;
  account_type: AccountType;
  parent_account_id: string | null;
  description: string | null;
  is_active: boolean;
  parent?: AccountItem | null;
  children?: AccountItem[];
  created_at: string;
  updated_at: string;
}

/** Hierarchical tree node representation for the Chart of Accounts. */
export interface AccountTreeNode extends AccountItem {
  children: AccountTreeNode[];
  level: number;
}

/** Payload to create a new account in Chart of Accounts. */
export interface CreateAccountPayload {
  account_name: string;
  account_type: AccountType;
  account_code?: string;
  parent_account_id?: string | null;
  description?: string;
}

/** Payload to update an existing account. */
export interface UpdateAccountPayload {
  account_name?: string;
  account_code?: string;
  parent_account_id?: string | null;
  description?: string;
}

/** Journal line inside an accounting entry. */
export interface AccountingEntryLine {
  id: string;
  account: AccountItem | null;
  debit?: number;
  credit?: number;
  debit_amount?: number;
  credit_amount?: number;
}

/** Accounting entry item (journal voucher). */
export interface JournalEntryItem {
  id: string;
  entry_number: string;
  reference_type?: string | null;
  reference_id?: string | null;
  entry_type: 'STANDARD' | 'REVERSAL' | 'CLOSING' | 'ADJUSTMENT';
  narration?: string | null;
  entry_date: string;
  is_reversed?: boolean;
  reversal_entry_id?: string | null;
  reversed_by_id?: string | null;
  reversal_reason?: string | null;
  total_debit: number;
  total_credit: number;
  lines?: AccountingEntryLine[];
  created_at: string;
}

export interface JournalEntriesListResponse {
  items: JournalEntryItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/** Single transaction line inside a ledger. */
export interface LedgerTransaction {
  id: string;
  entry_id: string;
  entry_number: string;
  entry_date: string;
  entry_type: string;
  account_id: string;
  account_name: string;
  account_code: string | null;
  account_type: AccountType;
  reference_type: string | null;
  reference_id: string | null;
  narration: string | null;
  debit: number;
  credit: number;
  running_balance: number;
}

/** Summary header for an account ledger or global ledger. */
export interface LedgerSummary {
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  closing_balance: number;
  net_change?: number;
}

export interface AccountLedgerResponse {
  account: AccountItem;
  from_date?: string | null;
  to_date?: string | null;
  opening_balance: number;
  closing_balance: number;
  total_debit: number;
  total_credit: number;
  transactions: LedgerTransaction[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GlobalLedgerResponse {
  from_date: string;
  to_date: string;
  opening_balance: number;
  closing_balance: number;
  total_debit: number;
  total_credit: number;
  transactions: LedgerTransaction[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/** Flat pagination shape used by accounting list endpoints. */
export interface AccountingPagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/** Payment methods accepted on vouchers. */
export const VOUCHER_PAYMENT_METHODS = [
  'CASH',
  'BANK_TRANSFER',
  'CHEQUE',
  'UPI',
  'CARD',
  'OTHER',
] as const;

export type PaymentMethod = (typeof VOUCHER_PAYMENT_METHODS)[number];

/** Voucher lifecycle. */
export type VoucherStatus = 'POSTED' | 'CANCELLED';

/** Summary of accounting entry attached to vouchers. */
export interface AccountingEntrySummary {
  id: string;
  entry_number?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  narration?: string | null;
  entry_date?: string | null;
  lines?: AccountingEntryLine[];
}
