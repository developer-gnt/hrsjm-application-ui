import { useDynamicUnreadCount, useNotificationsStore } from '../store/notificationsStore';

export { useNotificationsStore, useDynamicUnreadCount };

/**
 * Unread badge count for the top-bar bell. Uses the centralized Zustand store
 * ensuring dynamic, real-time synchronization across all app screens.
 */
export function useUnreadCount(): number {
  return useDynamicUnreadCount();
}
