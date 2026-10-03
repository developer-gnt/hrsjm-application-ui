// Ticket attachment documents share the backend documents module contract
// (documents table / GET /documents) - the same wire format as assistance
// documents, keyed by related_entity_type=SUPPORT_TICKET.
import type { PaginationMeta } from '../../../../core/api/types';

export interface TicketDocumentItem {
  id: string;
  document_name: string;
  document_type: string;
  original_file_name: string;
  mime_type: string;
  file_size: number;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketDocumentsListData {
  items: TicketDocumentItem[];
  meta: PaginationMeta;
}
