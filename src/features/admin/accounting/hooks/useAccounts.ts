import { useQuery } from '@tanstack/react-query';
import { accountsService } from '../services/accounts.service';
import type { AccountType } from '../types/accounting.types';

export const ACCOUNTS_QUERY_KEYS = {
  list: (
    accountType: AccountType | undefined,
    search: string | undefined,
  ) => ['accounts', accountType ?? 'all', search ?? ''] as const,
};

/**
 * Active accounts of one type for voucher pickers. Search is typed by the
 * user inside the picker; the query key changes on search settle.
 */
export const useAccounts = (
  accountType: AccountType | undefined,
  search?: string,
) =>
  useQuery({
    queryKey: ACCOUNTS_QUERY_KEYS.list(accountType, search),
    queryFn: () =>
      accountsService.list({
        account_type: accountType,
        is_active: true,
        search: search || undefined,
        page: 1,
        limit: 50,
      }),
    staleTime: 60_000,
  });