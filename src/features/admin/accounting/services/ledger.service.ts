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
  const seenReferences = new Set<string>();

  // Normalization helpers for robust cross-table deduplication
  const cleanName = (name?: string | null): string => {
    if (!name) return '';
    return name
      .replace(/\s*\([^)]*\)/g, '') // remove parenthetical notes like "(Member: ...)"
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ''); // alphanumeric only
  };

  const normalizeDate = (d?: string | null): string => {
    if (!d) return '';
    return d.slice(0, 10);
  };

  // Track receipts representing donations and memberships so raw entities aren't duplicated
  interface CoveredReceiptItem {
    id: string;
    voucher_number: string;
    reference_number: string;
    amount: number;
    dateKey: string;
    cleanPayer: string;
    rawPayer: string;
    descriptionLower: string;
    isDonation: boolean;
    isMembership: boolean;
    used: boolean;
  }
  const coveredReceipts: CoveredReceiptItem[] = [];

  // 1. Genuine Expense vouchers (Debits)
  if (expenseRes.status === 'fulfilled' && expenseRes.value?.items) {
    expenseRes.value.items.forEach((exp) => {
      const vNum = exp.voucher_number || `EXP-${exp.id.slice(0, 8).toUpperCase()}`;
      const key1 = vNum.toLowerCase();
      const key2 = exp.id.toLowerCase();
      if (!seenVouchers.has(key1) && !seenVouchers.has(key2)) {
        seenVouchers.add(key1);
        seenVouchers.add(key2);
        if (exp.reference_number) {
          seenReferences.add(exp.reference_number.trim().toLowerCase());
        }
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

        const refNum = (rec.reference_number || '').trim().toLowerCase();
        if (refNum && !refNum.startsWith('ref-rec') && refNum !== 'n/a') {
          seenReferences.add(refNum);
        }

        const descLower = (rec.description || '').toLowerCase();
        const payIdMatch = descLower.match(/payment id:\s*([^\s|]+)/);
        if (payIdMatch && payIdMatch[1]) {
          seenReferences.add(payIdMatch[1].trim().toLowerCase());
        }
        const refMatch = descLower.match(/reference:\s*([^\s|]+)/);
        if (refMatch && refMatch[1]) {
          seenReferences.add(refMatch[1].trim().toLowerCase());
        }

        // Categorize income receipt stream
        const isDonation =
          rec.income_account?.account_code === '4003' ||
          (rec as any).account_code === '4003' ||
          (rec.income_account?.account_name || '').toLowerCase().includes('donation') ||
          descLower.includes('donation');

        const isRenewal =
          rec.income_account?.account_code === '4002' ||
          (rec.income_account?.account_name || '').toLowerCase().includes('renewal') ||
          descLower.includes('renewal') ||
          descLower.includes('renew');

        const isMembership =
          !isRenewal &&
          (rec.income_account?.account_code === '4001' ||
            (rec.income_account?.account_name || '').toLowerCase().includes('membership') ||
            descLower.includes('membership'));

        const isCause =
          isDonation &&
          descLower.includes('cause') &&
          !descLower.includes('general');

        const categoryTag = isCause
          ? 'CAUSE_FUND'
          : isDonation
          ? 'DONATION'
          : isRenewal
          ? 'RENEWAL_FEE'
          : isMembership
          ? 'MEMBERSHIP_FEE'
          : 'RECEIPT';

        coveredReceipts.push({
          id: rec.id,
          voucher_number: vNum,
          reference_number: refNum,
          amount: Number(rec.amount) || 0,
          dateKey: normalizeDate(rec.receipt_date || rec.created_at),
          cleanPayer: cleanName(rec.received_from),
          rawPayer: (rec.received_from || '').trim().toLowerCase(),
          descriptionLower: descLower,
          isDonation,
          isMembership: isMembership || isRenewal,
          used: false,
        });

        rawList.push({
          id: rec.id,
          entry_id: rec.id,
          entry_number: vNum,
          entry_date: rec.receipt_date || rec.created_at,
          entry_type: 'RECEIPT',
          category_tag: categoryTag,
          account_id: rec.received_in_account_id || rec.income_account_id || 'rec-acc',
          account_name: rec.income_account?.account_name || rec.received_from || 'Income Receipt',
          account_code: rec.income_account?.account_code || (isDonation ? '4003' : isRenewal ? '4002' : isMembership ? '4001' : '4004'),
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
  // Deduplicates against receipt vouchers so an online donation that has an official receipt is NOT listed twice
  if (donationRes.status === 'fulfilled' && donationRes.value?.items) {
    donationRes.value.items.forEach((don: any) => {
      const st = (don.status || '').toUpperCase();
      if (st === 'FAILED' || st === 'CANCELLED' || st === 'REJECTED') {
        return;
      }

      const donId = (don.id || '').toLowerCase();
      const vNum = `DON-${(don.id || '').slice(0, 8).toUpperCase()}`;
      const key1 = vNum.toLowerCase();
      const key2 = donId;

      if (seenVouchers.has(key1) || seenVouchers.has(key2) || seenReferences.has(donId)) {
        return;
      }

      const donAmount = Number(don.amount) || 0;
      const donDate = normalizeDate(don.created_at);
      const donDonorClean = cleanName(don.donor_name);
      const donCause = (don.cause || '').toLowerCase();

      // Check if this donation is already covered by a posted receipt voucher
      const matchIndex = coveredReceipts.findIndex((rec) => {
        if (rec.used || !rec.isDonation) return false;

        // 1. Amount match
        if (Math.abs(rec.amount - donAmount) > 0.01) return false;

        // 2. Date match within 2 days (timezone tolerance)
        if (rec.dateKey && donDate) {
          const diffMs = Math.abs(new Date(rec.dateKey).getTime() - new Date(donDate).getTime());
          if (!isNaN(diffMs) && diffMs > 86400000 * 2) {
            return false;
          }
        }

        // 3. Reference or description containing donation ID
        if (donId && (rec.reference_number.includes(donId) || rec.descriptionLower.includes(donId))) {
          return true;
        }

        // 4. Payer name match
        const payerMatches =
          (donDonorClean && rec.cleanPayer && (
            rec.cleanPayer.includes(donDonorClean) ||
            donDonorClean.includes(rec.cleanPayer)
          )) ||
          (don.donor_name && rec.descriptionLower.includes(don.donor_name.trim().toLowerCase())) ||
          (don.donor_name && rec.rawPayer.includes(don.donor_name.trim().toLowerCase()));

        if (payerMatches) return true;

        // 5. Specific cause match if donor was anonymous or generic
        if (donCause && !donCause.includes('general') && rec.descriptionLower.includes(donCause)) {
          return true;
        }

        return false;
      });

      if (matchIndex !== -1) {
        // Mark receipt as covering this donation and skip adding the duplicate DON-... entry
        coveredReceipts[matchIndex].used = true;
        seenVouchers.add(key1);
        seenVouchers.add(key2);
        return;
      }

      seenVouchers.add(key1);
      seenVouchers.add(key2);

      const isCause = !!(
        don.cause &&
        don.cause.trim() &&
        !don.cause.toLowerCase().includes('general')
      );
      const catTag = isCause ? 'CAUSE_FUND' : 'DONATION';

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
        credit: donAmount,
        running_balance: 0,
        payment_method: 'ONLINE',
        received_from: don.donor_name || 'Anonymous Donor',
        status: don.status || 'SUCCESS',
      });
    });
  }

  // 4. Membership Payments (New Memberships & Renewals) (Credits)
  // Deduplicates against receipt vouchers so membership payments aren't counted twice
  if (paymentRes.status === 'fulfilled' && paymentRes.value?.items) {
    paymentRes.value.items.forEach((pay: any) => {
      const st = (pay.payment_status || '').toUpperCase();
      if (st === 'FAILED' || st === 'CANCELLED' || st === 'REFUNDED') {
        return;
      }

      const payId = (pay.id || '').toLowerCase();
      const vNum =
        pay.receipt?.receipt_number ||
        `MEM-${(pay.id || '').slice(0, 8).toUpperCase()}`;
      const key1 = vNum.toLowerCase();
      const key2 = payId;

      if (seenVouchers.has(key1) || seenVouchers.has(key2) || seenReferences.has(payId)) {
        return;
      }

      const payTxId = (pay.transaction_id || '').toLowerCase();
      if (payTxId && seenReferences.has(payTxId)) {
        return;
      }

      const payAmount = Number(pay.amount) || 0;
      const payDate = normalizeDate(pay.payment_date || pay.created_at);
      const payUserName = cleanName(pay.user?.full_name);

      // Match against covered receipt vouchers
      const matchIndex = coveredReceipts.findIndex((rec) => {
        if (rec.used || !rec.isMembership) return false;

        if (Math.abs(rec.amount - payAmount) > 0.01) return false;

        if (rec.dateKey && payDate) {
          const diffMs = Math.abs(new Date(rec.dateKey).getTime() - new Date(payDate).getTime());
          if (!isNaN(diffMs) && diffMs > 86400000 * 2) {
            return false;
          }
        }

        if (payId && (rec.reference_number.includes(payId) || rec.descriptionLower.includes(payId))) {
          return true;
        }

        if (payTxId && (rec.reference_number.includes(payTxId) || rec.descriptionLower.includes(payTxId))) {
          return true;
        }

        const payerMatches =
          (payUserName && rec.cleanPayer && (
            rec.cleanPayer.includes(payUserName) ||
            payUserName.includes(rec.cleanPayer)
          )) ||
          (pay.user?.full_name && rec.descriptionLower.includes(pay.user.full_name.trim().toLowerCase())) ||
          (pay.user?.full_name && rec.rawPayer.includes(pay.user.full_name.trim().toLowerCase()));

        return payerMatches;
      });

      if (matchIndex !== -1) {
        coveredReceipts[matchIndex].used = true;
        seenVouchers.add(key1);
        seenVouchers.add(key2);
        return;
      }

      seenVouchers.add(key1);
      seenVouchers.add(key2);

      const notesLower = (pay.notes || '').toLowerCase();
      const receiptNotesLower = (pay.receipt?.notes || '').toLowerCase();
      const isRenewal =
        notesLower.includes('renew') || receiptNotesLower.includes('renew');
      const catTag = isRenewal ? 'RENEWAL_FEE' : 'MEMBERSHIP_FEE';
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
        credit: payAmount,
        running_balance: 0,
        payment_method: pay.payment_method || 'ONLINE',
        received_from: pay.user?.full_name || 'Member',
        status: pay.payment_status || 'SUCCESS',
      });
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

      if (seenVouchers.has(key1) || seenVouchers.has(key2) || seenReferences.has(key2)) {
        return;
      }

      const renAmount = Number(ren.amount) || 0;
      const renDate = normalizeDate(ren.created_at);
      const memberName =
        ren.requested_by_user?.full_name ||
        ren.membership?.user?.full_name ||
        'Member';
      const cleanMember = cleanName(memberName);

      // Match against covered receipt vouchers
      const matchIndex = coveredReceipts.findIndex((rec) => {
        if (rec.used || !rec.isMembership) return false;

        if (Math.abs(rec.amount - renAmount) > 0.01) return false;

        if (rec.dateKey && renDate) {
          const diffMs = Math.abs(new Date(rec.dateKey).getTime() - new Date(renDate).getTime());
          if (!isNaN(diffMs) && diffMs > 86400000 * 2) {
            return false;
          }
        }

        if (key2 && (rec.reference_number.includes(key2) || rec.descriptionLower.includes(key2))) {
          return true;
        }

        const payerMatches =
          (cleanMember && rec.cleanPayer && (
            rec.cleanPayer.includes(cleanMember) ||
            cleanMember.includes(rec.cleanPayer)
          )) ||
          (memberName && rec.descriptionLower.includes(memberName.trim().toLowerCase())) ||
          (memberName && rec.rawPayer.includes(memberName.trim().toLowerCase()));

        return payerMatches;
      });

      if (matchIndex !== -1) {
        coveredReceipts[matchIndex].used = true;
        seenVouchers.add(key1);
        seenVouchers.add(key2);
        return;
      }

      seenVouchers.add(key1);
      seenVouchers.add(key2);
      const memberCat =
        ren.membership?.category?.name || 'Membership Renewal';

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
        credit: renAmount,
        running_balance: 0,
        payment_method: ren.payment_method || 'ONLINE',
        received_from: memberName,
        status: ren.payment_status || ren.status || 'SUCCESS',
      });
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

  // Calculate dynamic comparison with previous month
  let prevMonthCredit = 0;
  let prevMonthDebit = 0;
  if (fromDate) {
    const curFrom = new Date(fromDate);
    const prevYear = curFrom.getMonth() === 0 ? curFrom.getFullYear() - 1 : curFrom.getFullYear();
    const prevMonthIdx = curFrom.getMonth() === 0 ? 11 : curFrom.getMonth() - 1;
    const prevFrom = new Date(Date.UTC(prevYear, prevMonthIdx, 1)).toISOString().slice(0, 10);
    const prevTo = new Date(Date.UTC(prevYear, prevMonthIdx + 1, 0)).toISOString().slice(0, 10);

    rawList.forEach((t) => {
      const d = t.entry_date ? t.entry_date.slice(0, 10) : '';
      if (d >= prevFrom && d <= prevTo) {
        prevMonthCredit += Number(t.credit) || 0;
        prevMonthDebit += Number(t.debit) || 0;
      }
    });
  }

  let creditGrowthPct: number | undefined;
  if (prevMonthCredit > 0) {
    creditGrowthPct = Math.round(((totalCredit - prevMonthCredit) / prevMonthCredit) * 100);
  } else if (totalCredit > 0) {
    creditGrowthPct = 100;
  }

  let debitGrowthPct: number | undefined;
  if (prevMonthDebit > 0) {
    debitGrowthPct = Math.round(((totalDebit - prevMonthDebit) / prevMonthDebit) * 100);
  } else if (totalDebit > 0) {
    debitGrowthPct = 100;
  }

  // Newest first for passbook view
  const displayList = [...calculated].reverse();

  return {
    summary: {
      opening_balance: openingBalance,
      total_debit: totalDebit,
      total_credit: totalCredit,
      closing_balance: running,
      net_change: totalCredit - totalDebit,
      credit_growth_pct: creditGrowthPct,
      debit_growth_pct: debitGrowthPct,
      prev_month_credit: prevMonthCredit,
      prev_month_debit: prevMonthDebit,
    },
    transactions: displayList,
  };
};

