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
};

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
    if (activeTab === 'INACTIVE') return 'SUSPENDED'; // or EXPIRED
    return undefined;
  }, [activeTab]);

  // Live Query from real backend API
  const isDevMockMode = previewState !== 'default';

  const {
    data: queryData,
    isLoading: isQueryLoading,
    isError: isQueryError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: MEMBERS_QUERY_KEYS.list(apiStatusFilter, searchQuery),
    queryFn: () =>
      membersService.list({
        search: searchQuery.trim() || undefined,
        status: apiStatusFilter,
        page: 1,
        limit: 100,
      }),
    enabled: !isDevMockMode,
    staleTime: 30_000,
  });

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

  // Aggregate stats
  const stats = useMemo<MemberStats>(() => {
    if (isDevMockMode) {
      return MEMBER_STATS;
    }
    if (queryData?.stats) {
      return queryData.stats;
    }
    return {
      total: members.length,
      active: members.filter(m => m.status === 'ACTIVE').length,
      expiringSoon: members.filter(m => m.status === 'EXPIRING_SOON').length,
      inactive: members.filter(m => m.status === 'INACTIVE').length,
    };
  }, [isDevMockMode, queryData, members]);

  // Tab counts for UI filter badges
  const tabCounts = useMemo<TabCount[]>(
    () => [
      { tab: 'ALL', label: 'All', count: stats.total },
      { tab: 'ACTIVE', label: 'Active', count: stats.active },
      { tab: 'EXPIRING_SOON', label: 'Expiring Soon', count: stats.expiringSoon },
      { tab: 'INACTIVE', label: 'Inactive', count: stats.inactive },
    ],
    [stats]
  );

  // Filter and sort members for display
  const filteredMembers = useMemo(() => {
    if (isLoading || hasError) return [];
    const filtered = members.filter(
      member =>
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
