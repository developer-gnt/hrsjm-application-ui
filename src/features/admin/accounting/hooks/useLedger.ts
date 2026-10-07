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
import { expensesService } from '../../expenses/services/expenses.service';
import { receiptEntriesService } from '../../receipts/services/receipt-entries.service';
import { donationsService } from '../../donations/services/donations.service';

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
          net_change: (data.total_credit || 0) - (data.total_debit || 0),
        });
      } else {
        // Fetch all sources concurrently
        const [ledgerRes, expenseRes, receiptRes, donationRes] = await Promise.allSettled([
          getGlobalLedgerApi({
            from_date: fromDate,
            to_date: toDate,
            limit: 100,
          }),
          expensesService.list({ limit: 100 }),
          receiptEntriesService.list({ limit: 100 }),
          donationsService.getDonations({ limit: 100 }),
        ]);

        const rawList: LedgerTransaction[] = [];
        const seenVouchers = new Set<string>();

        // 1. Accounting lines
        if (ledgerRes.status === 'fulfilled' && ledgerRes.value?.transactions) {
          ledgerRes.value.transactions.forEach((tx) => {
            rawList.push(tx);
            if (tx.entry_number) seenVouchers.add(tx.entry_number.toLowerCase());
            if (tx.reference_id) seenVouchers.add(tx.reference_id.toLowerCase());
          });
        }

        // 2. Expense vouchers
        if (expenseRes.status === 'fulfilled' && expenseRes.value?.items) {
          expenseRes.value.items.forEach((exp) => {
            const vNum = exp.voucher_number || `EXP-${exp.id.slice(0, 6)}`;
            if (!seenVouchers.has(vNum.toLowerCase()) && !seenVouchers.has(exp.id.toLowerCase())) {
              seenVouchers.add(vNum.toLowerCase());
              seenVouchers.add(exp.id.toLowerCase());
              rawList.push({
                id: exp.id,
                entry_id: exp.id,
                entry_number: vNum,
                entry_date: exp.expense_date || exp.created_at,
                entry_type: 'EXPENSE',
                account_id: exp.paid_from_account_id || exp.expense_account_id || 'exp-acc',
                account_name: exp.paid_to || exp.expense_account?.account_name || 'Expense Voucher',
                account_code: exp.expense_account?.account_code || null,
                account_type: 'EXPENSE',
                reference_type: 'EXPENSE_VOUCHER',
                reference_id: exp.reference_number || vNum,
                narration: exp.description || `Expense paid to ${exp.paid_to}`,
                debit: Number(exp.amount) || 0,
                credit: 0,
                running_balance: 0,
                payment_method: exp.payment_method,
                paid_to: exp.paid_to,
                status: exp.status,
              });
            }
          });
        }

        // 3. Receipt vouchers
        if (receiptRes.status === 'fulfilled' && receiptRes.value?.items) {
          receiptRes.value.items.forEach((rec) => {
            const vNum = rec.voucher_number || `REC-${rec.id.slice(0, 6)}`;
            if (!seenVouchers.has(vNum.toLowerCase()) && !seenVouchers.has(rec.id.toLowerCase())) {
              seenVouchers.add(vNum.toLowerCase());
              seenVouchers.add(rec.id.toLowerCase());
              rawList.push({
                id: rec.id,
                entry_id: rec.id,
                entry_number: vNum,
                entry_date: rec.receipt_date || rec.created_at,
                entry_type: 'RECEIPT',
                account_id: rec.received_in_account_id || rec.income_account_id || 'rec-acc',
                account_name: rec.received_from || rec.income_account?.account_name || 'Receipt Voucher',
                account_code: rec.income_account?.account_code || null,
                account_type: 'INCOME',
                reference_type: 'RECEIPT_VOUCHER',
                reference_id: rec.reference_number || vNum,
                narration: rec.description || `Received from ${rec.received_from}`,
                debit: 0,
                credit: Number(rec.amount) || 0,
                running_balance: 0,
                payment_method: rec.payment_method,
                received_from: rec.received_from,
                status: rec.status,
              });
            }
          });
        }

        // 4. Donation receipts
        if (donationRes.status === 'fulfilled' && donationRes.value) {
          const donItems: any[] = (donationRes.value as any)?.items || (donationRes.value as any)?.data || [];
          donItems.forEach((don: any) => {
            const vNum = don.receipt_number || `DON-${don.id?.slice(0, 6)?.toUpperCase() || 'TX'}`;
            if (!seenVouchers.has(vNum.toLowerCase()) && !seenVouchers.has(don.id.toLowerCase())) {
              seenVouchers.add(vNum.toLowerCase());
              seenVouchers.add(don.id.toLowerCase());
              rawList.push({
                id: don.id,
                entry_id: don.id,
                entry_number: vNum,
                entry_date: don.created_at || new Date().toISOString(),
                entry_type: 'DONATION',
                account_id: 'donation-account',
                account_name: don.donor_name ? `Donation: ${don.donor_name}` : 'General Donation',
                account_code: '4002',
                account_type: 'INCOME',
                reference_type: 'DONATION',
                reference_id: don.transaction_id || vNum,
                narration: don.notes || (don.donor_name ? `Donation from ${don.donor_name}` : 'Charity Contribution'),
                debit: 0,
                credit: Number(don.amount) || 0,
                running_balance: 0,
                payment_method: don.payment_mode || 'ONLINE',
                received_from: don.donor_name,
                status: don.status || 'COMPLETED',
              });
            }
          });
        }

        // Date Filter
        let filtered = rawList;
        if (fromDate) {
          filtered = filtered.filter((t) => {
            const d = t.entry_date ? t.entry_date.slice(0, 10) : '';
            return d >= fromDate;
          });
        }
        if (toDate) {
          filtered = filtered.filter((t) => {
            const d = t.entry_date ? t.entry_date.slice(0, 10) : '';
            return d <= toDate;
          });
        }

        // Sort Chronologically (Ascending) for running balance calculation
        filtered.sort((a, b) => {
          const da = new Date(a.entry_date).getTime() || 0;
          const db = new Date(b.entry_date).getTime() || 0;
          return da - db;
        });

        let running = 0;
        let totalCredit = 0;
        let totalDebit = 0;

        const calculated = filtered.map((tx) => {
          const cr = Number(tx.credit) || 0;
          const dr = Number(tx.debit) || 0;
          totalCredit += cr;
          totalDebit += dr;
          running += cr - dr;
          return {
            ...tx,
            credit: cr,
            debit: dr,
            running_balance: running,
          };
        });

        // Newest first for passbook view
        const displayList = [...calculated].reverse();

        setTransactions(displayList);
        setAccount(null);
        setSummary({
          opening_balance: 0,
          total_debit: totalDebit,
          total_credit: totalCredit,
          closing_balance: running,
          net_change: totalCredit - totalDebit,
        });
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
