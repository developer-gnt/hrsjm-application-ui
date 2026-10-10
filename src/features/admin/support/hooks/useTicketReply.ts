import { useCallback, useRef, useState } from 'react';
import { getApiErrorMessage } from '../../../../core/api/client';
import { supportService } from '../services/support.service';
import type { SupportTicketMessage } from '../types/support.types';

interface UseTicketReplyOptions {
  onSent: (message: SupportTicketMessage) => void;
}

// Reply flow per the phase plan: validation, loading, API, append, and
// duplicate-submission prevention (in-flight ref + sending state; the button
// is disabled while sending and the guard drops re-entrant submits).
export function useTicketReply(ticketId: string, { onSent }: UseTicketReplyOptions) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const send = useCallback(async () => {
    if (inFlightRef.current) {
      return; // a reply is already in flight - ignore duplicate submissions
    }
    const text = body.trim();
    if (!text) {
      setError('Reply cannot be empty.');
      return;
    }
    inFlightRef.current = true;
    setSending(true);
    setError(null);
    try {
      const message = await supportService.addMessage(ticketId, { body: text });
      setBody('');
      onSent(message);
    } catch (err) {
      // Keep the drafted text so it can be retried without retyping.
      setError(getApiErrorMessage(err, 'Reply failed. Please try again.'));
    } finally {
      inFlightRef.current = false;
      setSending(false);
    }
  }, [body, onSent, ticketId]);

  const clearError = useCallback(() => setError(null), []);

  return { body, setBody, sending, error, send, clearError };
}
