import type { StatusTone } from '../../../core/theme/theme';
import type { TicketStatus } from './types/support.types';

export interface TicketStatusMeta {
  label: string;
  tone: StatusTone;
}

// UI labels per the phase plan (Complaints / Support: Open, In Progress,
// Resolved); CLOSED exists in the backend and stays reachable under "All".
const STATUS_META: Record<TicketStatus, TicketStatusMeta> = {
  SUBMITTED: { label: 'Open', tone: 'gold' },
  UNDER_REVIEW: { label: 'In Progress', tone: 'info' },
  RESOLVED: { label: 'Resolved', tone: 'success' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
};

export function ticketStatusMeta(status: TicketStatus): TicketStatusMeta {
  return STATUS_META[status];
}

// Status tabs per the phase plan: All / Open / In Progress / Resolved / Closed.
export type TicketTabKey = 'ALL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

export const TICKET_TABS: Array<{ key: TicketTabKey; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'SUBMITTED', label: 'Open' },
  { key: 'UNDER_REVIEW', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];

export function tabToStatus(tab: TicketTabKey): TicketStatus | undefined {
  return tab === 'ALL' ? undefined : (tab as TicketStatus);
}

// Search per the phase plan covers Ticket ID, Subject and User name. The
// backend `search` parameter only matches subject + description (confirmed
// contract), so ID and user-name matching run over the currently loaded page
// as an interim measure; the subject/description match is delegated to the
// backend query. Reported for backend follow-up.
export function matchesSearch(
  ticket: { id: string; subject: string; user?: { full_name: string } },
  query: string,
): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return true;
  }
  return (
    ticket.id.toLowerCase().includes(trimmed) ||
    ticket.subject.toLowerCase().includes(trimmed) ||
    (ticket.user?.full_name ?? '').toLowerCase().includes(trimmed)
  );
}
