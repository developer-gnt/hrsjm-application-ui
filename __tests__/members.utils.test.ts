import {
  formatRemainingValidity,
  getDaysRemaining,
  getValidityTone,
  matchesMemberSearch,
  sortMembers,
  EXPIRING_WINDOW_DAYS,
} from '../src/features/admin/members/utils/members.utils';
import { Member } from '../src/features/admin/members/types';

const isoFromToday = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};

const makeMember = (overrides: Partial<Member> = {}): Member => ({
  id: 'mem-test',
  name: 'Test Member',
  phone: '+91 98765 43210',
  email: 'test@example.com',
  membershipId: 'HRSJM202600999',
  joinedDate: isoFromToday(-100),
  validTill: isoFromToday(100),
  status: 'ACTIVE',
  ...overrides,
});

describe('members.utils', () => {
  test('getDaysRemaining counts whole days until end of validity day', () => {
    expect(getDaysRemaining(isoFromToday(10))).toBe(10);
    expect(getDaysRemaining(isoFromToday(0))).toBeGreaterThanOrEqual(0);
    expect(getDaysRemaining(isoFromToday(-3))).toBeLessThanOrEqual(-3);
  });

  test('getValidityTone maps to semantic tones', () => {
    expect(getValidityTone(EXPIRING_WINDOW_DAYS + 1)).toBe('success');
    expect(getValidityTone(EXPIRING_WINDOW_DAYS)).toBe('warning');
    expect(getValidityTone(1)).toBe('warning');
    expect(getValidityTone(0)).toBe('danger');
    expect(getValidityTone(-30)).toBe('danger');
  });

  test('matchesMemberSearch spans name, membership ID, phone and email', () => {
    const member = makeMember();

    expect(matchesMemberSearch(member, 'test')).toBe(true);
    expect(matchesMemberSearch(member, 'HRSJM202600999')).toBe(true);
    expect(matchesMemberSearch(member, '98765')).toBe(true);
    expect(matchesMemberSearch(member, 'example.com')).toBe(true);
    expect(matchesMemberSearch(member, 'not-there')).toBe(false);
    expect(matchesMemberSearch(member, '   ')).toBe(true);
  });

  test('sortMembers orders by name, join date and expiry without mutating source', () => {
    const a = makeMember({ id: 'a', name: 'Aman', joinedDate: isoFromToday(-10), validTill: isoFromToday(30) });
    const b = makeMember({ id: 'b', name: 'Bina', joinedDate: isoFromToday(-5), validTill: isoFromToday(10) });
    const list = [b, a];

    const byName = sortMembers(list, 'name_asc');
    expect(byName.map(m => m.id)).toEqual(['a', 'b']);

    const byNewest = sortMembers(list, 'joined_desc');
    expect(byNewest.map(m => m.id)).toEqual(['b', 'a']);

    const byExpiry = sortMembers(list, 'expiry_asc');
    expect(byExpiry.map(m => m.id)).toEqual(['b', 'a']);

    expect(list.map(m => m.id)).toEqual(['b', 'a']); // source untouched
  });

  describe('formatRemainingValidity', () => {
    const fixedNow = new Date('2026-10-08T12:00:00.000Z');

    test('formats months for >= 30 days (e.g. 363 days -> 12 months left)', () => {
      const date363Days = new Date(fixedNow.getTime() + 363 * 24 * 60 * 60 * 1000).toISOString();
      const result = formatRemainingValidity(date363Days, fixedNow);
      expect(result.text).toBe('12 months left');
      expect(result.tone).toBe('success');

      const date60Days = new Date(fixedNow.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRemainingValidity(date60Days, fixedNow).text).toBe('2 months left');

      const date30Days = new Date(fixedNow.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRemainingValidity(date30Days, fixedNow).text).toBe('1 month left');
    });

    test('formats weeks and days for 7 to 29 days (< 1 month)', () => {
      // 26 days -> 3 weeks and 5 days left
      const date26Days = new Date(fixedNow.getTime() + 26 * 24 * 60 * 60 * 1000).toISOString();
      const res26 = formatRemainingValidity(date26Days, fixedNow);
      expect(res26.text).toBe('3 weeks and 5 days left');
      expect(res26.tone).toBe('warning');

      // 28 days -> 4 weeks left
      const date28Days = new Date(fixedNow.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRemainingValidity(date28Days, fixedNow).text).toBe('4 weeks left');

      // 9 days -> 1 week and 2 days left
      const date9Days = new Date(fixedNow.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRemainingValidity(date9Days, fixedNow).text).toBe('1 week and 2 days left');
    });

    test('formats days for 1 to 6 days (< 1 week)', () => {
      const date6Days = new Date(fixedNow.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString();
      const res6 = formatRemainingValidity(date6Days, fixedNow);
      expect(res6.text).toBe('6 days left');
      expect(res6.tone).toBe('warning');

      const date1Day = new Date(fixedNow.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRemainingValidity(date1Day, fixedNow).text).toBe('1 day left');
    });

    test('formats hours for 1 to 23 hours (< 1 day)', () => {
      const date10Hours = new Date(fixedNow.getTime() + 10 * 60 * 60 * 1000).toISOString();
      const res10h = formatRemainingValidity(date10Hours, fixedNow);
      expect(res10h.text).toBe('10 hours left');
      expect(res10h.tone).toBe('danger');

      const date1Hour = new Date(fixedNow.getTime() + 1 * 60 * 60 * 1000).toISOString();
      expect(formatRemainingValidity(date1Hour, fixedNow).text).toBe('1 hour left');
    });

    test('formats minutes for < 1 hour', () => {
      const date10Mins = new Date(fixedNow.getTime() + 10 * 60 * 1000).toISOString();
      const res10m = formatRemainingValidity(date10Mins, fixedNow);
      expect(res10m.text).toBe('10 minutes left');
      expect(res10m.tone).toBe('danger');

      const date1Min = new Date(fixedNow.getTime() + 1 * 60 * 1000).toISOString();
      expect(formatRemainingValidity(date1Min, fixedNow).text).toBe('1 minute left');
    });

    test('formats expired for past dates (<= 0)', () => {
      const datePast = new Date(fixedNow.getTime() - 1000).toISOString();
      const resPast = formatRemainingValidity(datePast, fixedNow);
      expect(resPast.text).toBe('Expired');
      expect(resPast.tone).toBe('danger');
    });
  });
});
