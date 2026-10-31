export type TransactionCategory = 'Membership' | 'Donation' | 'Events' | 'Other';
export type TransactionCategoryCode = 'ALL' | 'MEMBERSHIP' | 'DONATION' | 'EVENTS' | 'OTHER';

export type TransactionStatus = 'Success' | 'Pending' | 'Failed' | 'Refunded';
export type TransactionStatusCode = 'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface UserTransactionRelatedInfo {
  campaign_name?: string | null;
  membership_id?: string | null;
  event_name?: string | null;
  receipt_id?: string | null;
  receipt_number?: string | null;
  receipt_date?: string | null;
  receipt_status?: string | null;
  notes?: string | null;
}

export interface UserTransactionItem {
  id: string;
  transaction_id: string;
  payment_reference: string;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  category: TransactionCategory;
  category_code: 'MEMBERSHIP' | 'DONATION' | 'EVENTS' | 'OTHER';
  title: string;
  purpose: string;
  amount: number;
  direction: 'OUTGOING';
  status: TransactionStatus;
  status_code: string;
  payment_method: string;
  created_at: string;
  payment_date: string;
  receipt_id: string | null;
  receipt_number: string | null;
  receipt_available: boolean;
  related_info: UserTransactionRelatedInfo;
}

export interface UserTransactionsSummary {
  total_amount_paid: number;
  total_transactions: number;
  successful_count: number;
  pending_count: number;
  failed_count: number;
  refunded_count: number;
}

export interface UserTransactionsResponse {
  summary: UserTransactionsSummary;
  items: UserTransactionItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransactionFilterParams {
  category?: TransactionCategoryCode | string;
  status?: TransactionStatusCode | string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

/**
 * AMOUNT SIGN RULE:
 * Every outgoing payment made to HRSJM must display a negative (-) sign.
 * Example: - ₹2,000
 */
export function formatOutgoingAmount(amount: number): string {
  const absAmount = Math.abs(amount || 0);
  return `- ₹${absAmount.toLocaleString('en-IN')}`;
}

