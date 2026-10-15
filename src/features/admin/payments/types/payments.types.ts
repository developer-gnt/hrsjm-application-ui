/**
 * Payments types — mirror the backend membership-payments module.
 * Do not invent fields (e.g. there is NO notes field on verify).
 */

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

/** Item of GET /payments (joins user, membership+category, receipt). */
export interface MembershipPaymentItem {
  id: string;
  membership_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  payment_status: PaymentStatus;
  transaction_id: string | null;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  gateway_signature: string | null;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    mobile_number: string;
    email: string | null;
    status: string;
  };
  membership?: {
    id: string;
    membership_number: string | null;
    status: string;
    category?: { id: string; name: string; fee?: number } | null;
  } | null;
  receipt?: {
    id: string;
    receipt_number: string;
    receipt_date: string;
    amount: number;
    payment_method: string;
    receipt_type: 'MEMBERSHIP' | 'DONATION';
    issued_to: string;
    notes: string | null;
    accounting_entry_id: string | null;
  } | null;
}

export interface MembershipPaymentDetail extends MembershipPaymentItem {
  transactions?: Array<{
    id: string;
    membership_payment_id: string | null;
    donation_payment_id: string | null;
    gateway_name: string;
    gateway_order_id: string | null;
    gateway_payment_id: string | null;
    amount: number;
    status: 'INITIATED' | 'SUCCESS';
    created_at: string;
  }>;
}

/** POST /payments/verify body — backend has NO notes field (whitelist 400s). */
export interface VerifyPaymentPayload {
  gateway_payment_id: string;
  gateway_order_id?: string;
  gateway_signature?: string;
  gateway_payload?: Record<string, unknown>;
}

/** Response of the idempotent verify (re-verify returns the same pair). */
export interface VerifyPaymentResponse {
  payment: MembershipPaymentItem;
  receipt: {
    id: string;
    receipt_number: string;
    receipt_date: string;
    amount: number;
    payment_method: string;
    receipt_type: 'MEMBERSHIP' | 'DONATION';
    issued_to: string;
    notes: string | null;
    accounting_entry_id: string | null;
  };
}

/** Flat pagination meta shared by payments/accounts list endpoints. */
export interface PaymentPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Per-status totals for filter tabs (meta.total probes). */
export interface PaymentStats {
  all: number;
  pending: number;
  verified: number;
  failed: number;
}


/** PATCH /:id/status body (permission: payment.manage_status). */
export interface SetPaymentStatusPayload {
  status: PaymentStatus;
  notes?: string;
}
