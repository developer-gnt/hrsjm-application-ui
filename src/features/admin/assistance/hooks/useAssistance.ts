import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '../../../../core/api/client';
import { assistanceService } from '../services/assistance.service';
import type {
  AssistanceFilterState,
  AssistanceQuery,
  AssistanceRequest,
  CreateAssistanceRequestPayload,
  UpdateAssistanceStatusBody,
} from '../types/assistance.types';
import {
  matchesSearch,
  tabToStatus,
  type AssistanceTabKey,
} from '../assistance.utils';

export interface AssistanceStats {
  total: number;
  underReview: number;
  approved: number;
  rejected: number;
}

export const ASSISTANCE_QUERY_KEYS = {
  all: ['assistance-requests'] as const,
  list: (status?: string, search?: string, filters?: AssistanceFilterState) =>
    ['assistance-requests', 'list', status ?? 'ALL', search ?? '', filters ?? {}] as const,
  stats: (filters?: AssistanceFilterState) =>
    ['assistance-requests', 'stats', filters ?? {}] as const,
  detail: (id: string) => ['assistance-requests', 'detail', id] as const,
  documents: (id: string) => ['assistance-requests', 'documents', id] as const,
};

export const useCreateAssistanceRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssistanceRequestPayload) =>
      assistanceService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSISTANCE_QUERY_KEYS.all });
    },
  });
};

export const useUpdateAssistanceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAssistanceStatusBody }) =>
      assistanceService.updateStatus(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSISTANCE_QUERY_KEYS.all });
    },
  });
};

export function useAssistance() {
  const [activeTab, setActiveTab] = useState<AssistanceTabKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<AssistanceFilterState>({});

  const queryClient = useQueryClient();
  const createMutation = useCreateAssistanceRequest();

  // Effective status from active tab or filterState
  const statusFilter = useMemo(() => {
    if (filterState.status) {
      return filterState.status;
    }
    return tabToStatus(activeTab);
  }, [activeTab, filterState.status]);

  // Live Query from backend API
  const {
    data: listData,
    isLoading: isListLoading,
    isRefetching,
    error: queryError,
    refetch: refetchList,
  } = useQuery({
    queryKey: ASSISTANCE_QUERY_KEYS.list(statusFilter, searchQuery, filterState),
    queryFn: () => {
      const q: AssistanceQuery = {
        status: statusFilter,
        search: searchQuery.trim() || undefined,
        category: filterState.category,
        min_amount: filterState.minAmount,
        max_amount: filterState.maxAmount,
        from_date: filterState.fromDate,
        to_date: filterState.toDate,
        page: 1,
        limit: 100,
      };
      return assistanceService.list(q);
    },
    staleTime: 30_000,
  });

  // Summary stats query with matching filters
  const {
    data: statsSummary,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ASSISTANCE_QUERY_KEYS.stats(filterState),
    queryFn: () => {
      const q: AssistanceQuery = {
        category: filterState.category,
        min_amount: filterState.minAmount,
        max_amount: filterState.maxAmount,
        from_date: filterState.fromDate,
        to_date: filterState.toDate,
      };
      return assistanceService.getStatsSummary(q);
    },
    staleTime: 30_000,
  });

  const rawItems = useMemo(() => listData?.items ?? [], [listData?.items]);

  // Client-side quick filter matching
  const filteredItems = useMemo(() => {
    return rawItems.filter(item => {
      // Search matching
      if (!matchesSearch(item, searchQuery)) return false;

      // Category matching
      if (filterState.category) {
        const catLower = filterState.category.toLowerCase();
        if (!item.reason.toLowerCase().includes(catLower)) return false;
      }

      // Min amount matching
      if (filterState.minAmount !== undefined) {
        if (item.requested_amount < filterState.minAmount) return false;
      }

      // Max amount matching
      if (filterState.maxAmount !== undefined) {
        if (item.requested_amount > filterState.maxAmount) return false;
      }

      return true;
    });
  }, [rawItems, searchQuery, filterState]);

  const baselineStats = useMemo<AssistanceStats>(() => {
    if (statsSummary) {
      return {
        total: statsSummary.total,
        underReview: statsSummary.underReview,
        approved: statsSummary.approved,
        rejected: statsSummary.rejected,
      };
    }
    return {
      total: rawItems.length,
      underReview: rawItems.filter(
        i => i.status === 'UNDER_REVIEW' || i.status === 'PENDING',
      ).length,
      approved: rawItems.filter(i => i.status === 'APPROVED').length,
      rejected: rawItems.filter(i => i.status === 'REJECTED').length,
    };
  }, [statsSummary, rawItems]);

  // Dynamic KPI stats: connected live with active search & filters
  const dynamicStats = useMemo<AssistanceStats>(() => {
    const hasActiveFilters =
      Boolean(searchQuery.trim()) ||
      Boolean(filterState.category) ||
      filterState.minAmount !== undefined ||
      filterState.maxAmount !== undefined ||
      Boolean(filterState.fromDate);

    if (!hasActiveFilters) {
      return baselineStats;
    }

    const total = filteredItems.length;
    let underReview = 0;
    let approved = 0;
    let rejected = 0;

    filteredItems.forEach(item => {
      if (item.status === 'UNDER_REVIEW' || item.status === 'PENDING') underReview++;
      else if (item.status === 'APPROVED') approved++;
      else if (item.status === 'REJECTED') rejected++;
    });

    return { total, underReview, approved, rejected };
  }, [searchQuery, filterState, filteredItems, baselineStats]);

  const refresh = useCallback(async () => {
    await Promise.all([refetchList(), refetchStats()]);
  }, [refetchList, refetchStats]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveTab('ALL');
    setFilterState({});
  }, []);

  const applyFilters = useCallback((newFilters: AssistanceFilterState) => {
    setFilterState(newFilters);
    if (newFilters.status) {
      setActiveTab(newFilters.status as AssistanceTabKey);
    }
  }, []);

  const createRequest = useCallback(
    async (payload: CreateAssistanceRequestPayload) => {
      return createMutation.mutateAsync(payload);
    },
    [createMutation],
  );

  return {
    filteredItems,
    totalCount: listData?.meta.total ?? rawItems.length,
    stats: dynamicStats,
    rawStats: baselineStats,
    statsLoading: isStatsLoading && !statsSummary,
    activeTab,
    searchQuery,
    filterState,
    initialLoading: isListLoading,
    refreshing: isRefetching,
    loadingMore: false,
    error: queryError
      ? getApiErrorMessage(queryError, 'Unable to load assistance requests.')
      : null,
    hasMore: false,
    setSearchQuery,
    setActiveTab,
    applyFilters,
    refresh,
    loadMore: () => {},
    clearFilters,
    createRequest,
  };
}
