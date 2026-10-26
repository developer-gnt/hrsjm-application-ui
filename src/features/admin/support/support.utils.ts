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

export type TicketSourceType = 'website' | 'web' | 'app';

export interface SourceMeta {
  label: string;
  shortLabel: string;
  icon: string;
  bg: string;
  text: string;
  border: string;
}

export const SOURCE_CONFIG: Record<TicketSourceType, SourceMeta> = {
  website: {
    label: 'Website',
    shortLabel: 'Website',
    icon: 'globe',
    bg: '#EFF6FF',
    text: '#1D4ED8',
    border: '#BFDBFE',
  },
  app: {
    label: 'Application',
    shortLabel: 'App',
    icon: 'smartphone',
    bg: '#F0FDF4',
    text: '#15803D',
    border: '#BBF7D0',
  },
  web: {
    label: 'Web App',
    shortLabel: 'Web',
    icon: 'laptop',
    bg: '#FAF5FF',
    text: '#7E22CE',
    border: '#E9D5FF',
  },
};

export function resolveTicketSource(ticket: {
  source?: string;
  description?: string;
  subject?: string;
}): TicketSourceType {
  if (ticket.source) {
    const s = ticket.source.toLowerCase().trim();
    if (s.includes('site') || s === 'website') return 'website';
    if (s === 'web' || s.includes('web app')) return 'web';
    if (s === 'app' || s.includes('mobile')) return 'app';
  }
  const desc = ticket.description || '';
  if (
    desc.includes('Source: Website') ||
    desc.includes('[Source: Website]') ||
    desc.includes('Complainant Information:\n- Full Name:')
  ) {
    return 'website';
  }
  if (
    desc.includes('Source: Web App') ||
    desc.includes('Source: Web') ||
    desc.includes('[Source: Web]')
  ) {
    return 'web';
  }
  if (
    desc.includes('Source: App') ||
    desc.includes('Source: Mobile App') ||
    desc.includes('[Source: App]')
  ) {
    return 'app';
  }
  return 'app';
}
