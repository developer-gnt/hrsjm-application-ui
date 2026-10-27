import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '../../../../core/api/client';
import { supportService } from '../services/support.service';
import type { TicketDocumentItem } from '../services/support.documents.types';

export function useTicketAttachments(ticketId: string) {
  const [documents, setDocuments] = useState<TicketDocumentItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedOnceRef = useRef(false);

  const fetchAttachments = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (mode === 'initial') {
        setInitialLoading(true);
      } else {
        setRefreshing(true);
      }
      try {
        const data = await supportService.listAttachments(ticketId);
        const docs = Array.isArray(data?.items) ? data.items.filter(doc => !doc.is_archived) : [];
        setDocuments(docs);
        setError(null);
      } catch (err) {
        // If attachments fetch returns empty or error, treat gracefully as 0 attachments
        setDocuments([]);
        setError(null);
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [ticketId],
  );

  useEffect(() => {
    fetchAttachments('initial');
  }, [fetchAttachments]);

  return {
    documents,
    initialLoading,
    refreshing,
    error,
    loadedOnceRef,
    fetchAttachments,
    retry: () => fetchAttachments('initial'),
  };
}
