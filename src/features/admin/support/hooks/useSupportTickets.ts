import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getApiErrorMessage } from '../../../../core/api/client';
import type { PaginationMeta } from '../../../../core/api/types';
import { supportService } from '../services/support.service';
import type { SupportTicket } from '../types/support.types';
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
}

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
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const pageRef = useRef(1);
  const seqRef = useRef(0);
  const activeTabRef = useRef<TicketTabKey>('ALL');
  const searchRef = useRef('');
  const loadedOnceRef = useRef(false);

  const fetchPage = useCallback(async (page: number, mode: LoadMode) => {
    const seq = ++seqRef.current;
    const status = tabToStatus(activeTabRef.current);
    const search = searchRef.current.trim() || undefined;

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
      const data = await supportService.list({ status, search, page, limit: PAGE_SIZE });
      if (seq !== seqRef.current) {
        return; // a newer request superseded this one
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
        pageRef.current = page - 1; // allow retrying the same page
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
    try {
      const [all, open, inProgress, resolved] = await Promise.all([
        supportService.list({ page: 1, limit: 1 }),
        supportService.list({ status: 'SUBMITTED', page: 1, limit: 1 }),
        supportService.list({ status: 'UNDER_REVIEW', page: 1, limit: 1 }),
        supportService.list({ status: 'RESOLVED', page: 1, limit: 1 }),
      ]);
      setStats({
        total: all.meta.total,
        open: open.meta.total,
        inProgress: inProgress.meta.total,
        resolved: resolved.meta.total,
      });
    } catch {
      // Keep the last known stats instead of flashing zeros on a transient error.
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Debounced search - the backend is not called per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchRef.current !== searchQuery.trim()) {
        searchRef.current = searchQuery.trim();
        fetchPage(1, 'initial');
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchPage]);

  useFocusEffect(
    useCallback(() => {
      if (!loadedOnceRef.current) {
        loadedOnceRef.current = true;
        fetchPage(1, 'initial');
        reloadStats();
      } else {
        // Returning to the list (e.g. after a status update): refresh silently.
        fetchPage(1, 'silent');
        reloadStats();
      }
    }, [fetchPage, reloadStats]),
  );

  const setActiveTab = useCallback(
    (tab: TicketTabKey) => {
      if (tab === activeTabRef.current) {
        return;
      }
      activeTabRef.current = tab;
      setActiveTabState(tab);
      fetchPage(1, 'initial');
    },
    [fetchPage],
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
    fetchPage(1, 'initial');
  }, [fetchPage]);

  // Backend search covers subject + description (sent as `search`); the
  // client-side pass adds Ticket ID and user-name matching per the phase plan.
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
    setSearchQuery,
    setActiveTab,
    refresh,
    loadMore,
    clearFilters,
  };
}
