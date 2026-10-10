import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getApiErrorMessage } from '../../../../core/api/client';
import { supportService } from '../services/support.service';
import type { SupportTicket } from '../types/support.types';

export function useTicketDetails(ticketId: string) {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedOnceRef = useRef(false);
  const seqRef = useRef(0);

  const fetchTicket = useCallback(
    async (mode: 'initial' | 'silent' | 'refresh') => {
      const seq = ++seqRef.current;
      if (mode === 'initial') {
        setInitialLoading(true);
      }
      if (mode === 'refresh') {
        setRefreshing(true);
      }
      try {
        const data = await supportService.getById(ticketId);
        if (seq !== seqRef.current) {
          return;
        }
        setTicket(data);
        setError(null);
      } catch (err) {
        if (seq !== seqRef.current) {
          return;
        }
        setError(getApiErrorMessage(err, 'Unable to load the support ticket.'));
      } finally {
        if (seq === seqRef.current) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    },
    [ticketId],
  );

  useFocusEffect(
    useCallback(() => {
      if (!loadedOnceRef.current) {
        loadedOnceRef.current = true;
        fetchTicket('initial');
      } else {
        // Refocus after a status update or a reply: refresh silently.
        fetchTicket('silent');
      }
    }, [fetchTicket]),
  );

  const refresh = useCallback(() => fetchTicket('refresh'), [fetchTicket]);

  // Local update after a successful status change (server is authoritative on
  // the next refresh; this keeps the transition snappy).
  const applyUpdate = useCallback((updated: SupportTicket) => {
    setTicket(updated);
  }, []);

  return {
    ticket,
    initialLoading,
    refreshing,
    error,
    refresh,
    applyUpdate,
    retry: () => fetchTicket('initial'),
  };
}
