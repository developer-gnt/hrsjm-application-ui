export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  target_audience?: string;
  sent_at?: string;
}

export interface NotificationItem {
  recipient_id: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  notification: NotificationPayload;
}

export interface NotificationsListResponse {
  items: NotificationItem[];
  unread_count: number;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  unread_count: number;
}
