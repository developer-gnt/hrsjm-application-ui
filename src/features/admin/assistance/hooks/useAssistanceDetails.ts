import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getApiErrorMessage } from '../../../../core/api/client';
import { assistanceService } from '../services/assistance.service';
import type { AssistanceRequest } from '../types/assistance.types';

export function useAssistanceDetails(requestId: string) {
  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedOnceRef = useRef(false);
  const seqRef = useRef(0);

  const fetchRequest = useCallback(
    async (mode: 'initial' | 'silent' | 'refresh') => {
      const seq = ++seqRef.current;
      if (mode === 'initial') {
        setInitialLoading(true);
      }
      if (mode === 'refresh') {
        setRefreshing(true);
      }
      try {
        const data = await assistanceService.getById(requestId);
        if (seq !== seqRef.current) {
          return;
        }
        setRequest(data);
        setError(null);
      } catch (err) {
        if (seq !== seqRef.current) {
          return;
        }
        setError(getApiErrorMessage(err, 'Unable to load the assistance request.'));
      } finally {
        if (seq === seqRef.current) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    },
    [requestId],
  );

  useFocusEffect(
    useCallback(() => {
      if (!loadedOnceRef.current) {
        loadedOnceRef.current = true;
        fetchRequest('initial');
      } else {
        // Refocus after a review action or document upload: refresh silently.
        fetchRequest('silent');
      }
    }, [fetchRequest]),
  );

  const refresh = useCallback(() => fetchRequest('refresh'), [fetchRequest]);

  // Optimistic local update after a successful approve/reject.
  const applyUpdate = useCallback((updated: AssistanceRequest) => {
    setRequest(updated);
  }, []);

  return {
    request,
    initialLoading,
    refreshing,
    error,
    refresh,
    applyUpdate,
    retry: () => fetchRequest('initial'),
  };
}
