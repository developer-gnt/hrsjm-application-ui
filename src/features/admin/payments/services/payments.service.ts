import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type {
  MembershipPaymentDetail,
  MembershipPaymentItem,
  PaymentPaginationMeta as PaginationMeta,
  PaymentStatus,
  SetPaymentStatusPayload,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
} from '../types/payments.types';

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  search?: string;
}

/**
 * Payment verification service. Verify is IDEMPOTENT on the backend — a
 * re-verify returns the existing { payment, receipt } with HTTP 200.
 */
export const paymentsService = {
  async list(
    params: ListPaymentsParams,
  ): Promise<{ items: MembershipPaymentItem[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{
      items: MembershipPaymentItem[];
      meta: PaginationMeta;
    }>(ApiRoutes.PAYMENTS.MEMBERSHIP_PAYMENTS, { params });
    return response.data;
  },

  async get(id: string): Promise<MembershipPaymentDetail> {
    const response = await apiClient.get<MembershipPaymentDetail>(
      ApiRoutes.PAYMENTS.DETAILS(id),
    );
    return response.data;
  },

  async verify(
    id: string,
    payload: VerifyPaymentPayload,
  ): Promise<VerifyPaymentResponse> {
    const response = await apiClient.post<VerifyPaymentResponse>(
      ApiRoutes.PAYMENTS.VERIFY(id),
      payload,
    );
    return response.data;
  },

  async setStatus(
    id: string,
    payload: SetPaymentStatusPayload,
  ): Promise<MembershipPaymentItem> {
    const response = await apiClient.patch<MembershipPaymentItem>(
      ApiRoutes.PAYMENTS.STATUS(id),
      payload,
    );
    return response.data;
  },
};