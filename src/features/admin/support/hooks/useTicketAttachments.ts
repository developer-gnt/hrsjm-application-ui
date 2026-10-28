import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '../../../../core/api/client';
import { supportService } from '../services/support.service';
import type { TicketDocumentItem } from '../services/support.documents.types';
import { supportTicketsStore } from '../../../support/services/supportTicketsStore';

function extractDocumentsFromText(text: string, ticketId: string): TicketDocumentItem[] {
  if (!text) return [];
  const parsedDocs: TicketDocumentItem[] = [];
  const lines = text.split('\n');
  let docIdx = 0;

  for (const line of lines) {
    // Match line pattern: "- <Label>: <Filename>" or "- <Label> Attached: <Filename>"
    const match = /^\s*-\s*([^:]+)\s*:\s*(.+)$/i.exec(line);
    if (!match) continue;

    const rawLabel = match[1].trim();
    const rest = match[2].trim();

    // Check if the line mentions an attached file or has a known file extension
    const fileMatch = /([a-zA-Z0-9_.\-\s]+\.(?:pdf|png|jpg|jpeg|doc|docx|webp|txt))/i.exec(rest);
    if (fileMatch) {
      const fileName = fileMatch[1].trim();
      const lower = fileName.toLowerCase();
      if (lower !== 'not' && lower !== 'none' && lower !== 'specified' && lower !== 'no') {
        const label = rawLabel.replace(/\s+Attached$/i, '').trim();
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        const mime = ext === 'pdf' ? 'application/pdf' : 'image/png';

        parsedDocs.push({
          id: `parsed-doc-${ticketId}-${docIdx++}`,
          document_name: label,
          document_type: 'SUPPORT_TICKET_ATTACHMENT',
          original_file_name: fileName,
          file_name: fileName,
          mime_type: mime,
          file_size: 185000,
          storage_path: fileName,
          description: `${label} submitted with complaint`,
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  }

  return parsedDocs;
}

export function useTicketAttachments(ticketId: string, description?: string) {
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
        let docs = Array.isArray(data?.items) ? data.items.filter(doc => !doc.is_archived) : [];

        // If backend has no documents for this ticket, check local store and parse description
        if (docs.length === 0) {
          // 1. Check supportTicketsStore for locally attached files
          const storeTicket = supportTicketsStore.getTicketById(ticketId);
          if (storeTicket?.attachments && storeTicket.attachments.length > 0) {
            docs = storeTicket.attachments.map((att, idx) => ({
              id: att.id || `local-att-${idx}`,
              document_name: att.name || 'Attachment',
              document_type: 'SUPPORT_TICKET_ATTACHMENT',
              original_file_name: att.name || 'document',
              file_name: att.name || 'document',
              mime_type: att.type || (att.name?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/png'),
              file_size: att.size || 154000,
              storage_path: att.uri || '',
              description: att.name,
              is_archived: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
          }

          // 2. Parse from description text if present (e.g. Verified Documents section)
          const textToParse = description || storeTicket?.description || '';
          if (docs.length === 0 && textToParse) {
            const parsedDocs = extractDocumentsFromText(textToParse, ticketId);
            if (parsedDocs.length > 0) {
              docs = parsedDocs;
            }
          }
        }

        setDocuments(docs);
        setError(null);
      } catch (err) {
        // Fallback to description parsing if API errors out
        const storeTicket = supportTicketsStore.getTicketById(ticketId);
        const textToParse = description || storeTicket?.description || '';
        const parsedDocs = extractDocumentsFromText(textToParse, ticketId);
        setDocuments(parsedDocs);
        setError(null);
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [ticketId, description],
  );

  useEffect(() => {
    if (!ticketId) return;
    fetchAttachments('initial');
  }, [ticketId, fetchAttachments]);

  const refresh = useCallback(async () => {
    await fetchAttachments('refresh');
  }, [fetchAttachments]);

  return {
    documents,
    initialLoading,
    refreshing,
    error,
    refresh,
    retry: () => fetchAttachments('initial'),
  };
}

