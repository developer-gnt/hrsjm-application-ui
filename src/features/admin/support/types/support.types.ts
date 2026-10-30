// Types mirror the implemented backend contract exactly (HRSJM-back-api,
// support module): snake_case wire format, enum TicketStatus, envelope +
// { items, meta }. No priority / category / assignee fields exist in the
// backend contract (reported as a gap against the phase plan).
import type { PaginationMeta, RelatedUser } from '../../../../core/api/types';

export type TicketStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  user_id: string;
  user?: RelatedUser;
  subject: string;
  description: string;
  status: TicketStatus;
  resolved_by: string | null;
  resolved_by_user?: RelatedUser | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  source?: 'website' | 'web' | 'app';
  documents?: any[];
}

export interface SupportTicketListData {
  items: SupportTicket[];
  meta: PaginationMeta;
}

export interface CreateTicketBody {
  subject: string;
  description: string;
  category?: string;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  source?: string;
  attachments?: Array<{
    name: string;
    uri?: string;
    size?: number;
    formattedSize?: string;
    type?: string;
    base64?: string;
  }>;
}

export interface SupportFilterState {
  status: string; // 'ALL' | TicketStatus
  category: string; // 'ALL' | specific category
  dateRange: string; // 'ALL' | 'TODAY' | '7_DAYS' | 'THIS_MONTH' | '90_DAYS'
  source?: string; // 'ALL' | 'website' | 'web' | 'app'
  fromDate?: string;
  toDate?: string;
}

export interface SupportTicketQuery {
  status?: TicketStatus;
  category?: string;
  source?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  author_id: string;
  author?: RelatedUser;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface AddTicketMessageBody {
  body: string;
}

export interface UpdateTicketStatusBody {
  status: TicketStatus;
  note?: string;
}

// Backend ALLOWED_TRANSITIONS (support.service.ts):
//   SUBMITTED    -> UNDER_REVIEW | RESOLVED | CLOSED
//   UNDER_REVIEW -> RESOLVED | CLOSED
//   RESOLVED     -> CLOSED
//   CLOSED       -> (terminal)
export const TICKET_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
  UNDER_REVIEW: ['RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return TICKET_TRANSITIONS[from].includes(to);
}

export function isClosed(status: TicketStatus): boolean {
  return status === 'CLOSED';
}

export function shortTicketId(id: string): string {
  if (!id) return '';
  if (id.startsWith('HRSJM-CMP-')) return id;
  return `HRSJM-CMP-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}
