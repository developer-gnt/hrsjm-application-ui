import type {
  AccountingEntrySummary,
  PaymentMethod,
  VoucherStatus,
} from '../../accounting/types/accounting.types';

/** Item of GET /receipt-entries (joins income_account + received_in_account). */
export interface ReceiptEntryItem {
  id: string;
  voucher_number: string;
  receipt_date: string;
  received_from: string;
  income_account_id: string;
  received_in_account_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number: string | null;
  description: string | null;
  attachment_url: string | null;
  status: VoucherStatus;
  accounting_entry_id: string | null;
  created_at: string;
  updated_at: string;
  income_account?: {
    id: string;
    account_name: string;
    account_code: string | null;
  } | null;
  received_in_account?: {
    id: string;
    account_name: string;
    account_code: string | null;
  } | null;
  accounting_entry?: AccountingEntrySummary | null;
}

export interface ReceiptEntryDetail extends ReceiptEntryItem {
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

/** POST /receipt-entries body — exactly the backend CreateReceiptEntryDto. */
export interface CreateReceiptPayload {
  receipt_date: string;
  received_from: string;
  income_account_id: string;
  received_in_account_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string;
  description?: string;
}

export interface ReceiptFlatList {
  items: ReceiptEntryItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ReceiptListResult {
  items: ReceiptEntryItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

