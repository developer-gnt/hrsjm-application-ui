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

/**
 * Formats time remaining until `validTill` with intelligent granularity:
 * - >= 1 month (>= 30 days): formatted in months (e.g. "12 months left", "1 month left")
 * - < 1 month & >= 1 week (7-29 days): formatted in weeks and remaining days (e.g. "4 weeks and 2 days left", "3 weeks left")
 * - < 1 week & >= 1 day (1-6 days): formatted in days (e.g. "6 days left", "1 day left")
 * - < 1 day & >= 1 hour (1-23 hours): formatted in hours (e.g. "10 hours left", "1 hour left")
 * - < 1 hour (1-59 minutes): formatted in minutes (e.g. "10 minutes left", "1 minute left")
 * - <= 0: "Expired"
 */
export const formatRemainingValidity = (
  validTill?: string | Date | null,
  now: Date = new Date(),
): { text: string; tone: ValidityTone } => {
  if (!validTill) return { text: '—', tone: 'success' };
  const end = new Date(validTill);
  if (Number.isNaN(end.getTime())) return { text: '—', tone: 'success' };

  // If input is date-only (e.g. "2027-10-06"), default to end of that calendar day.
  const isDateOnly =
    typeof validTill === 'string' &&
    !validTill.includes('T') &&
    !validTill.includes(':');
  const targetMs = isDateOnly
    ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).getTime()
    : end.getTime();

  const diffMs = targetMs - now.getTime();

  if (diffMs <= 0) {
    return { text: 'Expired', tone: 'danger' };
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // 1. Less than 1 hour (< 60 minutes)
  if (diffHours < 1) {
    const mins = Math.max(1, diffMinutes);
    return {
      text: `${mins} ${mins === 1 ? 'minute' : 'minutes'} left`,
      tone: 'danger',
    };
  }

  // 2. Less than 1 day (< 24 hours)
  if (diffDays < 1) {
    return {
      text: `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} left`,
      tone: 'danger',
    };
  }

  // 3. Less than 1 week (1 to 6 days)
  if (diffDays < 7) {
    return {
      text: `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`,
      tone: 'warning',
    };
  }

  // 4. Less than 1 month (7 to 29 days) -> Weeks and Days
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const remDays = diffDays % 7;
    const weekPart = `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    const tone: ValidityTone = 'warning';

    if (remDays === 0) {
      return { text: `${weekPart} left`, tone };
    }
    const dayPart = `${remDays} ${remDays === 1 ? 'day' : 'days'}`;
    return { text: `${weekPart} and ${dayPart} left`, tone };
  }

  // 5. 1 month or more (>= 30 days) -> Months
  const months = Math.round(diffDays / 30.4375);
  const finalMonths = Math.max(1, months);
  return {
    text: `${finalMonths} ${finalMonths === 1 ? 'month' : 'months'} left`,
    tone: 'success',
  };
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
