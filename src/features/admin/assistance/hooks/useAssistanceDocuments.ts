import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getApiErrorMessage } from '../../../../core/api/client';
import { assistanceService } from '../services/assistance.service';
import type { AssistanceDocumentItem } from '../types/assistance.types';

export function useAssistanceDocuments(requestId: string) {
  const [documents, setDocuments] = useState<AssistanceDocumentItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedOnceRef = useRef(false);

  const fetchDocuments = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (mode === 'initial') {
        setInitialLoading(true);
      } else {
        setRefreshing(true);
      }
      try {
        const data = await assistanceService.listDocuments(requestId);
        setDocuments(data.items.filter(doc => !doc.is_archived));
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load documents.'));
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [requestId],
  );

  useFocusEffect(
    useCallback(() => {
      if (!loadedOnceRef.current) {
        loadedOnceRef.current = true;
        fetchDocuments('initial');
      }
    }, [fetchDocuments]),
  );

  return {
    documents,
    initialLoading,
    refreshing,
    error,
    refresh: () => fetchDocuments('refresh'),
    retry: () => fetchDocuments('initial'),
  };
}
