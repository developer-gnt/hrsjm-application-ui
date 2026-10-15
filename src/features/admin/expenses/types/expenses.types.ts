import type {
  AccountingEntrySummary,
  PaymentMethod,
  VoucherStatus,
} from '../../accounting/types/accounting.types';

/** Item of GET /expense-entries (joins expense_account + paid_from_account). */
export interface ExpenseEntryItem {
  id: string;
  voucher_number: string;
  expense_date: string;
  paid_to: string;
  expense_account_id: string;
  paid_from_account_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number: string | null;
  description: string | null;
  attachment_url: string | null;
  status: VoucherStatus;
  accounting_entry_id: string | null;
  created_at: string;
  updated_at: string;
  expense_account?: {
    id: string;
    account_name: string;
    account_code: string | null;
  } | null;
  paid_from_account?: {
    id: string;
    account_name: string;
    account_code: string | null;
  } | null;
  accounting_entry?: AccountingEntrySummary | null;
}

export interface ExpenseEntryDetail extends ExpenseEntryItem {
  accounting_entry?: AccountingEntrySummary & {
    lines?: Array<{
      id: string;
      account: {
        id: string;
        account_name: string;
        account_code: string | null;
      } | null;
      debit: number;
      credit: number;
    }> | null;
  };
}

/** POST /expense-entries body — exactly the backend CreateExpenseEntryDto. */
export interface CreateExpensePayload {
  expense_date: string;
  paid_to: string;
  expense_account_id: string;
  paid_from_account_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string;
  description?: string;
}

/** Response of the flat voucher list endpoints: { items, total, page, limit, total_pages }. */
export interface FlatVoucherList<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/** Client-side normalized shape (camelCase meta) shared by both voucher hooks. */
export interface VoucherListResult<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

