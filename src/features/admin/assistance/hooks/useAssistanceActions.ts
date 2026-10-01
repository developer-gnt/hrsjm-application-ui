import { useCallback, useState } from 'react';
import { getApiErrorMessage } from '../../../../core/api/client';
import { assistanceService } from '../services/assistance.service';
import type { AssistanceRequest } from '../types/assistance.types';

export type AssistanceActionKind = 'APPROVE' | 'REJECT';

export function useAssistanceActions() {
  const [acting, setActing] = useState<AssistanceActionKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (
      kind: AssistanceActionKind,
      id: string,
      body: { status: 'APPROVED' | 'REJECTED'; adminRemark?: string },
    ): Promise<AssistanceRequest | null> => {
      setActing(kind);
      setError(null);
      try {
        return await assistanceService.updateStatus(id, body);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Action failed. Please try again.'));
        return null;
      } finally {
        setActing(null);
      }
    },
    [],
  );

  const approve = useCallback(
    (id: string, note?: string) =>
      run('APPROVE', id, { status: 'APPROVED', adminRemark: note?.trim() || undefined }),
    [run],
  );

  const reject = useCallback(
    (id: string, reason: string) =>
      run('REJECT', id, { status: 'REJECTED', adminRemark: reason.trim() }),
    [run],
  );

  const clearError = useCallback(() => setError(null), []);

  return { acting, error, approve, reject, clearError };
}
