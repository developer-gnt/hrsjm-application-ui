import { apiClient } from '../../../core/api/client';
import { API_ENDPOINTS } from '../../../core/api/endpoints';
import {
  CashfreeOrderSession,
  CashfreeVerifyResponse,
} from '../types/payment.types';

export interface CreateDonationOrderParams {
  cause: string;
  amount: number;
  donorName: string;
  donorMobile?: string;
  donorEmail?: string;
  panNumber?: string;
  need80G?: boolean;
  idempotencyKey?: string;
}

export interface CreateMembershipOrderParams {
  membershipPaymentId?: string;
  amount?: number;
  customerName?: string;
  customerMobile?: string;
  customerEmail?: string;
  membershipType?: string;
  idempotencyKey?: string;
}

const getReturnUrl = (): string => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/index.html?cashfree_callback=true&order_id={order_id}`;
  }
  return 'http://localhost:8089/index.html?cashfree_callback=true&order_id={order_id}';
};

/**
 * Cashfree API Service for React Native Application
 */
export const cashfreeApi = {
  /**
   * Complete donation initialization:
   * 1. Creates donation record
   * 2. Creates donation payment record
   * 3. Creates Cashfree PG checkout order session
   */
  async createDonationOrder(
    params: CreateDonationOrderParams,
  ): Promise<CashfreeOrderSession> {
    const remark = params.panNumber
      ? `80G PAN: ${params.panNumber}`
      : `Donation for ${params.cause}`;

    // 1. Create authoritative donation record
    const donationRes = await apiClient.post<{ id: string }>(API_ENDPOINTS.DONATIONS.CREATE, {
      donor_name: params.donorName,
      donor_mobile: params.donorMobile || '9999999999',
      donor_email: params.donorEmail || undefined,
      cause: params.cause,
      amount: params.amount,
      remark,
    });

    const donationId = (donationRes as any)?.data?.id || (donationRes as any)?.id;

    // 2. Create pending donation payment
    const paymentRes = await apiClient.post<{ id: string }>(API_ENDPOINTS.PAYMENTS.DONATION_PAYMENTS, {
      donation_id: donationId,
      amount: params.amount,
      payment_method: 'CASHFREE',
    });

    const paymentId = (paymentRes as any)?.data?.id || (paymentRes as any)?.id;

    // 3. Initiate Cashfree checkout order
    const headers: Record<string, string> = {};
    if (params.idempotencyKey) {
      headers['x-idempotency-key'] = params.idempotencyKey;
    }

    const orderRes = await apiClient.post<CashfreeOrderSession>(
      API_ENDPOINTS.PAYMENTS.CASHFREE_ORDERS,
      {
        purpose: 'donation',
        reference_id: paymentId,
        return_url: getReturnUrl(),
      },
      { headers },
    );

    const orderData = (orderRes as any)?.data || orderRes;
    return orderData;
  },

  /**
   * Initiates Cashfree PG order for an existing or new membership payment
   */
  async createMembershipOrder(
    params: CreateMembershipOrderParams,
  ): Promise<CashfreeOrderSession> {
    const headers: Record<string, string> = {};
    if (params.idempotencyKey) {
      headers['x-idempotency-key'] = params.idempotencyKey;
    }

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const validReferenceId =
      params.membershipPaymentId && UUID_REGEX.test(params.membershipPaymentId)
        ? params.membershipPaymentId
        : undefined;

    const rawPhone = params.customerMobile || '';
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
    const customerPhone = cleanPhone.length === 10 ? cleanPhone : '9876543210';

    const payload: Record<string, any> = {
      purpose: 'membership',
      amount: params.amount,
      customer_name: params.customerName || 'HRSJM Member',
      customer_phone: customerPhone,
      customer_email: params.customerEmail || 'member@hrsjm.org',
      order_note: params.membershipType || 'Membership Registration Fee',
      return_url: getReturnUrl(),
    };

    if (validReferenceId) {
      payload.reference_id = validReferenceId;
    }

    const orderRes = await apiClient.post<CashfreeOrderSession>(
      API_ENDPOINTS.PAYMENTS.CASHFREE_ORDERS,
      payload,
      { headers },
    );

    const orderData = (orderRes as any)?.data || orderRes;
    return orderData;
  },

  /**
   * Generic order creator when payment record UUID is already known
   */
  async createOrder(
    purpose: 'donation' | 'membership',
    referenceId: string,
    idempotencyKey?: string,
  ): Promise<CashfreeOrderSession> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['x-idempotency-key'] = idempotencyKey;
    }

    const orderRes = await apiClient.post<CashfreeOrderSession>(
      API_ENDPOINTS.PAYMENTS.CASHFREE_ORDERS,
      {
        purpose,
        reference_id: referenceId,
        return_url: getReturnUrl(),
      },
      { headers },
    );

    const orderData = (orderRes as any)?.data || orderRes;
    return orderData;
  },

  /**
   * Server-side payment attempt verification with Cashfree
   */
  async verifyOrder(orderId: string): Promise<CashfreeVerifyResponse> {
    const verifyRes = await apiClient.get<CashfreeVerifyResponse>(
      API_ENDPOINTS.PAYMENTS.CASHFREE_VERIFY(orderId),
    );
    const verifyData = (verifyRes as any)?.data || verifyRes;
    return verifyData;
  },

  /**
   * Validates UPI format with backend validation pipeline
   */
  async validateUpiFormat(upiId: string): Promise<{
    valid: boolean;
    formatValid: boolean;
    providerVerified: boolean;
    message: string;
    upiId: string;
  }> {
    try {
      const res = await apiClient.post<{
        valid: boolean;
        formatValid: boolean;
        providerVerified: boolean;
        message: string;
        upiId: string;
      }>('/payments/cashfree/validate-upi', { upiId });
      const data = (res as any)?.data || res;
      return data;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Enter a UPI ID in a supported format';
      const displayMsg = Array.isArray(errorMsg) ? errorMsg[0] : String(errorMsg);
      return {
        valid: false,
        formatValid: false,
        providerVerified: false,
        message: displayMsg,
        upiId,
      };
    }
  },
};
