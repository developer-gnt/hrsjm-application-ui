import { create } from 'zustand';
import { notificationsApiService } from '../services/notifications.service';
import type { NotificationItem } from '../types/notification.types';

interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  activeFilter: 'all' | 'unread';
  setFilter: (filter: 'all' | 'unread') => void;
  fetchNotifications: (isRefresh?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (recipientId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isRefreshing: false,
  activeFilter: 'all',

  setFilter: (activeFilter: 'all' | 'unread') => {
    set({ activeFilter });
    get().fetchNotifications();
  },

  fetchNotifications: async (isRefresh = false) => {
    if (isRefresh) {
      set({ isRefreshing: true });
    } else {
      set({ isLoading: true });
    }

    try {
      const { activeFilter } = get();
      const res = await notificationsApiService.getMyNotifications(
        1,
        50,
        activeFilter === 'unread',
      );
      set({
        notifications: res.items || [],
        unreadCount: res.unread_count ?? 0,
        isLoading: false,
        isRefreshing: false,
      });
    } catch {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationsApiService.getUnreadCount();
      set({ unreadCount: count });
    } catch {
      // Ignore background counter errors
    }
  },

  markAsRead: async (recipientId: string) => {
    // Optimistic update
    const current = get().notifications;
    const target = current.find((n) => n.recipient_id === recipientId);
    if (!target || target.is_read) return;

    set({
      notifications: current.map((n) =>
        n.recipient_id === recipientId
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n,
      ),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });

    await notificationsApiService.markAsRead(recipientId);
  },

  markAllAsRead: async () => {
    // Optimistic update
    set({
      notifications: get().notifications.map((n) => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString(),
      })),
      unreadCount: 0,
    });

    await notificationsApiService.markAllAsRead();
  },
}));
