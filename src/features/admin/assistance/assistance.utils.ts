import type { AssistanceStatus } from './types/assistance.types';
import { isTerminalStatus } from './types/assistance.types';
import type { StatusTone } from '../../../core/theme/theme';

export interface AssistanceStatusMeta {
  label: string;
  tone: StatusTone;
}

const STATUS_META: Record<AssistanceStatus, AssistanceStatusMeta> = {
  PENDING: { label: 'Pending', tone: 'gold' },
  UNDER_REVIEW: { label: 'Under Review', tone: 'info' },
  APPROVED: { label: 'Approved', tone: 'success' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
};

export function statusMeta(status: AssistanceStatus): AssistanceStatusMeta {
  return STATUS_META[status];
}

// Status tabs defined by the phase plan: All / Under Review / Approved / Rejected.
// (PENDING and CLOSED requests remain visible under "All".)
export type AssistanceTabKey = 'ALL' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export const ASSISTANCE_TABS: Array<{ key: AssistanceTabKey; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

export function tabToStatus(tab: AssistanceTabKey): AssistanceStatus | undefined {
  return tab === 'ALL' ? undefined : (tab as AssistanceStatus);
}

// Interim search: the backend list endpoint does not yet support a search
// parameter (confirmed contract gap), so name/request-ID matching runs over
// the currently loaded page. Reported for backend follow-up.
export function matchesSearch(
  request: { id: string; fullName: string },
  query: string,
): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return true;
  }
  return (
    request.fullName.toLowerCase().includes(trimmed) ||
    request.id.toLowerCase().includes(trimmed)
  );
}

// Review actions are only available while a request can still transition.
export function canReview(status: AssistanceStatus): boolean {
  return !isTerminalStatus(status);
}
