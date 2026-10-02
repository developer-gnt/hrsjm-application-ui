import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Member, MemberFilterTab, MemberSortOption } from '../types';
import { MEMBER_STATS, MOCK_MEMBERS } from '../data/members.mock';
import {
  matchesMemberFilterTab,
  matchesMemberSearch,
  sortMembers,
} from '../utils/members.utils';

/**
 * Preview states let the purely-UI screen render every required UI state with
 * mock data. Once the real API integration lands (side-by-side per rule.md),
 * these map onto the React Query lifecycle: 'default' → success, 'loading' →
 * initial fetch, 'error' → fetch failure.
 */
export type MembersPreviewState = 'default' | 'loading' | 'empty' | 'error';

export interface TabCount {
  tab: MemberFilterTab;
  label: string;
  count: number;
}

const RETRY_DELAY_MS = 1200;

export const useMembers = (previewState: MembersPreviewState = 'default') => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MemberFilterTab>('ALL');
  const [sortOption, setSortOption] = useState<MemberSortOption>('default');
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const [isRetrying, setIsRetrying] = useState(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  const isLoading = previewState === 'loading' || isRetrying;
  const hasError = previewState === 'error';

  const members = useMemo<Member[]>(
    () => (previewState === 'empty' ? [] : MOCK_MEMBERS),
    [previewState]
  );

  /** Tab counts mirror the directory totals (mock stats), not the 8-row sample. */
  const tabCounts = useMemo<TabCount[]>(
    () => [
      { tab: 'ALL', label: 'All', count: MEMBER_STATS.total },
      { tab: 'ACTIVE', label: 'Active', count: MEMBER_STATS.active },
      { tab: 'EXPIRING_SOON', label: 'Expiring Soon', count: MEMBER_STATS.expiringSoon },
      { tab: 'INACTIVE', label: 'Inactive', count: MEMBER_STATS.inactive },
    ],
    []
  );

  const filteredMembers = useMemo(() => {
    if (previewState === 'loading' || previewState === 'error') return [];
    const filtered = members.filter(
      member =>
        matchesMemberFilterTab(member, activeTab) && matchesMemberSearch(member, searchQuery)
    );
    return sortMembers(filtered, sortOption);
  }, [members, activeTab, searchQuery, sortOption, previewState]);

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

  /** Simulates a refetch so the loading state and retry action are demonstrable. */
  const retry = useCallback(() => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
    setIsRetrying(true);
    retryTimer.current = setTimeout(() => setIsRetrying(false), RETRY_DELAY_MS);
  }, []);

  return {
    // data
    stats: MEMBER_STATS,
    tabCounts,
    filteredMembers,
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
  };
};

export default useMembers;
