import { apiClient } from '../../../core/api/client';
import { ApiRoutes } from '../../../core/constants/api-routes';
import type {
  TransactionFilterParams,
  UserTransactionItem,
  UserTransactionsResponse,
} from '../types/transactions.types';

export const transactionsService = {
  /**
   * Fetches the unified transaction history and payment totals for current user.
   */
  getMyTransactions: async (params?: TransactionFilterParams): Promise<UserTransactionsResponse> => {
    try {
      const response = await apiClient.get<any>(ApiRoutes.TRANSACTIONS.MY, {
        params: {
          category: params?.category && params.category !== 'ALL' ? params.category : undefined,
          status: params?.status && params.status !== 'ALL' ? params.status : undefined,
          search: params?.search ? params.search.trim() : undefined,
          fromDate: params?.fromDate,
          toDate: params?.toDate,
          page: params?.page || 1,
          limit: params?.limit || 50,
        },
      });

      const payload = response.data || response;
      const data = payload?.data || payload;

      return {
        summary: data?.summary || {
          total_amount_paid: 0,
          total_transactions: 0,
          successful_count: 0,
          pending_count: 0,
          failed_count: 0,
          refunded_count: 0,
        },
        items: Array.isArray(data?.items) ? data.items : [],
        meta: data?.meta || {
          page: 1,
          limit: 50,
          total: Array.isArray(data?.items) ? data.items.length : 0,
          totalPages: 1,
        },
      };
    } catch (error) {
      console.warn('Failed to fetch transactions from backend:', error);
      return {
        summary: {
          total_amount_paid: 0,
          total_transactions: 0,
          successful_count: 0,
          pending_count: 0,
          failed_count: 0,
          refunded_count: 0,
        },
        items: [],
        meta: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 1,
        },
      };
    }
  },

  /**
   * Fetches single transaction details by ID.
   */
  getTransactionById: async (id: string): Promise<UserTransactionItem | null> => {
    try {
      const response = await apiClient.get<any>(ApiRoutes.TRANSACTIONS.DETAILS(id));
      const payload = response.data || response;
      return payload?.data || payload || null;
    } catch (error) {
      console.warn(`Failed to fetch transaction ${id}:`, error);
      return null;
    }
  },
};

