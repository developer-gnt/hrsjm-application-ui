export type PaymentPurposeType =
  | 'donation'
  | 'membership'
  | 'assistance_fee'
  | 'general';

export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'wallet';

export type UPIAppType = 'gpay' | 'phonepe' | 'paytm' | 'bhim';

export type PaymentResultStatus =
  | 'SUCCESS'
  | 'PENDING'
  | 'FAILED'
  | 'USER_DROPPED'
  | 'CANCELLED'
  | 'NETWORK_ERROR';

export type PaymentStage =
  | 'amount_selection'
  | 'checkout'
  | 'processing'
  | 'reconciling'
  | 'success'
  | 'failed'
  | 'user_dropped'
  | 'pending';

export interface RenewalPeriodBreakdown {
  sequence: number;
  label: string;
  period_start: string;
  period_end: string;
  fee: number;
  status: 'UNPAID' | 'PAID' | 'WAIVED';
}

export interface RenewalQuotePayload {
  membership_id: string;
  membership_number?: string | null;
  status?: string;
  registration_date?: string | null;
  current_expiry?: string | null;
  projected_expiry?: string | null;
  is_overdue: boolean;
  days_overdue?: number;
  days_remaining?: number;
  unpaid_periods_count: number;
  paid_periods_count: number;
  periods: RenewalPeriodBreakdown[];
  renewal_subtotal: number;
  platform_fee: number;
  taxes: number;
  total_payable: number;
  explanation: string;
  requires_verification?: boolean;
  verification_reason?: string;
}

export interface PaymentPayload {
  userId?: string;
  purpose: PaymentPurposeType;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  category?: string;
  location?: string;
  amount: number;
  entityId?: string;
  donorName?: string;
  donorEmail?: string;
  donorMobile?: string;
  panNumber?: string;
  need80GReceipt?: boolean;
  targetAmount?: number;
  raisedAmount?: number;
  maxAllowedAmount?: number;
  renewalQuote?: RenewalQuotePayload;
}

export interface CashfreeOrderSession {
  order_id: string;
  payment_session_id: string;
  cf_order_id?: string | number;
  order_status?: string;
  amount: number;
  currency: string;
  purpose: 'donation' | 'membership';
  reference_id: string;
  environment?: 'SANDBOX' | 'PRODUCTION' | string;
}

export interface CashfreeVerifyResponse {
  status: 'SUCCESS' | 'PENDING';
  message?: string;
  order_id: string;
  payment?: {
    id: string;
    amount: number;
    payment_status: string;
    gateway_order_id?: string;
    gateway_payment_id?: string;
    [key: string]: unknown;
  };
  receipt?: {
    id: string;
    receipt_number: string;
    receipt_date?: string;
    [key: string]: unknown;
  };
  attempts_count?: number;
  latest_status?: string;
  latest_message?: string;
}

export interface PaymentFailureInfo {
  status: PaymentResultStatus;
  code: string;
  title: string;
  message: string;
  reason?: string;
  orderId?: string;
  canRetry?: boolean;
  rawError?: any;
}

export interface PaymentReceiptDetails {
  paymentId: string;
  orderId: string;
  donationId?: string;
  amount: number;
  platformFee: number;
  taxCharges: number;
  totalPayable: number;
  date: string;
  time: string;
  paymentMethod: string;
  paymentMethodType: PaymentMethodType;
  status: 'Completed' | 'Pending' | 'Failed';
  purpose: PaymentPurposeType;
  title: string;
  category?: string;
  location?: string;
  imageUrl?: string;
  donorName: string;
  donorEmail?: string;
  donorMobile?: string;
  panNumber?: string;
  is80GEligible: boolean;
  receiptNumber: string;
  bankReferenceNo?: string;
  authCode?: string;
  gatewaySignature?: string;
}
