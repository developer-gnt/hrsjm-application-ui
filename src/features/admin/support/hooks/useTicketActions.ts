import { useCallback, useState } from 'react';
import { getApiErrorMessage } from '../../../../core/api/client';
import { supportService } from '../services/support.service';
import type { TicketStatus } from '../types/support.types';

// Admin status actions confirmed by the backend transitions:
//   Start Review (SUBMITTED -> UNDER_REVIEW), Resolve (-> RESOLVED, with an
//   optional resolution note) and Close (-> CLOSED). Assignment / escalation
//   have no backend support (reported gap) and are intentionally absent.
export type TicketActionKind = 'START_REVIEW' | 'RESOLVE' | 'CLOSE';

const ACTION_STATUS: Record<TicketActionKind, TicketStatus> = {
  START_REVIEW: 'UNDER_REVIEW',
  RESOLVE: 'RESOLVED',
  CLOSE: 'CLOSED',
};

export function useTicketActions() {
  const [acting, setActing] = useState<TicketActionKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (
      kind: TicketActionKind,
      id: string,
      note?: string,
    ): Promise<{ ok: true } | { ok: false; error: string }> => {
      setActing(kind);
      setError(null);
      try {
        await supportService.updateStatus(id, {
          status: ACTION_STATUS[kind],
          note: note?.trim() || undefined,
        });
        return { ok: true };
      } catch (err) {
        const errorMsg = getApiErrorMessage(err, 'Action failed. Please try again.');
        setError(errorMsg);
        return { ok: false, error: errorMsg };
      } finally {
        setActing(null);
      }
    },
    [],
  );

  const startReview = useCallback((id: string) => run('START_REVIEW', id), [run]);
  const resolve = useCallback((id: string, resolutionNote?: string) => run('RESOLVE', id, resolutionNote), [run]);
  const close = useCallback((id: string, note?: string) => run('CLOSE', id, note), [run]);

  const clearError = useCallback(() => setError(null), []);

  return { acting, error, startReview, resolve, close, clearError };
}
