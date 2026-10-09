import { apiClient } from '../../../core/api/client';
import {
  CashfreeOrderSession,
  CashfreeVerifyResponse,
  PaymentPayload,
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
  membershipPaymentId: string;
  idempotencyKey?: string;
}

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
    const donationRes = await apiClient.post<{ id: string }>('/donations', {
      donor_name: params.donorName,
      donor_mobile: params.donorMobile || '9999999999',
      donor_email: params.donorEmail || undefined,
      cause: params.cause,
      amount: params.amount,
      remark,
    });

    const donationId = (donationRes as any)?.data?.id || (donationRes as any)?.id;

    // 2. Create pending donation payment
    const paymentRes = await apiClient.post<{ id: string }>('/donation-payments', {
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
      '/payments/cashfree/orders',
      {
        purpose: 'donation',
        reference_id: paymentId,
      },
      { headers },
    );

    const orderData = (orderRes as any)?.data || orderRes;
    return orderData;
  },

  /**
   * Initiates Cashfree PG order for an existing membership payment
   */
  async createMembershipOrder(
    params: CreateMembershipOrderParams,
  ): Promise<CashfreeOrderSession> {
    const headers: Record<string, string> = {};
    if (params.idempotencyKey) {
      headers['x-idempotency-key'] = params.idempotencyKey;
    }

    const orderRes = await apiClient.post<CashfreeOrderSession>(
      '/payments/cashfree/orders',
      {
        purpose: 'membership',
        reference_id: params.membershipPaymentId,
      },
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
      '/payments/cashfree/orders',
      {
        purpose,
        reference_id: referenceId,
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
      `/payments/cashfree/orders/${encodeURIComponent(orderId)}/verify`,
    );
    const verifyData = (verifyRes as any)?.data || verifyRes;
    return verifyData;
  },
};
