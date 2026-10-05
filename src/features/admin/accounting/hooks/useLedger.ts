import { useCallback, useEffect, useState } from 'react';
import type {
  AccountItem,
  LedgerSummary,
  LedgerTransaction,
} from '../types/accounting.types';
import {
  getAccountLedgerApi,
  getGlobalLedgerApi,
} from '../services/ledger.service';

export interface UseLedgerParams {
  accountId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface UseLedgerResult {
  transactions: LedgerTransaction[];
  summary: LedgerSummary;
  account: AccountItem | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useLedger = ({ accountId, fromDate, toDate }: UseLedgerParams): UseLedgerResult => {
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [summary, setSummary] = useState<LedgerSummary>({
    opening_balance: 0,
    total_debit: 0,
    total_credit: 0,
    closing_balance: 0,
  });
  const [account, setAccount] = useState<AccountItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (accountId) {
        const data = await getAccountLedgerApi(accountId, {
          from_date: fromDate,
          to_date: toDate,
        });
        setTransactions(data.transactions || []);
        setAccount(data.account || null);
        setSummary({
          opening_balance: data.opening_balance || 0,
          total_debit: data.total_debit || 0,
          total_credit: data.total_credit || 0,
          closing_balance: data.closing_balance || 0,
          net_change: (data.total_debit || 0) - (data.total_credit || 0),
        });
      } else {
        // Fallback dates if not specified
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const data = await getGlobalLedgerApi({
          from_date: fromDate || startOfMonth,
          to_date: toDate || endOfMonth,
        });
        setTransactions(data.transactions || []);
        setAccount(null);
        setSummary({
          opening_balance: data.opening_balance || 0,
          total_debit: data.total_debit || 0,
          total_credit: data.total_credit || 0,
          closing_balance: data.closing_balance || 0,
          net_change: (data.total_debit || 0) - (data.total_credit || 0),
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load ledger data');
    } finally {
      setLoading(false);
    }
  }, [accountId, fromDate, toDate]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  return {
    transactions,
    summary,
    account,
    loading,
    error,
    refresh: fetchLedger,
  };
};
