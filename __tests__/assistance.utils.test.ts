import {
  ASSISTANCE_TABS,
  canReview,
  matchesSearch,
  statusMeta,
  tabToStatus,
} from '../src/features/admin/assistance/assistance.utils';
import {
  isTerminalStatus,
  shortRequestId,
  TERMINAL_STATUSES,
} from '../src/features/admin/assistance/types/assistance.types';

describe('assistance status metadata', () => {
  it('maps every backend status to a label and tone', () => {
    expect(statusMeta('PENDING')).toEqual({ label: 'Pending', tone: 'gold' });
    expect(statusMeta('UNDER_REVIEW')).toEqual({ label: 'Under Review', tone: 'info' });
    expect(statusMeta('APPROVED')).toEqual({ label: 'Approved', tone: 'success' });
    expect(statusMeta('REJECTED')).toEqual({ label: 'Rejected', tone: 'danger' });
    expect(statusMeta('CLOSED')).toEqual({ label: 'Closed', tone: 'neutral' });
  });
});

describe('status tabs', () => {
  it('exposes exactly the tabs defined by the phase plan', () => {
    expect(ASSISTANCE_TABS.map(tab => tab.key)).toEqual([
      'ALL',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
    ]);
  });

  it('maps tabs to backend status filters (All sends none)', () => {
    expect(tabToStatus('ALL')).toBeUndefined();
    expect(tabToStatus('UNDER_REVIEW')).toBe('UNDER_REVIEW');
    expect(tabToStatus('APPROVED')).toBe('APPROVED');
    expect(tabToStatus('REJECTED')).toBe('REJECTED');
  });
});

describe('status transitions', () => {
  it('treats APPROVED, REJECTED and CLOSED as terminal', () => {
    expect(TERMINAL_STATUSES).toEqual(['APPROVED', 'REJECTED', 'CLOSED']);
    expect(isTerminalStatus('APPROVED')).toBe(true);
    expect(isTerminalStatus('REJECTED')).toBe(true);
    expect(isTerminalStatus('CLOSED')).toBe(true);
  });

  it('allows review actions only for non-terminal requests', () => {
    expect(canReview('PENDING')).toBe(true);
    expect(canReview('UNDER_REVIEW')).toBe(true);
    expect(canReview('APPROVED')).toBe(false);
    expect(canReview('REJECTED')).toBe(false);
    expect(canReview('CLOSED')).toBe(false);
  });
});

describe('interim client-side search', () => {
  const request = { id: '9f1c2b3a-4d5e-4f60-a1b2-c3d4e5f60718', fullName: 'Ahmed Khan' };

  it('matches by name, case-insensitively', () => {
    expect(matchesSearch(request, 'ahmed')).toBe(true);
    expect(matchesSearch(request, 'KHAN')).toBe(true);
    expect(matchesSearch(request, 'Aisha')).toBe(false);
  });

  it('matches by request id', () => {
    expect(matchesSearch(request, '9f1c2b3a')).toBe(true);
    expect(matchesSearch(request, 'XXXX')).toBe(false);
  });

  it('matches everything for an empty query', () => {
    expect(matchesSearch(request, '   ')).toBe(true);
  });
});

describe('shortRequestId', () => {
  it('renders a short uppercase reference without dashes', () => {
    expect(shortRequestId('9f1c2b3a-4d5e-4f60-a1b2-c3d4e5f60718')).toBe('#9F1C2B3A');
  });
});
