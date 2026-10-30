import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type { VoucherStatus, PaymentMethod } from '../../accounting/types/accounting.types';
import type {
  CreateExpensePayload,
  ExpenseEntryDetail,
  ExpenseEntryItem,
  FlatVoucherList,
  VoucherListResult,
} from '../types/expenses.types';

export interface ListVouchersParams {
  page?: number;
  limit?: number;
  status?: VoucherStatus;
  payment_method?: PaymentMethod;
  search?: string;
}

/**
 * Expense voucher service. Backend list pagination is FLAT
 * ({items, total, page, limit, total_pages}) — normalized to camelCase meta.
 * Cancellation (PATCH :id/status CANCELLED) triggers the accounting reversal
 * server-side.
 */
export const expensesService = {
  async list(
    params: ListVouchersParams,
  ): Promise<VoucherListResult<ExpenseEntryItem>> {
    const response = await apiClient.get<any>(
      ApiRoutes.EXPENSES.BASE,
      { params },
    );
    const data = (response as any)?.data || response;
    const items = data?.items || (Array.isArray(data) ? data : []);
    return {
      items,
      meta: {
        page: data?.page || 1,
        limit: data?.limit || items.length,
        total: data?.total !== undefined ? data.total : items.length,
        totalPages: data?.total_pages || 1,
      },
    };
  },

  async get(id: string): Promise<ExpenseEntryDetail> {
    const response = await apiClient.get<ExpenseEntryDetail>(
      ApiRoutes.EXPENSES.DETAILS(id),
    );
    return response.data;
  },

  async create(payload: CreateExpensePayload): Promise<ExpenseEntryItem> {
    const response = await apiClient.post<ExpenseEntryItem>(
      ApiRoutes.EXPENSES.BASE,
      payload,
    );
    return response.data;
  },

  async cancel(id: string, cancellationReason?: string): Promise<ExpenseEntryItem> {
    const response = await apiClient.patch<ExpenseEntryItem>(
      ApiRoutes.EXPENSES.STATUS(id),
      {
        status: 'CANCELLED',
        ...(cancellationReason ? { cancellation_reason: cancellationReason } : {}),
      },
    );
    return response.data;
  },
};