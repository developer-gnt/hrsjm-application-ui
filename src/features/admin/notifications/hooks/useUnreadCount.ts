import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { notificationsService } from '../services/notifications.service';

// Unread badge count for the top-bar bell. Fetches on mount and on every
// focus; failures keep the last known count (badge simply stays stale).
export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      notificationsService
        .listMine({ page: 1, limit: 1 })
        .then(data => {
          if (mounted) {
            setUnreadCount(data.unread_count);
          }
        })
        .catch(() => undefined);
      return () => {
        mounted = false;
      };
    }, []),
  );

  return unreadCount;
}
