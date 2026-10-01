// Types mirror the implemented backend contract exactly (HRSJM-back-api,
// notifications module, NotificationsService.listMine): snake_case wire
// format, recipient rows joined with their notification.
import type { PaginationMeta } from '../../../../core/api/types';

export type NotificationAudience =
  | 'ALL_USERS'
  | 'MEMBERS'
  | 'DONORS'
  | 'DONATION_SEEKERS'
  | 'SPECIFIC_USER';

export interface NotificationItem {
  recipient_id: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  notification: {
    id: string;
    title: string;
    body: string;
    target_audience: NotificationAudience;
    sent_at: string | null;
  };
}

export interface MyNotificationsData {
  items: NotificationItem[];
  unread_count: number;
  meta: PaginationMeta;
}

export interface MyNotificationsQuery {
  page?: number;
  limit?: number;
  unread_only?: boolean;
}

export interface MarkReadResult {
  recipient_id: string;
  is_read: boolean;
  read_at: string | null;
}

export interface MarkAllReadResult {
  updated_count: number;
}
