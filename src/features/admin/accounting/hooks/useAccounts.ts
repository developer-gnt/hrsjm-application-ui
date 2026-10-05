import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AccountCategory,
  AccountItem,
  AccountTreeNode,
  AccountType,
  CreateAccountPayload,
  UpdateAccountPayload,
} from '../types/accounting.types';
import {
  listAccounts,
  createAccountApi,
  updateAccountApi,
  updateAccountStatusApi,
} from '../services/accounts.service';

/** Builds a recursive tree from a flat list of accounts. */
export const buildAccountTree = (
  accounts: AccountItem[],
  parentAccountId: string | null = null,
  level: number = 0,
): AccountTreeNode[] => {
  if (!Array.isArray(accounts)) return [];
  return accounts
    .filter(a => (a.parent_account_id ?? null) === parentAccountId)
    .sort((a, b) => (a.account_code || '').localeCompare(b.account_code || ''))
    .map(acc => ({
      ...acc,
      level,
      children: buildAccountTree(accounts, acc.id, level + 1),
    }));
};

export interface UseAccountsResult {
  accounts: AccountItem[];
  tree: AccountTreeNode[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createAccount: (payload: CreateAccountPayload) => Promise<AccountItem>;
  updateAccount: (id: string, payload: UpdateAccountPayload) => Promise<AccountItem>;
  toggleAccountStatus: (id: string, currentStatus: boolean) => Promise<AccountItem>;
}

export const useAccounts = (filterCategory?: AccountCategory, search?: string): UseAccountsResult => {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const typeParam = filterCategory && filterCategory !== 'ALL' ? (filterCategory as AccountType) : undefined;
      const data = await listAccounts({
        type: typeParam,
        search: search && search.trim() ? search.trim() : undefined,
      });
      setAccounts(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load chart of accounts');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, search]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const tree = useMemo(() => {
    return buildAccountTree(accounts);
  }, [accounts]);

  const createAccount = async (payload: CreateAccountPayload): Promise<AccountItem> => {
    const created = await createAccountApi(payload);
    await fetchAccounts();
    return created;
  };

  const updateAccount = async (id: string, payload: UpdateAccountPayload): Promise<AccountItem> => {
    const updated = await updateAccountApi(id, payload);
    await fetchAccounts();
    return updated;
  };

  const toggleAccountStatus = async (id: string, currentStatus: boolean): Promise<AccountItem> => {
    const updated = await updateAccountStatusApi(id, !currentStatus);
    await fetchAccounts();
    return updated;
  };

  return {
    accounts,
    tree,
    loading,
    error,
    refresh: fetchAccounts,
    createAccount,
    updateAccount,
    toggleAccountStatus,
  };
};