import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getApiErrorMessage } from '../../../../core/api/client';
import type { PaginationMeta } from '../../../../core/api/types';
import { notificationsService } from '../services/notifications.service';
import type { NotificationItem } from '../types/notifications.types';

const PAGE_SIZE = 10;

type ViewKey = 'ALL' | 'UNREAD';
type LoadMode = 'initial' | 'silent' | 'refresh' | 'more';

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeView, setActiveViewState] = useState<ViewKey>('ALL');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(1);
  const seqRef = useRef(0);
  const activeViewRef = useRef<ViewKey>('ALL');
  const loadedOnceRef = useRef(false);

  const fetchPage = useCallback(async (page: number, mode: LoadMode) => {
    const seq = ++seqRef.current;
    const unreadOnly = activeViewRef.current === 'UNREAD';

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
      const data = await notificationsService.listMine({
        unread_only: unreadOnly || undefined,
        page,
        limit: PAGE_SIZE,
      });
      if (seq !== seqRef.current) {
        return; // a newer request superseded this one
      }
      pageRef.current = page;
      setMeta(data.meta);
      setUnreadCount(data.unread_count);
      setItems(prev =>
        mode === 'more' && page > 1 ? [...prev, ...data.items] : data.items,
      );
      setError(null);
    } catch (err) {
      if (seq !== seqRef.current) {
        return;
      }
      setError(getApiErrorMessage(err, 'Unable to load notifications.'));
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

  const load = useCallback(
    (mode: LoadMode) => fetchPage(1, mode),
    [fetchPage],
  );

  useFocusEffect(
    useCallback(() => {
      // Re-sync on every focus so the unread count stays current after
      // navigating away and back.
      if (!loadedOnceRef.current) {
        loadedOnceRef.current = true;
        fetchPage(1, 'initial');
      } else {
        fetchPage(1, 'silent');
      }
    }, [fetchPage]),
  );

  const setView = useCallback(
    (view: ViewKey) => {
      if (view === activeViewRef.current) {
        return;
      }
      activeViewRef.current = view;
      setActiveViewState(view);
      fetchPage(1, 'initial');
    },
    [fetchPage],
  );

  const refresh = useCallback(() => fetchPage(1, 'refresh'), [fetchPage]);

  const hasMore = meta ? pageRef.current < meta.totalPages : false;

  const loadMore = useCallback(() => {
    if (loadingMore || refreshing || initialLoading || !hasMore) {
      return;
    }
    return fetchPage(pageRef.current + 1, 'more');
  }, [fetchPage, hasMore, initialLoading, loadingMore, refreshing]);

  // Optimistic mark-read; the unread count is re-synced on the next reload.
  const markRead = useCallback(
    async (item: NotificationItem): Promise<boolean> => {
      if (item.is_read) {
        return true;
      }
      try {
        await notificationsService.markRead(item.recipient_id);
        setItems(prev =>
          prev.map(entry =>
            entry.recipient_id === item.recipient_id
              ? { ...entry, is_read: true, read_at: new Date().toISOString() }
              : entry,
          ),
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not mark the notification as read.'));
        return false;
      }
    },
    [],
  );

  const markAllRead = useCallback(async (): Promise<boolean> => {
    try {
      await notificationsService.markAllRead();
      setItems(prev => prev.map(entry => ({ ...entry, is_read: true })));
      setUnreadCount(0);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not mark all notifications as read.'));
      return false;
    }
  }, []);

  return {
    items,
    unreadCount,
    activeView,
    initialLoading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    load: load,
    setView,
    refresh,
    loadMore,
    markRead,
    markAllRead,
  };
}
