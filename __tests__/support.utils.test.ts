import {
  matchesSearch,
  tabToStatus,
  TICKET_TABS,
  ticketStatusMeta,
} from '../src/features/admin/support/support.utils';
import {
  canTransition,
  isClosed,
  shortTicketId,
  TICKET_TRANSITIONS,
} from '../src/features/admin/support/types/support.types';

describe('ticket status metadata', () => {
  it('maps every backend status to the phase-plan label and a tone', () => {
    expect(ticketStatusMeta('SUBMITTED')).toEqual({ label: 'Open', tone: 'gold' });
    expect(ticketStatusMeta('UNDER_REVIEW')).toEqual({ label: 'In Progress', tone: 'info' });
    expect(ticketStatusMeta('RESOLVED')).toEqual({ label: 'Resolved', tone: 'success' });
    expect(ticketStatusMeta('CLOSED')).toEqual({ label: 'Closed', tone: 'neutral' });
  });
});

describe('status tabs', () => {
  it('exposes exactly the tabs defined by the phase plan', () => {
    expect(TICKET_TABS.map(tab => tab.key)).toEqual([
      'ALL',
      'SUBMITTED',
      'UNDER_REVIEW',
      'RESOLVED',
    ]);
  });

  it('maps tabs to backend status filters (All sends none)', () => {
    expect(tabToStatus('ALL')).toBeUndefined();
    expect(tabToStatus('SUBMITTED')).toBe('SUBMITTED');
    expect(tabToStatus('UNDER_REVIEW')).toBe('UNDER_REVIEW');
    expect(tabToStatus('RESOLVED')).toBe('RESOLVED');
  });
});

describe('ticket status transitions', () => {
  it('mirrors the backend ALLOWED_TRANSITIONS map exactly', () => {
    expect(TICKET_TRANSITIONS).toEqual({
      SUBMITTED: ['UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
      UNDER_REVIEW: ['RESOLVED', 'CLOSED'],
      RESOLVED: ['CLOSED'],
      CLOSED: [],
    });
  });

  it('admits only the transitions the backend accepts', () => {
    expect(canTransition('SUBMITTED', 'UNDER_REVIEW')).toBe(true);
    expect(canTransition('SUBMITTED', 'RESOLVED')).toBe(true);
    expect(canTransition('SUBMITTED', 'CLOSED')).toBe(true);
    expect(canTransition('UNDER_REVIEW', 'RESOLVED')).toBe(true);
    expect(canTransition('UNDER_REVIEW', 'CLOSED')).toBe(true);
    expect(canTransition('RESOLVED', 'CLOSED')).toBe(true);

    expect(canTransition('UNDER_REVIEW', 'UNDER_REVIEW')).toBe(false);
    expect(canTransition('RESOLVED', 'UNDER_REVIEW')).toBe(false);
    expect(canTransition('RESOLVED', 'RESOLVED')).toBe(false);
    expect(canTransition('CLOSED', 'UNDER_REVIEW')).toBe(false);
    expect(canTransition('CLOSED', 'RESOLVED')).toBe(false);
  });

  it('treats CLOSED as the only closed state', () => {
    expect(isClosed('CLOSED')).toBe(true);
    expect(isClosed('SUBMITTED')).toBe(false);
    expect(isClosed('UNDER_REVIEW')).toBe(false);
    expect(isClosed('RESOLVED')).toBe(false);
  });
});

describe('client-side search supplement', () => {
  const ticket = {
    id: '1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d',
    subject: 'Donation receipt not received',
    user: { full_name: 'Aisha Rahman' },
  };

  it('matches by ticket id', () => {
    expect(matchesSearch(ticket, '1a2b3c4d')).toBe(true);
    expect(matchesSearch(ticket, 'XXXX')).toBe(false);
  });

  it('matches by subject', () => {
    expect(matchesSearch(ticket, 'receipt')).toBe(true);
    expect(matchesSearch(ticket, 'REFUND')).toBe(false);
  });

  it('matches by user name', () => {
    expect(matchesSearch(ticket, 'aisha')).toBe(true);
    expect(matchesSearch(ticket, 'rahman')).toBe(true);
  });

  it('matches tickets without a linked user only on id/subject', () => {
    const orphan = { ...ticket, user: undefined };
    expect(matchesSearch(orphan, 'receipt')).toBe(true);
    expect(matchesSearch(orphan, 'aisha')).toBe(false);
  });

  it('matches everything for an empty query', () => {
    expect(matchesSearch(ticket, '   ')).toBe(true);
  });
});

describe('shortTicketId', () => {
  it('renders a short uppercase reference without dashes', () => {
    expect(shortTicketId('1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d')).toBe('#1A2B3C4D');
  });
});
