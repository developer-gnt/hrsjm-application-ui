/**
 * Donation feature types.
 *
 * Field names mirror the HRSJM backend entities exactly
 * (HRSJM-back-api: modules/donations/entities/donation.entity.ts).
 * Do not rename backend fields here; apply view-model mapping in
 * components only when genuinely needed.
 */
import type { BadgeStatus } from '../../../../core';

/**
 * Status values the backend actually assigns to donations
 * (plain varchar column — no backend enum class exists).
 */
export const DONATION_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] as const;

export type DonationStatus = (typeof DONATION_STATUSES)[number];

/** Donation entity as returned by GET /api/v1/donations. */
export interface Donation {
  id: string;
  donor_name: string;
  donor_mobile: string;
  donor_email: string | null;
  cause: string;
  amount: number;
  status: string;
  remark: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

/** Donation row as rendered in the donations list. */
export type DonationListItem = Donation;

/** Query params accepted by GET /api/v1/donations (ListDonationsDto). */
export interface DonationQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export type DonationCategory = 'ALL' | 'ONE_TIME' | 'RECURRING' | 'OFFLINE';

/** Custom date-range filter (YYYY-MM-DD bounds; null = unbounded). */
export interface DateRange {
  from: string | null;
  to: string | null;
}

/** Input for creating a new donation (matching CreateDonationDto) */
export interface CreateDonationInput {
  donor_name: string;
  donor_mobile?: string;
  donor_email?: string;
  cause?: string;
  amount: number;
  is_anonymous?: boolean;
  remark?: string;
  donation_type?: 'ONE_TIME' | 'RECURRING' | 'OFFLINE';
}

/** Receipt details view-model */
export interface DonationReceiptModel {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  donorName: string;
  donorMobile?: string | null;
  donorEmail?: string | null;
  memberCode?: string | null;
  cause: string;
  amount: number;
  paymentMethod: string;
  status: string;
  notes?: string | null;
}

/**
 * Explicit view-model for donation rows. Built from backend donation
 * entities (or preview rows); fields the backend does
 * not provide stay empty so the UI never fabricates data.
 */
export interface DonationRowModel {
  id: string;
  donorName: string;
  memberCode?: string | null;
  phone?: string | null;
  donationTitle: string;
  donationDescription?: string | null;
  amount: number;
  dateText: string;
  timeText?: string | null;
  statusLabel: string;
  statusTone: BadgeStatus;
  hasReceipt: boolean;
  donationType?: 'ONE_TIME' | 'RECURRING' | 'OFFLINE';
  rawStatus?: string;
  rawDonation?: Donation;
}