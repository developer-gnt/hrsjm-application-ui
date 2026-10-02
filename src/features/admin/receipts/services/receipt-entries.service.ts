import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type { VoucherStatus, PaymentMethod } from '../../accounting/types/accounting.types';
import type {
  CreateReceiptPayload,
  ReceiptEntryDetail,
  ReceiptEntryItem,
  ReceiptFlatList,
  ReceiptListResult,
} from '../types/receipts.types';

export interface ListReceiptsParams {
  page?: number;
  limit?: number;
  status?: VoucherStatus;
  payment_method?: PaymentMethod;
  search?: string;
}

/**
 * Receipt voucher service (manual income receipts — NOT the generated
 * donation/member receipt center). Flat pagination normalized to camelCase.
 * Cancellation triggers the backend accounting reversal.
 */
export const receiptEntriesService = {
  async list(
    params: ListReceiptsParams,
  ): Promise<ReceiptListResult> {
    const response = await apiClient.get<ReceiptFlatList>(
      ApiRoutes.RECEIPTS.BASE,
      { params },
    );
    const data = response.data;
    return {
      items: data.items,
      meta: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.total_pages,
      },
    };
  },

  async get(id: string): Promise<ReceiptEntryDetail> {
    const response = await apiClient.get<ReceiptEntryDetail>(
      ApiRoutes.RECEIPTS.DETAILS(id),
    );
    return response.data;
  },

  async create(payload: CreateReceiptPayload): Promise<ReceiptEntryItem> {
    const response = await apiClient.post<ReceiptEntryItem>(
      ApiRoutes.RECEIPTS.BASE,
      payload,
    );
    return response.data;
  },

  async cancel(id: string, cancellationReason?: string): Promise<ReceiptEntryItem> {
    const response = await apiClient.patch<ReceiptEntryItem>(
      ApiRoutes.RECEIPTS.STATUS(id),
      {
        status: 'CANCELLED',
        ...(cancellationReason ? { cancellation_reason: cancellationReason } : {}),
      },
    );
    return response.data;
  },
};