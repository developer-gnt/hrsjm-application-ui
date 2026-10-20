export type PaymentPurposeType =
  | 'donation'
  | 'membership'
  | 'assistance_fee'
  | 'general';

export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'wallet';

export type UPIAppType = 'gpay' | 'phonepe' | 'paytm' | 'bhim';

export type PaymentStage =
  | 'amount_selection'
  | 'checkout'
  | 'processing'
  | 'reconciling'
  | 'success'
  | 'failed';

export interface PaymentPayload {
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
