import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type { AccountItem, AccountType } from '../types/accounting.types';

/**
 * Chart of Accounts service (used by voucher pickers now, tree/ledger in
 * Phase 6). Backend enforces account_type + is_active on voucher creation —
 * callers pre-filter with the same criteria.
 */
export const accountsService = {
  async list(params: {
    account_type?: AccountType;
    is_active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: AccountItem[]; total: number; totalPages: number }> {
    const response = await apiClient.get<{
      items: AccountItem[];
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>(ApiRoutes.ACCOUNTING.ACCOUNTS, { params });
    return {
      items: response.data.items,
      total: response.data.meta.total,
      totalPages: response.data.meta.totalPages,
    };
  },
};