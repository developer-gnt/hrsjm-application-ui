import { apiClient } from '../../../core/api/client';
import { ApiRoutes } from '../../../core/constants/api-routes';
import { amountToWords } from '../../../core/utils/format';
import type { DonationRecord, ReceiptType } from '../../donations/types/donation.types';

export interface BackendReceiptItem {
  id: string;
  receipt_number: string;
  receipt_date: string;
  user_id: string;
  membership_payment_id: string | null;
  donation_payment_id: string | null;
  amount: number | string;
  payment_method: string;
  receipt_type: 'MEMBERSHIP' | 'DONATION' | 'RENEWAL' | string;
  issued_to: string;
  notes: string | null;
  cause?: string | null;
  cause_name?: string | null;
  created_at: string;
  donation_payment?: {
    id: string;
    donation?: {
      id: string;
      cause?: string;
      title?: string;
    };
  };
  membership_payment?: {
    id: string;
    membership?: {
      id: string;
      category?: {
        name: string;
      };
    };
  };
  user?: {
    id: string;
    full_name: string;
    email: string | null;
    mobile_number: string | null;
  };
}

export interface BackendReceiptsListResponse {
  items: BackendReceiptItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Format date for display in receipt cards and details
 */
function formatDateDetails(dateString: string) {
  const d = new Date(dateString);
  const isoDate = d.toISOString().split('T')[0];
  const date = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const dateTime = `${date}, ${time}`;
  return { isoDate, date, time, dateTime };
}

/**
 * Maps a backend receipt entity to the DonationRecord structure expected by UI components.
 */
export function mapBackendReceiptToRecord(item: BackendReceiptItem): DonationRecord {
  const isRenewal = item.receipt_type === 'RENEWAL';
  const isMembership = item.receipt_type === 'MEMBERSHIP';
  const type: ReceiptType = isRenewal ? 'Renewal' : isMembership ? 'Membership' : 'Donation';
  const { isoDate, date, time, dateTime } = formatDateDetails(item.receipt_date || item.created_at);
  const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
  const amountInWords = amountToWords(amount || 0);

  const title = isRenewal
    ? 'Membership Renewal'
    : isMembership
    ? 'Membership Subscription'
    : 'Donation Contribution';

  const defaultCause = isRenewal
    ? 'Membership Renewal Fee'
    : isMembership
    ? 'Annual Membership Fee'
    : 'General Donation';

  const resolvedCause =
    item.cause ||
    item.cause_name ||
    item.donation_payment?.donation?.cause ||
    (isMembership ? item.membership_payment?.membership?.category?.name : undefined) ||
    (item.notes &&
     !item.notes.toLowerCase().startsWith('payment verified') &&
     !item.notes.toLowerCase().startsWith('donation payment verified')
      ? item.notes
      : undefined) ||
    defaultCause;

  return {
    id: item.id,
    receiptNo: item.receipt_number,
    type,
    title,
    cause: resolvedCause,
    category: isRenewal ? 'Renewal' : isMembership ? 'Membership' : 'Donation',
    description: resolvedCause || item.notes || (isRenewal ? 'Official HRSJM renewal receipt' : isMembership ? 'Official HRSJM membership receipt' : 'Official HRSJM 80G donation receipt'),
    amount: amount || 0,
    amountInWords,
    date,
    time,
    dateTime,
    isoDate,
    status: 'Completed',
    paymentMethod: item.payment_method || 'Online',
    transactionId: item.membership_payment_id || item.donation_payment_id || item.id,
    donorName: item.issued_to || item.user?.full_name || 'HRSJM Member',
    donorEmail: item.user?.email || undefined,
    donorPhone: item.user?.mobile_number || undefined,
    imageType: isMembership ? 'membership' : 'education',
  };
}

export const receiptsService = {
  /**
   * Fetches only the currently logged-in user's receipts from the database
   */
  getMyReceipts: async (params?: { page?: number; limit?: number; type?: string }): Promise<DonationRecord[]> => {
    try {
      const response = await apiClient.get<BackendReceiptsListResponse>(ApiRoutes.RECEIPTS.MY, {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 50,
          type: params?.type,
        },
      });

      const payload = response.data || (response as any);
      const items = (payload as any)?.items || (Array.isArray(payload) ? payload : []);
      return items.map(mapBackendReceiptToRecord);
    } catch (error) {
      console.warn('Failed to load user receipts from backend:', error);
      return [];
    }
  },

  /**
   * Fetches a specific receipt by ID or Receipt Number
   */
  getReceiptById: async (idOrNumber: string): Promise<DonationRecord | null> => {
    try {
      const response = await apiClient.get<BackendReceiptItem>(ApiRoutes.RECEIPTS.ITEM(idOrNumber));
      const payload = response.data || (response as any);
      const item = (payload as any)?.id ? payload : (payload as any)?.data;
      if (item) {
        return mapBackendReceiptToRecord(item);
      }
      return null;
    } catch (error) {
      console.warn(`Failed to fetch receipt ${idOrNumber}:`, error);
      return null;
    }
  },
};
