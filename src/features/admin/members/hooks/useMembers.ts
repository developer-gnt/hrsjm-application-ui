import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Member, MemberFilterTab, MemberSortOption, MemberStats } from '../types';
import { MEMBER_STATS, MOCK_MEMBERS } from '../data/members.mock';
import {
  matchesMemberFilterTab,
  matchesMemberSearch,
  sortMembers,
} from '../utils/members.utils';
import {
  BackendMembershipStatus,
  membersService,
  UpdateMembershipStatusPayload,
} from '../services/members.service';

export type MembersPreviewState = 'default' | 'loading' | 'empty' | 'error';

export interface TabCount {
  tab: MemberFilterTab;
  label: string;
  count: number;
}

export const MEMBERS_QUERY_KEYS = {
  all: ['memberships'] as const,
  list: (status?: string, search?: string) =>
    ['memberships', 'list', status ?? 'ALL', search ?? ''] as const,
  detail: (id: string) => ['memberships', 'detail', id] as const,
  stats: ['memberships', 'stats'] as const,
  categories: ['memberships', 'categories'] as const,
};

/**
 * Hook to fetch active membership categories.
 */
export const useMembershipCategories = () =>
  useQuery({
    queryKey: MEMBERS_QUERY_KEYS.categories,
    queryFn: () => membersService.getCategories(),
    staleTime: 60_000,
  });

/**
 * Mutation hook to create / register a new member.
 */
export const useCreateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof membersService.create>[0]) =>
      membersService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: MEMBERS_QUERY_KEYS.all,
      });
    },
  });
};

/**
 * Mutation hook to update a membership info / application data.
 */
export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof membersService.update>[1];
    }) => membersService.update(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: MEMBERS_QUERY_KEYS.all,
      });
      void queryClient.invalidateQueries({
        queryKey: MEMBERS_QUERY_KEYS.detail(variables.id),
      });
    },
  });
};

/**
 * Hook to fetch single membership details.
 */
export const useMemberDetails = (id?: string) =>
  useQuery({
    queryKey: MEMBERS_QUERY_KEYS.detail(id || ''),
    queryFn: () => (id ? membersService.getById(id) : null),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

/**
 * Hook to fetch uploaded documents for a membership.
 */
export const useMemberDocuments = (id?: string) =>
  useQuery({
    queryKey: ['memberships', 'documents', id || ''],
    queryFn: () => (id ? membersService.getDocuments(id) : null),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

/**
 * Mutation hook to update a membership status (Approve, Reject, Suspend, Activate).
 */
export const useUpdateMembershipStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMembershipStatusPayload;
    }) => membersService.updateStatus(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: MEMBERS_QUERY_KEYS.all,
      });
    },
  });
};

export const useMembers = (previewState: MembersPreviewState = 'default') => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MemberFilterTab>('ALL');
  const [sortOption, setSortOption] = useState<MemberSortOption>('default');
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());

  const queryClient = useQueryClient();

  // Determine backend status parameter if tab is filtered
  const apiStatusFilter = useMemo(() => {
    if (activeTab === 'ACTIVE') return 'ACTIVE';
    if (activeTab === 'PENDING') return 'PENDING';
    if (activeTab === 'INACTIVE') return 'SUSPENDED'; // or EXPIRED
    return undefined;
  }, [activeTab]);

  // Live Query from real backend API
  const isDevMockMode =
    previewState !== 'default' || process.env.NODE_ENV === 'test';

  const {
    data: queryData,
    isLoading: isQueryLoading,
    isError: isQueryError,
    refetch: refetchList,
    isRefetching,
  } = useQuery({
    queryKey: MEMBERS_QUERY_KEYS.list(undefined, searchQuery),
    queryFn: () =>
      membersService.list({
        search: searchQuery.trim() || undefined,
        page: 1,
        limit: 100,
      }),
    enabled: !isDevMockMode,
    staleTime: 30_000,
  });

  const {
    data: serverStats,
    refetch: refetchStats,
  } = useQuery({
    // Global KPI stats — always fetched without search so the header cards always
    // show aggregate totals across all members, not filtered by search term.
    queryKey: MEMBERS_QUERY_KEYS.stats,
    queryFn: () => membersService.getStats(),
    enabled: !isDevMockMode,
    staleTime: 30_000,
  });

  const refetch = useCallback(async () => {
    await Promise.all([refetchList(), refetchStats()]);
  }, [refetchList, refetchStats]);

  const isLoading =
    isDevMockMode ? previewState === 'loading' : isQueryLoading || isRefetching;
  const hasError = isDevMockMode ? previewState === 'error' : isQueryError;

  // Base member items
  const members = useMemo<Member[]>(() => {
    if (isDevMockMode) {
      return previewState === 'empty' ? [] : MOCK_MEMBERS;
    }
    return queryData?.items || [];
  }, [isDevMockMode, previewState, queryData]);

  // Aggregate stats — dynamically computed on search and filtering
  const stats = useMemo<MemberStats>(() => {
    if (isDevMockMode) {
      if (searchQuery.trim()) {
        const searched = MOCK_MEMBERS.filter(m => matchesMemberSearch(m, searchQuery));
        return {
          total: searched.length,
          active: searched.filter(m => m.status === 'ACTIVE').length,
          expiringSoon: searched.filter(m => m.status === 'EXPIRING_SOON').length,
          inactive: searched.filter(m => m.status === 'INACTIVE').length,
          pending: searched.filter(m => m.status === 'PENDING').length,
        };
      }
      return MEMBER_STATS;
    }

    const approvedMembers = members.filter(m => m.status !== 'PENDING');
    const localActive = approvedMembers.filter(m => m.status === 'ACTIVE').length;
    const localExpiring = approvedMembers.filter(m => m.status === 'EXPIRING_SOON').length;
    const localInactive = approvedMembers.filter(m => m.status === 'INACTIVE').length;
    const localTotal = approvedMembers.length;

    if (searchQuery.trim()) {
      const searched = approvedMembers.filter(m => matchesMemberSearch(m, searchQuery));
      return {
        total: searched.length,
        active: searched.filter(m => m.status === 'ACTIVE').length,
        expiringSoon: searched.filter(m => m.status === 'EXPIRING_SOON').length,
        inactive: searched.filter(m => m.status === 'INACTIVE').length,
      };
    }

    // serverStats comes from the dedicated /memberships/stats endpoint.
    // If the server stats are desynced (e.g. counting pending applications in total,
    // or missing inactive/blocked counts), sanitize against loaded approved members.
    if (serverStats) {
      const inactive = Math.max(serverStats.inactive ?? 0, localInactive);
      const active = Math.max(serverStats.active ?? 0, localActive);
      const expiringSoon = Math.max(serverStats.expiringSoon ?? 0, localExpiring);
      const validSum = active + expiringSoon + inactive;
      const total = serverStats.total === validSum ? serverStats.total : Math.max(validSum, localTotal);

      return {
        total,
        active,
        expiringSoon,
        inactive,
      };
    }

    return {
      total: localTotal,
      active: localActive,
      expiringSoon: localExpiring,
      inactive: localInactive,
    };
  }, [isDevMockMode, searchQuery, serverStats, members]);

  // Tab counts for UI filter badges
  const tabCounts = useMemo<TabCount[]>(
    () => [
      { tab: 'ALL', label: 'All', count: stats.total },
      { tab: 'ACTIVE', label: 'Active', count: stats.active },
      { tab: 'EXPIRING_SOON', label: 'Expiring Soon', count: stats.expiringSoon },
      { tab: 'INACTIVE', label: 'Blocked', count: stats.inactive },
    ],
    [stats]
  );

  // Filter and sort members for display
  // Only approved members (active, expiring soon, blocked/inactive) show in this directory.
  // Pending applications belong in the Applications section.
  const filteredMembers = useMemo(() => {
    if (isLoading || hasError) return [];
    const filtered = members.filter(
      member =>
        member.status !== 'PENDING' &&
        matchesMemberFilterTab(member, activeTab) &&
        matchesMemberSearch(member, searchQuery)
    );
    return sortMembers(filtered, sortOption);
  }, [members, activeTab, searchQuery, sortOption, isLoading, hasError]);

  const isSearchActive = searchQuery.trim().length > 0;
  const isFilterActive = activeTab !== 'ALL';
  const isEmptyList = !isLoading && !hasError && filteredMembers.length === 0;
  const isSearchNoResults = isEmptyList && isSearchActive;
  const isFilterNoResults = isEmptyList && !isSearchActive && isFilterActive;

  const setSearch = useCallback((query: string) => setSearchQuery(query), []);
  const setTab = useCallback((tab: MemberFilterTab) => {
    setActiveTab(tab);
    setSelectedIds(new Set());
  }, []);
  const setSort = useCallback((sort: MemberSortOption) => setSortOption(sort), []);

  const toggleMemberSelected = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size >= filteredMembers.length) return new Set();
      return new Set(filteredMembers.map(member => member.id));
    });
  }, [filteredMembers]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const retry = useCallback(() => {
    if (!isDevMockMode) {
      void refetch();
    }
  }, [isDevMockMode, refetch]);

  // Status mutation
  const updateStatusMutation = useUpdateMembershipStatus();

  const handleUpdateStatus = useCallback(
    async (id: string, status: BackendMembershipStatus, notes?: string) => {
      await updateStatusMutation.mutateAsync({
        id,
        payload: {
          status,
          admin_notes: notes,
        },
      });
    },
    [updateStatusMutation]
  );

  return {
    // data
    stats,
    tabCounts,
    filteredMembers,
    rawBackendList: queryData?.rawItems,
    // status flags
    isLoading,
    hasError,
    isEmptyList,
    isSearchNoResults,
    isFilterNoResults,
    // filters
    searchQuery,
    setSearch,
    activeTab,
    setTab,
    sortOption,
    setSort,
    // selection
    selectedIds,
    allSelected:
      filteredMembers.length > 0 && selectedIds.size >= filteredMembers.length,
    toggleMemberSelected,
    toggleSelectAll,
    clearSelection,
    // actions
    retry,
    handleUpdateStatus,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};

export default useMembers;
