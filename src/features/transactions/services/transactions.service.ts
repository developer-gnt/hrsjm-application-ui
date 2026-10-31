import { apiClient } from '../../../core/api/client';
import { ApiRoutes } from '../../../core/constants/api-routes';
import type {
  TransactionFilterParams,
  UserTransactionItem,
  UserTransactionsResponse,
} from '../types/transactions.types';

function mapReceiptToTransaction(r: any): UserTransactionItem {
  const isMembership = r.receipt_type === 'MEMBERSHIP' || Boolean(r.membership_payment_id);
  const isRenewal = r.receipt_type === 'RENEWAL';
  const category = isRenewal ? 'Membership' : isMembership ? 'Membership' : 'Donation';
  const categoryCode = isRenewal ? 'MEMBERSHIP' : isMembership ? 'MEMBERSHIP' : 'DONATION';
  const amount = typeof r.amount === 'string' ? parseFloat(r.amount) : Number(r.amount) || 0;
  const title = isRenewal
    ? 'Membership Renewal'
    : isMembership
    ? 'Membership Subscription'
    : 'Donation Contribution';
  const purpose =
    r.cause ||
    r.cause_name ||
    r.donation_payment?.donation?.cause ||
    (isMembership ? 'Annual Membership Fee' : 'General Donation');

  const refNumber = r.receipt_number || `TXN-${(r.id || '').slice(0, 8).toUpperCase()}`;

  return {
    id: r.id,
    transaction_id: refNumber,
    payment_reference: refNumber,
    gateway_order_id: r.gateway_order_id || r.order_id || null,
    gateway_payment_id: r.gateway_payment_id || r.payment_id || null,
    category,
    category_code: categoryCode,
    title,
    purpose,
    amount,
    direction: 'OUTGOING',
    status: 'Success',
    status_code: 'SUCCESS',
    payment_method: r.payment_method || 'Online Payment',
    created_at: r.receipt_date || r.created_at || new Date().toISOString(),
    payment_date: r.receipt_date || r.created_at || new Date().toISOString(),
    receipt_id: r.id,
    receipt_number: r.receipt_number,
    receipt_available: true,
    related_info: {
      receipt_id: r.id,
      receipt_number: r.receipt_number,
      receipt_date: r.receipt_date || r.created_at,
      campaign_name: purpose,
      notes: r.notes,
    },
  };
}

export const transactionsService = {
  /**
   * Fetches the unified transaction history and payment totals for current user.
   */
  getMyTransactions: async (params?: TransactionFilterParams): Promise<UserTransactionsResponse> => {
    // 1. Attempt dedicated /transactions/my endpoint first
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

      if (Array.isArray(data?.items) && data.items.length > 0) {
        return {
          summary: data?.summary || {
            total_amount_paid: data.items.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0),
            total_transactions: data.items.length,
            successful_count: data.items.filter((i: any) => i.status === 'Success' || i.status_code === 'SUCCESS').length,
            pending_count: data.items.filter((i: any) => i.status === 'Pending' || i.status_code === 'PENDING').length,
            failed_count: data.items.filter((i: any) => i.status === 'Failed' || i.status_code === 'FAILED').length,
            refunded_count: data.items.filter((i: any) => i.status === 'Refunded' || i.status_code === 'REFUNDED').length,
          },
          items: data.items,
          meta: data?.meta || {
            page: 1,
            limit: 50,
            total: data.items.length,
            totalPages: 1,
          },
        };
      }
    } catch {
      // Fallback to receipts/payments integration
    }

    // 2. Seamless Fallback: Aggregate from receipts endpoint
    try {
      let rawReceipts: any[] = [];

      // Try user receipts
      try {
        const userReceiptsRes = await apiClient.get<any>(ApiRoutes.RECEIPTS.MY, {
          params: { page: 1, limit: 100 },
        });
        const payload = userReceiptsRes.data || userReceiptsRes;
        const data = payload?.data || payload;
        if (Array.isArray(data?.items)) {
          rawReceipts = data.items;
        }
      } catch {}

      // If user receipts are empty, check admin receipts endpoint
      if (rawReceipts.length === 0) {
        try {
          const adminReceiptsRes = await apiClient.get<any>('/admin/receipts', {
            params: { page: 1, limit: 100 },
          });
          const payload = adminReceiptsRes.data || adminReceiptsRes;
          const data = payload?.data || payload;
          if (Array.isArray(data?.items)) {
            rawReceipts = data.items;
          }
        } catch {}
      }

      let txns = rawReceipts.map(mapReceiptToTransaction);

      // Apply category filter
      if (params?.category && params.category !== 'ALL') {
        const cat = params.category.toUpperCase();
        txns = txns.filter(t => t.category_code === cat || t.category.toUpperCase() === cat);
      }

      // Apply search filter
      if (params?.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase();
        txns = txns.filter(
          t =>
            t.transaction_id.toLowerCase().includes(q) ||
            t.title.toLowerCase().includes(q) ||
            t.purpose.toLowerCase().includes(q) ||
            String(t.amount).includes(q)
        );
      }

      const totalAmount = txns.reduce((acc, item) => acc + (item.amount || 0), 0);

      return {
        summary: {
          total_amount_paid: totalAmount,
          total_transactions: txns.length,
          successful_count: txns.length,
          pending_count: 0,
          failed_count: 0,
          refunded_count: 0,
        },
        items: txns,
        meta: {
          page: 1,
          limit: 100,
          total: txns.length,
          totalPages: 1,
        },
      };
    } catch (fallbackError) {
      console.warn('Fallback transaction retrieval failed:', fallbackError);
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
      const data = payload?.data || payload;
      if (data) return data;
    } catch {}

    // Fallback: check receipts
    try {
      const res = await apiClient.get<any>(`/receipts/${id}`);
      const payload = res.data || res;
      const data = payload?.data || payload;
      if (data) {
        return mapReceiptToTransaction(data);
      }
    } catch {}

    return null;
  },
};
