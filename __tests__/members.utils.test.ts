import {
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
});
