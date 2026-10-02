/**
 * TEMPORARY UI-PREVIEW DATA — visual development only.
 *
 * Used when the donations API is unreachable so the approved reference
 * design can be reviewed. This file is NOT part of the feature's
 * production data flow: remove it (and the preview fallback in
 * DonationsScreen) once auth + backend connectivity land.
 */
import { AdminColors, formatDate, formatDateTime } from '../../../../core';
import { DonationRowModel, DateRange } from '../types/donations.types';
import { donationStatusPresentation } from '../components/DonationStatusBadge';
import type { DonationStatItem } from '../components/DonationStats';

export type DonationPreviewTabKey = 'ALL' | 'ONE_TIME' | 'RECURRING' | 'OFFLINE';

export interface DonationPreviewRow {
  id: string;
  donor_name: string;
  donor_mobile: string;
  member_code: string | null;
  cause: string;
  description: string | null;
  amount: number;
  status: string;
  donation_type: Exclude<DonationPreviewTabKey, 'ALL'>;
  created_at: string;
  has_receipt: boolean;
}

const PREVIEW_DONATIONS: DonationPreviewRow[] = [
  {
    id: 'preview-don-1001',
    donor_name: 'Aman Shaikh',
    donor_mobile: '+91 98765 43210',
    member_code: 'MEM000123',
    cause: 'General Donation',
    description: 'Support for mission activities',
    amount: 10000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    created_at: '2026-09-28T11:24:00',
    has_receipt: true,
  },
  {
    id: 'preview-don-1002',
    donor_name: 'Saniya Khan',
    donor_mobile: '+91 98765 43211',
    member_code: 'MEM000124',
    cause: 'Education Support',
    description: 'Help for underprivileged students',
    amount: 5000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    created_at: '2026-09-27T16:15:00',
    has_receipt: true,
  },
  {
    id: 'preview-don-1003',
    donor_name: 'Rohit Verma',
    donor_mobile: '+91 98765 43212',
    member_code: 'MEM000125',
    cause: 'Medical Support',
    description: 'Support for medical treatment',
    amount: 25000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    created_at: '2026-09-26T14:40:00',
    has_receipt: true,
  },
  {
    id: 'preview-don-1004',
    donor_name: 'Faiza Ansari',
    donor_mobile: '+91 98765 43213',
    member_code: 'MEM000126',
    cause: 'General Donation',
    description: 'Support for mission activities',
    amount: 2000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    created_at: '2026-09-25T10:05:00',
    has_receipt: true,
  },
  {
    id: 'preview-don-1005',
    donor_name: 'Imran Qureshi',
    donor_mobile: '+91 98765 43214',
    member_code: 'MEM000127',
    cause: 'Relief Support',
    description: 'Support for disaster relief work',
    amount: 50000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    created_at: '2026-09-24T18:20:00',
    has_receipt: true,
  },
  {
    id: 'preview-don-1006',
    donor_name: 'Neha Kapoor',
    donor_mobile: '+91 98765 43215',
    member_code: 'MEM000128',
    cause: 'Recurring Donation',
    description: 'Monthly contribution (₹2,000/month)',
    amount: 2000,
    status: 'SUCCESS',
    donation_type: 'RECURRING',
    created_at: '2026-09-24T09:10:00',
    has_receipt: true,
  },
  {
    id: 'preview-don-1007',
    donor_name: 'Karan Mehta',
    donor_mobile: '+91 98765 43216',
    member_code: 'MEM000129',
    cause: 'Building Fund',
    description: 'Construction & infrastructure support',
    amount: 100000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    created_at: '2026-09-23T17:30:00',
    has_receipt: true,
  },
  {
    id: 'preview-don-1008',
    donor_name: 'Shabana Taj',
    donor_mobile: '+91 98765 43217',
    member_code: 'MEM000130',
    cause: 'Recurring Donation',
    description: 'Monthly contribution (₹1,000/month)',
    amount: 1000,
    status: 'SUCCESS',
    donation_type: 'RECURRING',
    created_at: '2026-09-22T11:12:00',
    has_receipt: true,
  },
];

let previewDonationsList: DonationPreviewRow[] = [
  ...PREVIEW_DONATIONS,
];

export const addPreviewDonation = (input: {
  donor_name: string;
  donor_mobile?: string;
  donor_email?: string;
  cause?: string;
  amount: number;
  is_anonymous?: boolean;
  remark?: string;
  donation_type?: 'ONE_TIME' | 'RECURRING' | 'OFFLINE';
}): DonationPreviewRow => {
  const newRow: DonationPreviewRow = {
    id: `preview-don-${Date.now()}`,
    donor_name: input.donor_name,
    donor_mobile: input.donor_mobile || '+91 98000 00000',
    member_code: `MEM${Math.floor(100000 + Math.random() * 900000)}`,
    cause: input.cause || 'General Donation',
    description: input.remark || 'Direct contribution',
    amount: input.amount,
    status: 'SUCCESS',
    donation_type: input.donation_type || 'ONE_TIME',
    created_at: new Date().toISOString(),
    has_receipt: true,
  };
  previewDonationsList = [newRow, ...previewDonationsList];
  return newRow;
};

const toPreviewRowModel = (row: DonationPreviewRow): DonationRowModel => {
  const presentation = donationStatusPresentation(row.status);
  return {
    id: row.id,
    donorName: row.donor_name,
    memberCode: row.member_code,
    phone: row.donor_mobile,
    donationTitle: row.cause,
    donationDescription: row.description,
    amount: row.amount,
    dateText: formatDate(row.created_at),
    timeText: formatDateTime(row.created_at).split(', ')[1] ?? null,
    statusLabel: presentation.label,
    statusTone: presentation.tone,
    hasReceipt: true,
    donationType: row.donation_type,
    rawStatus: row.status,
  };
};

export const getPreviewRowModels = (): DonationRowModel[] =>
  previewDonationsList.map(toPreviewRowModel);

export interface FilterPreviewParams {
  tab?: DonationPreviewTabKey | string;
  search?: string | null;
  status?: string | null;
  from?: string | null;
  to?: string | null;
}

export const filterPreviewRows = (
  tab: DonationPreviewTabKey,
): DonationRowModel[] =>
  filterPreviewRowsAdvanced({ tab });

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const normalizeMonthStr = (m?: string | null): string => {
  if (!m) return '';
  return m.toLowerCase().replace('sept', 'sep').trim();
};

export const getMonthYearString = (dateInput: string | Date): string => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * True when the given date falls inside the custom From–To range
 * (inclusive, date-level precision). `from`/`to` are YYYY-MM-DD strings.
 */
export const isWithinDateRange = (
  dateInput: string | Date,
  from?: string | null,
  to?: string | null,
): boolean => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return false;
  if (from) {
    const start = new Date(`${from}T00:00:00`);
    if (!isNaN(start.getTime()) && d < start) return false;
  }
  if (to) {
    const end = new Date(`${to}T23:59:59.999`);
    if (!isNaN(end.getTime()) && d > end) return false;
  }
  return true;
};

export const filterPreviewRowsAdvanced = (
  params: FilterPreviewParams,
): DonationRowModel[] => {
  let list = previewDonationsList;

  // 1. Tab filter
  if (params.tab && params.tab !== 'ALL') {
    list = list.filter(row => row.donation_type === params.tab);
  }

  // 2. Status filter
  if (params.status) {
    list = list.filter(
      row => row.status.toUpperCase() === params.status?.toUpperCase(),
    );
  }

  // 3. Custom date range filter (From – To)
  if (params.from || params.to) {
    list = list.filter(row =>
      isWithinDateRange(row.created_at, params.from, params.to),
    );
  }

  // 4. Search filter
  if (params.search && params.search.trim().length > 0) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(row => {
      const name = row.donor_name.toLowerCase();
      const phone = row.donor_mobile.toLowerCase();
      const code = (row.member_code ?? '').toLowerCase();
      const cause = row.cause.toLowerCase();
      const desc = (row.description ?? '').toLowerCase();
      const amountStr = String(row.amount);
      return (
        name.includes(q) ||
        phone.includes(q) ||
        code.includes(q) ||
        cause.includes(q) ||
        desc.includes(q) ||
        amountStr.includes(q)
      );
    });
  }

  return list.map(toPreviewRowModel);
};

export const getPreviewTabCounts = (
  dateRange?: DateRange | null,
): { all: number; oneTime: number; recurring: number; offline: number } => {
  let list = previewDonationsList;
  if (dateRange && (dateRange.from || dateRange.to)) {
    list = list.filter(row =>
      isWithinDateRange(row.created_at, dateRange.from, dateRange.to),
    );
  }
  return {
    all: list.length,
    oneTime: list.filter(r => r.donation_type === 'ONE_TIME').length,
    recurring: list.filter(r => r.donation_type === 'RECURRING').length,
    offline: list.filter(r => r.donation_type === 'OFFLINE').length,
  };
};

export const getPreviewStats = (
  dateRange?: DateRange | null,
): DonationStatItem[] => {
  let list = previewDonationsList;
  const hasRange = Boolean(dateRange && (dateRange.from || dateRange.to));
  if (hasRange && dateRange) {
    list = list.filter(row =>
      isWithinDateRange(row.created_at, dateRange.from, dateRange.to),
    );
  }

  const totalAmount = list.reduce((sum, r) => sum + r.amount, 0);
  const uniqueDonors = new Set(list.map(r => r.donor_mobile || r.donor_name)).size;
  const oneTimeAmount = list
    .filter(r => r.donation_type === 'ONE_TIME')
    .reduce((sum, r) => sum + r.amount, 0);
  const recurringAmount = list
    .filter(r => r.donation_type === 'RECURRING')
    .reduce((sum, r) => sum + r.amount, 0);

  const oneTimePct = totalAmount > 0 ? Math.round((oneTimeAmount / totalAmount) * 100) : 0;
  const recurringPct = totalAmount > 0 ? Math.round((recurringAmount / totalAmount) * 100) : 0;

  return [
    {
      id: 'total-donations',
      label: 'Total Donations',
      value: `₹${totalAmount.toLocaleString('en-IN')}`,
      supportText: hasRange ? 'In selected period' : '₹1,52,000 this month',
      indicator: '↑ 22%',
      icon: '💰',
      background: AdminColors.primaryLight,
    },
    {
      id: 'total-donors',
      label: 'Total Donors',
      value: String(uniqueDonors),
      supportText: hasRange ? 'In selected period' : '+28 this month',
      indicator: '↑ 18%',
      icon: '👥',
      background: AdminColors.statusActiveLight,
    },
    {
      id: 'one-time-donations',
      label: 'One-time Donations',
      value: `₹${oneTimeAmount.toLocaleString('en-IN')}`,
      supportText: `${oneTimePct}% of total`,
      icon: '⏰',
      background: AdminColors.accentGoldLight,
    },
    {
      id: 'recurring-donations',
      label: 'Recurring Donations',
      value: `₹${recurringAmount.toLocaleString('en-IN')}`,
      supportText: `${recurringPct}% of total`,
      icon: '🔄',
      background: '#F3E8FF',
    },
  ];
};

/** Reference statistics — preview values only. */
export const PREVIEW_STATS: DonationStatItem[] = [
  {
    id: 'total-donations',
    label: 'Total Donations',
    value: '₹8,45,000',
    supportText: '₹1,52,000 this month',
    indicator: '↑ 22%',
    icon: '💰',
    background: AdminColors.primaryLight,
  },
  {
    id: 'total-donors',
    label: 'Total Donors',
    value: '186',
    supportText: '+28 this month',
    indicator: '↑ 18%',
    icon: '👥',
    background: AdminColors.statusActiveLight,
  },
  {
    id: 'one-time-donations',
    label: 'One-time Donations',
    value: '₹6,20,000',
    supportText: '73% of total',
    icon: '⏰',
    background: AdminColors.accentGoldLight,
  },
  {
    id: 'recurring-donations',
    label: 'Recurring Donations',
    value: '₹2,25,000',
    supportText: '27% of total',
    icon: '🔄',
    // Light purple tint from the reference — no shared token exists yet.
    background: '#F3E8FF',
  },
];

export interface DonationPreviewTab {
  key: DonationPreviewTabKey;
  label: string;
  count: number;
}

export const PREVIEW_TABS: DonationPreviewTab[] = [
  { key: 'ALL', label: 'All', count: 186 },
  { key: 'ONE_TIME', label: 'One-time', count: 124 },
  { key: 'RECURRING', label: 'Recurring', count: 42 },
  { key: 'OFFLINE', label: 'Offline', count: 20 },
];