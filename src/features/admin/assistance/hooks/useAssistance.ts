import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getApiErrorMessage } from '../../../../core/api/client';
import type { PaginationMeta } from '../../../../core/api/types';
import { assistanceService } from '../services/assistance.service';
import type { AssistanceRequest } from '../types/assistance.types';
import {
  matchesSearch,
  tabToStatus,
  type AssistanceTabKey,
} from '../assistance.utils';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

export interface AssistanceStats {
  total: number;
  underReview: number;
  approved: number;
  rejected: number;
}

type LoadMode = 'initial' | 'silent' | 'refresh' | 'more';

export function useAssistance() {
  const [items, setItems] = useState<AssistanceRequest[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [activeTab, setActiveTabState] = useState<AssistanceTabKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AssistanceStats>({
    total: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const pageRef = useRef(1);
  const seqRef = useRef(0);
  const activeTabRef = useRef<AssistanceTabKey>('ALL');
  const loadedOnceRef = useRef(false);

  const fetchPage = useCallback(async (page: number, mode: LoadMode) => {
    const seq = ++seqRef.current;
    const status = tabToStatus(activeTabRef.current);

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
      const data = await assistanceService.list({ status, page, limit: PAGE_SIZE });
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
      setError(getApiErrorMessage(err, 'Unable to load assistance requests.'));
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
      const [all, underReview, approved, rejected] = await Promise.all([
        assistanceService.list({ page: 1, limit: 1 }),
        assistanceService.list({ status: 'UNDER_REVIEW', page: 1, limit: 1 }),
        assistanceService.list({ status: 'APPROVED', page: 1, limit: 1 }),
        assistanceService.list({ status: 'REJECTED', page: 1, limit: 1 }),
      ]);
      setStats({
        total: all.meta.total,
        underReview: underReview.meta.total,
        approved: approved.meta.total,
        rejected: rejected.meta.total,
      });
    } catch {
      // Keep the last known stats instead of flashing zeros on a transient error.
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Debounced search - the backend is not called per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      if (!loadedOnceRef.current) {
        loadedOnceRef.current = true;
        fetchPage(1, 'initial');
        reloadStats();
      } else {
        // Returning to the list (e.g. after approve/reject): refresh silently.
        fetchPage(1, 'silent');
        reloadStats();
      }
    }, [fetchPage, reloadStats]),
  );

  const setActiveTab = useCallback(
    (tab: AssistanceTabKey) => {
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
    activeTabRef.current = 'ALL';
    setActiveTabState('ALL');
    fetchPage(1, 'initial');
  }, [fetchPage]);

  const filteredItems = useMemo(
    () => items.filter(request => matchesSearch(request, debouncedSearch)),
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
