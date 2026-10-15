import { useCallback, useRef, useState } from 'react';
import { getApiErrorMessage } from '../../../../core/api/client';
import { supportService } from '../services/support.service';
import type { SupportTicketMessage } from '../types/support.types';

export function useTicketMessages(ticketId: string) {
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seqRef = useRef(0);

  const fetchMessages = useCallback(
    async (mode: 'initial' | 'refresh') => {
      const seq = ++seqRef.current;
      if (mode === 'initial') {
        setInitialLoading(true);
      } else {
        setRefreshing(true);
      }
      try {
        const data = await supportService.listMessages(ticketId);
        if (seq !== seqRef.current) {
          return;
        }
        setMessages(data);
        setError(null);
      } catch (err) {
        if (seq !== seqRef.current) {
          return;
        }
        setError(getApiErrorMessage(err, 'Unable to load the conversation.'));
      } finally {
        if (seq === seqRef.current) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    },
    [ticketId],
  );

  // Append a freshly created reply without a full reload.
  const appendMessage = useCallback((message: SupportTicketMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  return {
    messages,
    initialLoading,
    refreshing,
    error,
    fetchMessages,
    appendMessage,
    retry: () => fetchMessages('initial'),
  };
}
