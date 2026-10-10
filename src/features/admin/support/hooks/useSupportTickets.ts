import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getApiErrorMessage } from '../../../../core/api/client';
import type { PaginationMeta } from '../../../../core/api/types';
import { supportService } from '../services/support.service';
import type { SupportFilterState, SupportTicket } from '../types/support.types';
import {
  matchesSearch,
  tabToStatus,
  type TicketTabKey,
} from '../support.utils';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed?: number;
}

export const INITIAL_SUPPORT_FILTERS: SupportFilterState = {
  status: 'ALL',
  category: 'ALL',
  dateRange: 'ALL',
  fromDate: undefined,
  toDate: undefined,
};

type LoadMode = 'initial' | 'silent' | 'refresh' | 'more';

export function useSupportTickets() {
  const [items, setItems] = useState<SupportTicket[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [activeTab, setActiveTabState] = useState<TicketTabKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<SupportFilterState>(INITIAL_SUPPORT_FILTERS);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const pageRef = useRef(1);
  const seqRef = useRef(0);
  const activeTabRef = useRef<TicketTabKey>('ALL');
  const filtersRef = useRef<SupportFilterState>(INITIAL_SUPPORT_FILTERS);
  const searchRef = useRef('');
  const loadedOnceRef = useRef(false);

  const fetchPage = useCallback(async (page: number, mode: LoadMode) => {
    const seq = ++seqRef.current;
    const currentFilters = filtersRef.current;
    const status = currentFilters.status !== 'ALL'
      ? (currentFilters.status as any)
      : tabToStatus(activeTabRef.current);
    const search = searchRef.current.trim() || undefined;
    const category = currentFilters.category !== 'ALL' ? currentFilters.category : undefined;
    const from_date = currentFilters.fromDate;
    const to_date = currentFilters.toDate;

    if (mode === 'initial') {
      setInitialLoading(true);
    }
    if (mode === 'refresh') {
      setRefreshing(true);
    }
    if (mode === 'more') {
      setLoadingMore(true);
    }

    try {
      const data = await supportService.list({
        status,
        category,
        from_date,
        to_date,
        search,
        page,
        limit: PAGE_SIZE,
      });
      if (seq !== seqRef.current) {
        return;
      }
      pageRef.current = page;
      setMeta(data.meta);
      setItems(prev =>
        mode === 'more' && page > 1 ? [...prev, ...data.items] : data.items,
      );
      setError(null);
    } catch (err) {
      if (seq !== seqRef.current) {
        return;
      }
      setError(getApiErrorMessage(err, 'Unable to load support tickets.'));
      if (mode === 'more' && page > 1) {
        pageRef.current = page - 1;
      }
    } finally {
      if (seq === seqRef.current) {
        setInitialLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    }
  }, []);

  const reloadStats = useCallback(async () => {
    const currentFilters = filtersRef.current;
    const search = searchRef.current.trim() || undefined;
    const category = currentFilters.category !== 'ALL' ? currentFilters.category : undefined;
    const from_date = currentFilters.fromDate;
    const to_date = currentFilters.toDate;

    try {
      const summary = await supportService.getStatsSummary({
        category,
        from_date,
        to_date,
        search,
      });
      setStats({
        total: summary.total ?? 0,
        open: summary.open ?? 0,
        inProgress: summary.inProgress ?? 0,
        resolved: summary.resolved ?? 0,
        closed: summary.closed ?? 0,
      });
    } catch {
      // Fallback: reload individual list calls
      try {
        const [all, open, inProgress, resolved] = await Promise.all([
          supportService.list({ category, from_date, to_date, search, page: 1, limit: 1 }),
          supportService.list({ status: 'SUBMITTED', category, from_date, to_date, search, page: 1, limit: 1 }),
          supportService.list({ status: 'UNDER_REVIEW', category, from_date, to_date, search, page: 1, limit: 1 }),
          supportService.list({ status: 'RESOLVED', category, from_date, to_date, search, page: 1, limit: 1 }),
        ]);
        setStats({
          total: all.meta.total,
          open: open.meta.total,
          inProgress: inProgress.meta.total,
          resolved: resolved.meta.total,
          closed: 0,
        });
      } catch {
        // Keep last stats
      }
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchRef.current !== searchQuery.trim()) {
        searchRef.current = searchQuery.trim();
        fetchPage(1, 'initial');
        reloadStats();
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchPage, reloadStats]);

  useFocusEffect(
    useCallback(() => {
      if (!loadedOnceRef.current) {
        loadedOnceRef.current = true;
        fetchPage(1, 'initial');
        reloadStats();
      } else {
        fetchPage(1, 'silent');
        reloadStats();
      }
    }, [fetchPage, reloadStats]),
  );

  const setActiveTab = useCallback(
    (tab: TicketTabKey) => {
      activeTabRef.current = tab;
      setActiveTabState(tab);
      filtersRef.current = {
        ...filtersRef.current,
        status: tab,
      };
      setFilterState(filtersRef.current);
      fetchPage(1, 'initial');
    },
    [fetchPage],
  );

  const applyFilters = useCallback(
    (newFilters: SupportFilterState) => {
      filtersRef.current = newFilters;
      setFilterState(newFilters);
      if (newFilters.status && (newFilters.status === 'ALL' || newFilters.status === 'SUBMITTED' || newFilters.status === 'UNDER_REVIEW' || newFilters.status === 'RESOLVED' || newFilters.status === 'CLOSED')) {
        activeTabRef.current = newFilters.status as TicketTabKey;
        setActiveTabState(newFilters.status as TicketTabKey);
      }
      fetchPage(1, 'initial');
      reloadStats();
    },
    [fetchPage, reloadStats],
  );

  const refresh = useCallback(async () => {
    await Promise.all([fetchPage(1, 'refresh'), reloadStats()]);
  }, [fetchPage, reloadStats]);

  const hasMore = meta ? pageRef.current < meta.totalPages : false;

  const loadMore = useCallback(() => {
    if (loadingMore || refreshing || initialLoading || !hasMore) {
      return;
    }
    return fetchPage(pageRef.current + 1, 'more');
  }, [fetchPage, hasMore, initialLoading, loadingMore, refreshing]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    searchRef.current = '';
    activeTabRef.current = 'ALL';
    setActiveTabState('ALL');
    filtersRef.current = INITIAL_SUPPORT_FILTERS;
    setFilterState(INITIAL_SUPPORT_FILTERS);
    fetchPage(1, 'initial');
    reloadStats();
  }, [fetchPage, reloadStats]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterState.status && filterState.status !== 'ALL') count++;
    if (filterState.category && filterState.category !== 'ALL') count++;
    if (filterState.dateRange && filterState.dateRange !== 'ALL') count++;
    return count;
  }, [filterState]);

  const filteredItems = useMemo(
    () => items.filter(ticket => matchesSearch(ticket, debouncedSearch)),
    [items, debouncedSearch],
  );

  return {
    filteredItems,
    totalCount: meta?.total ?? 0,
    stats,
    statsLoading,
    activeTab,
    searchQuery,
    initialLoading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    filterState,
    activeFiltersCount,
    setSearchQuery,
    setActiveTab,
    applyFilters,
    refresh,
    loadMore,
    clearFilters,
  };
}
