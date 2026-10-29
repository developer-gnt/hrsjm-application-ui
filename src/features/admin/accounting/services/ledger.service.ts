import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import { expensesService } from '../../expenses/services/expenses.service';
import { receiptEntriesService } from '../../receipts/services/receipt-entries.service';
import { donationsService } from '../../donations/services/donations.service';
import { paymentsService } from '../../payments/services/payments.service';
import type {
  AccountLedgerResponse,
  GlobalLedgerResponse,
  LedgerSummary,
  LedgerTransaction,
} from '../types/accounting.types';

export interface GlobalLedgerParams {
  from_date?: string;
  to_date?: string;
  account_id?: string;
  entry_type?: string;
  reference?: string;
  page?: number;
  limit?: number;
}

export interface AccountLedgerParams {
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export const getGlobalLedgerApi = async (
  params: GlobalLedgerParams,
): Promise<GlobalLedgerResponse> => {
  const res = await apiClient.get<GlobalLedgerResponse>(
    ApiRoutes.ACCOUNTING.LEDGER,
    { params },
  );
  return res.data;
};

export const getAccountLedgerApi = async (
  accountId: string,
  params?: AccountLedgerParams,
): Promise<AccountLedgerResponse> => {
  const res = await apiClient.get<AccountLedgerResponse>(
    ApiRoutes.ACCOUNTING.ACCOUNT_LEDGER(accountId),
    { params },
  );
  return res.data;
};

export interface AggregatedPassbookParams {
  fromDate?: string;
  toDate?: string;
}

export interface AggregatedPassbookResult {
  summary: LedgerSummary;
  transactions: LedgerTransaction[];
}

/**
 * Aggregates all organizational revenue and expenditures for Passbook view and exports.
 * Calculates exact Opening Balance, running balances, and totals for the given date range.
 */
export const fetchAggregatedPassbookLedger = async (
  params?: AggregatedPassbookParams,
): Promise<AggregatedPassbookResult> => {
  const fromDate = params?.fromDate;
  const toDate = params?.toDate;

  const [expenseRes, receiptRes, donationRes, paymentRes, renewalRes] = await Promise.allSettled([
    expensesService.list({ page: 1, limit: 100 }),
    receiptEntriesService.list({ page: 1, limit: 100 }),
    donationsService.getDonations({ page: 1, limit: 100 }),
    paymentsService.list({ page: 1, limit: 100 }),
    apiClient.get<any>(ApiRoutes.RENEWALS.ADMIN_LIST, { params: { page: 1, limit: 100 } }),
  ]);

  const rawList: LedgerTransaction[] = [];
  const seenVouchers = new Set<string>();

  // 1. Genuine Expense vouchers (Debits)
  if (expenseRes.status === 'fulfilled' && expenseRes.value?.items) {
    expenseRes.value.items.forEach((exp) => {
      const vNum = exp.voucher_number || `EXP-${exp.id.slice(0, 8).toUpperCase()}`;
      const key1 = vNum.toLowerCase();
      const key2 = exp.id.toLowerCase();
      if (!seenVouchers.has(key1) && !seenVouchers.has(key2)) {
        seenVouchers.add(key1);
        seenVouchers.add(key2);
        rawList.push({
          id: exp.id,
          entry_id: exp.id,
          entry_number: vNum,
          entry_date: exp.expense_date || exp.created_at,
          entry_type: 'EXPENSE',
          category_tag: 'EXPENSE',
          account_id: exp.paid_from_account_id || exp.expense_account_id || 'exp-acc',
          account_name: exp.expense_account?.account_name || exp.paid_to || 'Expense Voucher',
          account_code: exp.expense_account?.account_code || '5001',
          account_type: 'EXPENSE',
          reference_type: 'EXPENSE_VOUCHER',
          reference_id: exp.reference_number || vNum,
          narration: exp.description || `Paid to ${exp.paid_to}`,
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

  // 2. Genuine Income Receipt vouchers (Credits)
  if (receiptRes.status === 'fulfilled' && receiptRes.value?.items) {
    receiptRes.value.items.forEach((rec) => {
      const vNum = rec.voucher_number || `REC-${rec.id.slice(0, 8).toUpperCase()}`;
      const key1 = vNum.toLowerCase();
      const key2 = rec.id.toLowerCase();
      if (!seenVouchers.has(key1) && !seenVouchers.has(key2)) {
        seenVouchers.add(key1);
        seenVouchers.add(key2);
        rawList.push({
          id: rec.id,
          entry_id: rec.id,
          entry_number: vNum,
          entry_date: rec.receipt_date || rec.created_at,
          entry_type: 'RECEIPT',
          category_tag: 'RECEIPT',
          account_id: rec.received_in_account_id || rec.income_account_id || 'rec-acc',
          account_name: rec.income_account?.account_name || rec.received_from || 'Income Receipt',
          account_code: rec.income_account?.account_code || '4004',
          account_type: 'INCOME',
          reference_type: 'RECEIPT_VOUCHER',
          reference_id: rec.reference_number || vNum,
          narration: rec.description || `From ${rec.received_from}`,
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

  // 3. Donations & Cause Funds (Credits)
  if (donationRes.status === 'fulfilled' && donationRes.value?.items) {
    donationRes.value.items.forEach((don: any) => {
      const isCause = !!(
        don.cause &&
        don.cause.trim() &&
        !don.cause.toLowerCase().includes('general')
      );
      const catTag = isCause ? 'CAUSE_FUND' : 'DONATION';
      const vNum = `DON-${(don.id || '').slice(0, 8).toUpperCase()}`;
      const key1 = vNum.toLowerCase();
      const key2 = (don.id || '').toLowerCase();
      if (!seenVouchers.has(key1) && !seenVouchers.has(key2)) {
        seenVouchers.add(key1);
        seenVouchers.add(key2);
        rawList.push({
          id: don.id,
          entry_id: don.id,
          entry_number: vNum,
          entry_date: don.created_at || new Date().toISOString(),
          entry_type: catTag,
          category_tag: catTag,
          account_id: 'don-income-acc',
          account_name: don.cause
            ? `Donation · ${don.cause}`
            : 'General Public Donation',
          account_code: '4003',
          account_type: 'INCOME',
          reference_type: isCause ? 'CAUSE_FUND' : 'DONATION',
          reference_id: vNum,
          narration:
            don.remark ||
            (don.cause
              ? `Donation towards ${don.cause}`
              : 'Donation received for public welfare mission'),
          debit: 0,
          credit: Number(don.amount) || 0,
          running_balance: 0,
          payment_method: 'ONLINE',
          received_from: don.donor_name || 'Anonymous Donor',
          status: don.status || 'SUCCESS',
        });
      }
    });
  }

  // 4. Membership Payments (New Memberships & Renewals) (Credits)
  if (paymentRes.status === 'fulfilled' && paymentRes.value?.items) {
    paymentRes.value.items.forEach((pay: any) => {
      const notesLower = (pay.notes || '').toLowerCase();
      const receiptNotesLower = (pay.receipt?.notes || '').toLowerCase();
      const isRenewal =
        notesLower.includes('renew') || receiptNotesLower.includes('renew');
      const catTag = isRenewal ? 'RENEWAL_FEE' : 'MEMBERSHIP_FEE';
      const vNum =
        pay.receipt?.receipt_number ||
        `MEM-${(pay.id || '').slice(0, 8).toUpperCase()}`;
      const key1 = vNum.toLowerCase();
      const key2 = (pay.id || '').toLowerCase();
      if (!seenVouchers.has(key1) && !seenVouchers.has(key2)) {
        seenVouchers.add(key1);
        seenVouchers.add(key2);
        const memberCat =
          pay.membership?.category?.name || 'Standard Member';
        rawList.push({
          id: pay.id,
          entry_id: pay.id,
          entry_number: vNum,
          entry_date:
            pay.payment_date || pay.created_at || new Date().toISOString(),
          entry_type: catTag,
          category_tag: catTag,
          account_id: isRenewal ? 'renew-income-acc' : 'mem-income-acc',
          account_name: isRenewal
            ? `Renewal Fee · ${memberCat}`
            : `Membership Fee · ${memberCat}`,
          account_code: isRenewal ? '4002' : '4001',
          account_type: 'INCOME',
          reference_type: isRenewal
            ? 'RENEWAL_PAYMENT'
            : 'MEMBERSHIP_PAYMENT',
          reference_id: pay.transaction_id || vNum,
          narration:
            pay.notes ||
            `${isRenewal ? 'Renewal' : 'Membership'} fee collected from ${
              pay.user?.full_name || 'Member'
            }`,
          debit: 0,
          credit: Number(pay.amount) || 0,
          running_balance: 0,
          payment_method: pay.payment_method || 'ONLINE',
          received_from: pay.user?.full_name || 'Member',
          status: pay.payment_status || 'SUCCESS',
        });
      }
    });
  }

  // 5. Membership Renewals (Direct from /admin/renewals if any distinct records)
  if (
    renewalRes.status === 'fulfilled' &&
    (renewalRes.value as any)?.data?.items
  ) {
    const renewalItems = (renewalRes.value as any).data.items;
    renewalItems.forEach((ren: any) => {
      const vNum =
        ren.receipt_number ||
        `REN-${(ren.id || '').slice(0, 8).toUpperCase()}`;
      const key1 = vNum.toLowerCase();
      const key2 = (ren.id || '').toLowerCase();
      if (!seenVouchers.has(key1) && !seenVouchers.has(key2)) {
        seenVouchers.add(key1);
        seenVouchers.add(key2);
        const memberCat =
          ren.membership?.category?.name || 'Membership Renewal';
        const memberName =
          ren.requested_by_user?.full_name ||
          ren.membership?.user?.full_name ||
          'Member';
        rawList.push({
          id: ren.id,
          entry_id: ren.id,
          entry_number: vNum,
          entry_date: ren.created_at || new Date().toISOString(),
          entry_type: 'RENEWAL_FEE',
          category_tag: 'RENEWAL_FEE',
          account_id: 'renew-income-acc',
          account_name: `Renewal Fee · ${memberCat}`,
          account_code: '4002',
          account_type: 'INCOME',
          reference_type: 'RENEWAL_PAYMENT',
          reference_id: vNum,
          narration:
            ren.admin_remark ||
            ren.member_note ||
            `Annual renewal fee for ${memberName}`,
          debit: 0,
          credit: Number(ren.amount) || 0,
          running_balance: 0,
          payment_method: ren.payment_method || 'ONLINE',
          received_from: memberName,
          status: ren.payment_status || ren.status || 'SUCCESS',
        });
      }
    });
  }

  // Calculate Opening Balance from all transactions strictly prior to fromDate
  let openingBalance = 0;
  if (fromDate) {
    rawList.forEach((t) => {
      const d = t.entry_date ? t.entry_date.slice(0, 10) : '';
      if (d && d < fromDate) {
        openingBalance += (Number(t.credit) || 0) - (Number(t.debit) || 0);
      }
    });
  }

  // Filter for transactions within the selected period
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

  // Sort Chronologically (Ascending) for exact running balance calculation
  filtered.sort((a, b) => {
    const da = new Date(a.entry_date).getTime() || 0;
    const db = new Date(b.entry_date).getTime() || 0;
    return da - db;
  });

  let running = openingBalance;
  let totalCredit = 0;
  let totalDebit = 0;

  const calculated = filtered.map((tx) => {
    const cr = Number(tx.credit) || 0;
    const dr = Number(tx.debit) || 0;
    const txOpening = running;
    totalCredit += cr;
    totalDebit += dr;
    running += cr - dr;
    const txClosing = running;
    return {
      ...tx,
      credit: cr,
      debit: dr,
      opening_balance: txOpening,
      closing_balance: txClosing,
      running_balance: txClosing,
    };
  });

  // Newest first for passbook view
  const displayList = [...calculated].reverse();

  return {
    summary: {
      opening_balance: openingBalance,
      total_debit: totalDebit,
      total_credit: totalCredit,
      closing_balance: running,
      net_change: totalCredit - totalDebit,
    },
    transactions: displayList,
  };
};

