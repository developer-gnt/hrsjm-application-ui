import { apiClient, ApiRoutes, PaginatedResponse } from '../../../../core';
import {
  CreateDonationInput,
  Donation,
  DonationListItem,
  DonationQuery,
  DonationReceiptModel,
} from '../types/donations.types';

/**
 * Donation feature service.
 * All HTTP access for donations goes through the shared API client.
 * Screens/hooks must never call axios directly.
 */
export const donationsService = {
  /**
   * GET /api/v1/donations — paginated donation list (requires donation.read).
   * Backend accepts only page, limit, status and search params.
   */
  async getDonations(
    query: DonationQuery = {},
  ): Promise<PaginatedResponse<DonationListItem>> {
    const params: Record<string, string | number> = {};

    if (query.page !== undefined) {
      params.page = query.page;
    }
    if (query.limit !== undefined) {
      params.limit = query.limit;
    }
    if (query.status) {
      params.status = query.status;
    }
    if (query.search && query.search.trim().length > 0) {
      params.search = query.search.trim();
    }

    const response = await apiClient.get<PaginatedResponse<Donation>>(
      ApiRoutes.DONATIONS.BASE,
      { params },
    );

    return response.data;
  },

  /**
   * GET /api/v1/donations/:id — single donation record
   */
  async getDonationById(id: string): Promise<Donation> {
    const response = await apiClient.get<Donation>(
      `${ApiRoutes.DONATIONS.BASE}/${id}`,
    );
    return response.data;
  },

  /**
   * POST /api/v1/donations — create a donation record
   */
  async createDonation(input: CreateDonationInput): Promise<Donation> {
    const payload: Record<string, any> = {
      donor_name: input.donor_name.trim(),
      amount: Number(input.amount),
    };

    if (input.donor_mobile && input.donor_mobile.trim()) {
      payload.donor_mobile = input.donor_mobile.trim();
    }
    if (input.donor_email && input.donor_email.trim()) {
      payload.donor_email = input.donor_email.trim();
    }
    if (input.cause && input.cause.trim()) {
      payload.cause = input.cause.trim();
    }
    if (input.remark && input.remark.trim()) {
      payload.remark = input.remark.trim();
    }
    if (input.is_anonymous !== undefined) {
      payload.is_anonymous = input.is_anonymous;
    }

    const response = await apiClient.post<Donation>(
      ApiRoutes.DONATIONS.BASE,
      payload,
    );
    return response.data;
  },

  /**
   * POST /api/v1/donations/:id/refund — refund a donation
   */
  async refundDonation(
    id: string,
    reason: string = 'Admin initiated refund',
  ): Promise<any> {
    const response = await apiClient.post(
      `${ApiRoutes.DONATIONS.BASE}/${id}/refund`,
      { reason },
    );
    return response.data;
  },

  /**
   * GET /api/v1/receipts/donation/:id — fetch receipt by donation ID
   * Falls back to donation details if receipt endpoint is not yet generated.
   */
  async getReceiptByDonationId(id: string): Promise<DonationReceiptModel> {
    try {
      const response = await apiClient.get<any>(
        `/receipts/donation/${id}`,
      );
      const data = response.data;
      if (data && data.receipt_number) {
        return {
          id: data.id || id,
          receiptNumber: data.receipt_number,
          receiptDate: data.receipt_date || new Date().toISOString(),
          donorName: data.issued_to || data.user?.full_name || 'Donor',
          donorMobile: data.user?.mobile_number || null,
          donorEmail: data.user?.email || null,
          memberCode: null,
          cause: 'Donation Contribution',
          amount: data.amount,
          paymentMethod: data.payment_method || 'Online',
          status: 'SUCCESS',
          notes: data.notes || null,
        };
      }
    } catch {
      // Fallback to donation details
    }

    const donation = await this.getDonationById(id);
    return {
      id: donation.id,
      receiptNumber: `RCP-DON-${donation.id.slice(0, 8).toUpperCase()}`,
      receiptDate: donation.created_at,
      donorName: donation.donor_name,
      donorMobile: donation.donor_mobile,
      donorEmail: donation.donor_email,
      memberCode: null,
      cause: donation.cause || 'General Donation',
      amount: donation.amount,
      paymentMethod: 'Direct Payment',
      status: donation.status,
      notes: donation.remark,
    };
  },
};