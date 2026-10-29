import { useCallback, useEffect, useState } from 'react';
import type {
  AccountItem,
  LedgerSummary,
  LedgerTransaction,
} from '../types/accounting.types';
import {
  fetchAggregatedPassbookLedger,
  getAccountLedgerApi,
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

        const txs = (data.transactions || []).map((t) => {
          const cr = Number(t.credit) || 0;
          const dr = Number(t.debit) || 0;
          const cl = Number(t.running_balance) || 0;
          const op = cl - cr + dr;
          return {
            ...t,
            credit: cr,
            debit: dr,
            opening_balance: op,
            closing_balance: cl,
            running_balance: cl,
            category_tag: t.entry_type || 'GENERAL',
          };
        });

        setTransactions(txs);
        setAccount(data.account || null);
        setSummary({
          opening_balance: data.opening_balance || 0,
          total_debit: data.total_debit || 0,
          total_credit: data.total_credit || 0,
          closing_balance: data.closing_balance || 0,
          net_change: (data.total_credit || 0) - (data.total_debit || 0),
        });
      } else {
        const result = await fetchAggregatedPassbookLedger({ fromDate, toDate });
        setTransactions(result.transactions);
        setAccount(null);
        setSummary(result.summary);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load passbook ledger data');
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
