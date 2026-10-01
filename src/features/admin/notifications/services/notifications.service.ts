import { api, unwrap } from '../../../../core/api/client';
import type { ApiEnvelope } from '../../../../core/api/types';
import type {
  MarkAllReadResult,
  MarkReadResult,
  MyNotificationsData,
  MyNotificationsQuery,
} from '../types/notifications.types';

// Routes confirmed against the implemented backend (HRSJM-back-api,
// notifications module):
//   GET   /notifications/me?page&limit&unread_only  -> inbox + unread_count
//   PATCH /notifications/recipients/:recipientId/read
//   PATCH /notifications/me/read-all                -> { updated_count }
// The backend has no structured notification payload field (title/body only),
// so deep links cannot be built from this contract (reported gap) and no
// payload is assumed here.
export const notificationsService = {
  async listMine(query: MyNotificationsQuery = {}): Promise<MyNotificationsData> {
    const params: MyNotificationsQuery = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };
    if (query.unread_only) {
      params.unread_only = true;
    }
    const res = await api.get<ApiEnvelope<MyNotificationsData>>('/notifications/me', { params });
    return unwrap(res.data);
  },

  async markRead(recipientId: string): Promise<MarkReadResult> {
    const res = await api.patch<ApiEnvelope<MarkReadResult>>(
      `/notifications/recipients/${recipientId}/read`,
    );
    return unwrap(res.data);
  },

  // Confirmed as supported by the backend (PATCH /notifications/me/read-all).
  async markAllRead(): Promise<MarkAllReadResult> {
    const res = await api.patch<ApiEnvelope<MarkAllReadResult>>('/notifications/me/read-all');
    return unwrap(res.data);
  },
};
