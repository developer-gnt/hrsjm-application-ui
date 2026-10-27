import { apiClient } from '../../../core/api/client';
import { ApiRoutes } from '../../../core/constants/api-routes';
import type {
  NotificationsListResponse,
  UnreadCountResponse,
} from '../types/notification.types';

export const notificationsApiService = {
  /**
   * Fetch current user's notification inbox
   */
  async getMyNotifications(
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ): Promise<NotificationsListResponse> {
    const params: Record<string, string | number | boolean> = {
      page,
      limit,
    };
    if (unreadOnly) {
      params.unread_only = true;
    }
    const response = await apiClient.get<NotificationsListResponse>(
      ApiRoutes.NOTIFICATIONS.ME,
      { params },
    );
    return response.data;
  },

  /**
   * Fetch unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<UnreadCountResponse>(
        ApiRoutes.NOTIFICATIONS.UNREAD_COUNT,
      );
      return response.data?.unread_count ?? 0;
    } catch {
      return 0;
    }
  },

  /**
   * Mark a single notification recipient item as read
   */
  async markAsRead(recipientId: string): Promise<boolean> {
    try {
      await apiClient.patch(ApiRoutes.NOTIFICATIONS.MARK_READ(recipientId), {});
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Mark all notifications in the inbox as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      await apiClient.patch(ApiRoutes.NOTIFICATIONS.READ_ALL, {});
      return true;
    } catch {
      return false;
    }
  },
};
