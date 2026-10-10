import { Member, MemberFilterTab, MemberSortOption } from '../types';

/** "Expiring Soon" window in days (admin members list uses 30 days). */
export const EXPIRING_WINDOW_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Whole days remaining until `validTill` (end of that day).
 * Returns a negative number once the validity date has passed.
 */
export const getDaysRemaining = (validTill: string, now: Date = new Date()): number => {
  const end = new Date(validTill);
  if (Number.isNaN(end.getTime())) return 0;
  const endOfDay = new Date(end);
  endOfDay.setHours(23, 59, 59, 999);
  return Math.floor((endOfDay.getTime() - now.getTime()) / MS_PER_DAY);
};

export type ValidityTone = 'success' | 'warning' | 'danger';

/** Maps days-remaining to the semantic tone used by the validity text. */
export const getValidityTone = (daysRemaining: number): ValidityTone => {
  if (daysRemaining <= 0) return 'danger';
  if (daysRemaining <= EXPIRING_WINDOW_DAYS) return 'warning';
  return 'success';
};

/** "2,486" style grouping for counts. */
export const formatCount = (value: number): string => value.toLocaleString('en-IN');

export const matchesMemberFilterTab = (member: Member, tab: MemberFilterTab): boolean => {
  if (tab === 'ALL') return true;
  return member.status === tab;
};

export const matchesMemberSearch = (member: Member, rawQuery: string): boolean => {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;
  return (
    member.name.toLowerCase().includes(query) ||
    member.membershipId.toLowerCase().includes(query) ||
    member.phone.replace(/\s+/g, '').includes(query.replace(/\s+/g, '')) ||
    member.email.toLowerCase().includes(query)
  );
};

export const sortMembers = (members: Member[], sort: MemberSortOption): Member[] => {
  const copy = [...members];
  switch (sort) {
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'joined_desc':
      return copy.sort(
        (a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
      );
    case 'expiry_asc':
      return copy.sort(
        (a, b) => new Date(a.validTill).getTime() - new Date(b.validTill).getTime()
      );
    case 'default':
    default:
      return copy;
  }
};
