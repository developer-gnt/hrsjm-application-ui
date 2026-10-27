import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  AdminColors,
} from '../../../../core';
import { donationsService } from '../services/donations.service';
import {
  CreateDonationInput,
  Donation,
  DonationCategory,
  DonationListItem,
  DonationSource,
  DonationStatus,
  DateRange,
} from '../types/donations.types';
import {
  isWithinDateRange,
} from '../services/donations.preview';
import type { DonationStatItem } from '../components/DonationStats';

const DONATIONS_PAGE_SIZE = 20;

export interface UseDonationsParams {
  search?: string | null;
  status?: DonationStatus | null;
  category?: DonationCategory | null;
  dateRange?: DateRange | null;
  source?: string | null;
}

/** Inactive categories or types are classified based on cause and remarks */
export const inferDonationType = (
  donation: Donation,
): 'ONE_TIME' | 'RECURRING' | 'OFFLINE' => {
  const text = `${donation.cause || ''} ${donation.remark || ''}`.toLowerCase();
  if (text.includes('recurring') || text.includes('monthly') || text.includes('subscription')) {
    return 'RECURRING';
  }
  if (text.includes('offline') || text.includes('cash') || text.includes('cheque') || text.includes('dd')) {
    return 'OFFLINE';
  }
  return 'ONE_TIME';
};

/** Inactive or unstated sources are classified based on source field and remarks */
export const inferDonationSource = (donation: Donation): DonationSource => {
  if (donation.source) {
    const s = donation.source.toLowerCase();
    if (s.includes('web app')) return 'Web App';
    if (s.includes('application') || s.includes('app ui') || s.includes('mobile')) return 'Application UI';
    return 'Website';
  }
  const text = `${donation.cause || ''} ${donation.remark || ''}`.toLowerCase();
  if (text.includes('web app')) return 'Web App';
  if (text.includes('application') || text.includes('app ui') || text.includes('mobile')) return 'Application UI';
  return 'Website';
};

/**
 * Server state for the paginated donation list.
 * Handles append pages, pull-to-refresh, client-side category/date-range/search filtering,
 * and deduplication.
 */
export const useDonations = ({
  search,
  status,
  category,
  dateRange,
  source,
}: UseDonationsParams) => {
  const query = useInfiniteQuery({
    queryKey: [
      'donations',
      'list',
      { search: search ?? '', status: status ?? 'ALL', source: source ?? 'ALL' },
    ],
    queryFn: ({ pageParam }) =>
      donationsService.getDonations({
        page: pageParam as number,
        limit: DONATIONS_PAGE_SIZE,
        status: status ?? undefined,
        search: search ?? undefined,
        source: source && source !== 'ALL' ? source : undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      const meta = lastPage.meta;
      if (!meta || meta.page >= meta.totalPages) {
        return undefined;
      }
      return meta.page + 1;
    },
    placeholderData: keepPreviousData,
  });

  // Flatten pages, dropping duplicate ids
  const rawDonations: DonationListItem[] = [];
  const seenIds = new Set<string>();
  for (const page of query.data?.pages ?? []) {
    for (const item of page.items ?? []) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        rawDonations.push(item);
      }
    }
  }

  // Filter combined conditions (category, date range, source, and fine search)
  const donations = rawDonations.filter(item => {
    const itemType = inferDonationType(item);
    const itemSource = inferDonationSource(item);

    // Category tab filter
    if (category && category !== 'ALL' && itemType !== category) {
      return false;
    }

    // Source platform filter
    if (source && source !== 'ALL' && itemSource.toLowerCase() !== source.toLowerCase()) {
      return false;
    }

    // Custom date range filter (From – To)
    if (dateRange && (dateRange.from || dateRange.to)) {
      if (!isWithinDateRange(item.created_at, dateRange.from, dateRange.to)) {
        return false;
      }
    }

    // Fine-grained client search (for amount, mobile, ID, source, etc.)
    if (search && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      const name = (item.donor_name || '').toLowerCase();
      const mobile = (item.donor_mobile || '').toLowerCase();
      const cause = (item.cause || '').toLowerCase();
      const remark = (item.remark || '').toLowerCase();
      const src = itemSource.toLowerCase();
      const amountStr = String(item.amount);
      const idStr = item.id.toLowerCase();
      const match =
        name.includes(q) ||
        mobile.includes(q) ||
        cause.includes(q) ||
        remark.includes(q) ||
        src.includes(q) ||
        amountStr.includes(q) ||
        idStr.includes(q);
      if (!match) return false;
    }

    return true;
  });

  return {
    donations,
    rawDonations,
    total: donations.length,
    backendTotal: query.data?.pages?.[0]?.meta?.total ?? 0,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching && !query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
  };
};

export const useCreateDonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDonationInput) =>
      donationsService.createDonation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
};

export const useRefundDonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      donationsService.refundDonation(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
};

export const useDonationReceipt = (donationId: string | null) => {
  return useQuery({
    queryKey: ['donations', 'receipt', donationId],
    queryFn: () =>
      donationId ? donationsService.getReceiptByDonationId(donationId) : null,
    enabled: Boolean(donationId),
  });
};

export interface LiveCategoryCounts {
  all: number;
  oneTime: number;
  recurring: number;
  offline: number;
}

export const computeLiveStats = (
  items: DonationListItem[],
  dateRange?: DateRange | null,
): { stats: DonationStatItem[]; counts: LiveCategoryCounts } => {
  let list = items;
  const hasRange = Boolean(dateRange && (dateRange.from || dateRange.to));
  if (hasRange && dateRange) {
    list = list.filter(item =>
      isWithinDateRange(item.created_at, dateRange.from, dateRange.to),
    );
  }

  let oneTimeAmount = 0;
  let recurringAmount = 0;
  let totalAmount = 0;
  let oneTimeCount = 0;
  let recurringCount = 0;
  let offlineCount = 0;
  const uniqueDonors = new Set<string>();

  for (const item of list) {
    const amt = Number(item.amount) || 0;
    totalAmount += amt;
    uniqueDonors.add(item.donor_mobile || item.donor_name);

    const type = inferDonationType(item);
    if (type === 'ONE_TIME') {
      oneTimeAmount += amt;
      oneTimeCount++;
    } else if (type === 'RECURRING') {
      recurringAmount += amt;
      recurringCount++;
    } else {
      offlineCount++;
    }
  }

  const oneTimePct =
    totalAmount > 0 ? Math.round((oneTimeAmount / totalAmount) * 100) : 0;
  const recurringPct =
    totalAmount > 0 ? Math.round((recurringAmount / totalAmount) * 100) : 0;

  const stats: DonationStatItem[] = [
    {
      id: 'total-donations',
      label: 'Total Donations',
      value: `₹${totalAmount.toLocaleString('en-IN')}`,
      supportText: hasRange ? 'In selected period' : '+22% this month',
      tone: 'navy',
      background: AdminColors.primaryLight,
    },
    {
      id: 'total-donors',
      label: 'Total Donors',
      value: String(uniqueDonors.size),
      supportText: hasRange ? 'In selected period' : '+18% this month',
      tone: 'warning',
      background: AdminColors.warningLight,
    },
    {
      id: 'one-time-donations',
      label: 'One-time Donations',
      value: `₹${oneTimeAmount.toLocaleString('en-IN')}`,
      supportText: hasRange ? `${oneTimePct}% of total` : `${oneTimePct}% of total`,
      tone: 'success',
      background: AdminColors.successLight,
    },
    {
      id: 'recurring-donations',
      label: 'Recurring Donations',
      value: `₹${recurringAmount.toLocaleString('en-IN')}`,
      supportText: hasRange ? `${recurringPct}% of total` : `${recurringPct}% of total`,
      tone: 'gold',
      background: AdminColors.accentGoldLight,
    },
  ];

  const counts: LiveCategoryCounts = {
    all: list.length,
    oneTime: oneTimeCount,
    recurring: recurringCount,
    offline: offlineCount,
  };

  return { stats, counts };
};