import React, { useEffect } from 'react';
import { create } from 'zustand';
import { notificationsService } from '../services/notifications.service';

interface NotificationsStoreState {
  unreadCount: number;
  isLoading: boolean;
  lastFetchedAt: number | null;
  fetchUnreadCount: () => Promise<number>;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: (by?: number) => void;
  resetUnreadCount: () => void;
}

let isFetching = false;
let autoFetchTimer: any = null;

export const useNotificationsStore = create<NotificationsStoreState>((set, get) => ({
  unreadCount: 0,
  isLoading: false,
  lastFetchedAt: null,

  fetchUnreadCount: async () => {
    if (isFetching) return get().unreadCount;
    isFetching = true;
    set({ isLoading: true });
    try {
      const data = await notificationsService.listMine({ page: 1, limit: 1 });
      const count =
        typeof data?.unread_count === 'number'
          ? data.unread_count
          : typeof (data as any)?.unreadCount === 'number'
          ? (data as any).unreadCount
          : 0;
      set({ unreadCount: count, lastFetchedAt: Date.now() });
      return count;
    } catch {
      // In case of error or offline, retain current count
      return get().unreadCount;
    } finally {
      isFetching = false;
      set({ isLoading: false });
    }
  },

  setUnreadCount: (count: number) => {
    set({ unreadCount: Math.max(0, count), lastFetchedAt: Date.now() });
  },

  decrementUnreadCount: (by = 1) => {
    set(state => ({ unreadCount: Math.max(0, state.unreadCount - by) }));
  },

  resetUnreadCount: () => {
    set({ unreadCount: 0, lastFetchedAt: Date.now() });
  },
}));

/**
 * Universal hook providing the dynamic unread notification count.
 * All headers across the application subscribe to this hook for seamless, identical badge numbers.
 */
export function useDynamicUnreadCount(): number {
  const unreadCount = useNotificationsStore(state => state.unreadCount);
  const fetchUnreadCount = useNotificationsStore(state => state.fetchUnreadCount);

  useEffect(() => {
    // Initial fetch on mount
    fetchUnreadCount().catch(() => {});

    // Periodic synchronization so all screens stay in sync
    if (!autoFetchTimer && typeof setInterval !== 'undefined') {
      autoFetchTimer = setInterval(() => {
        useNotificationsStore.getState().fetchUnreadCount().catch(() => {});
      }, 15000);
    }

    // Sync on window focus in web view
    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : null;
    const handleFocus = () => {
      useNotificationsStore.getState().fetchUnreadCount().catch(() => {});
    };

    if (win && typeof win.addEventListener === 'function') {
      win.addEventListener('focus', handleFocus);
    }

    return () => {
      if (win && typeof win.removeEventListener === 'function') {
        win.removeEventListener('focus', handleFocus);
      }
    };
  }, [fetchUnreadCount]);

  return unreadCount;
}
