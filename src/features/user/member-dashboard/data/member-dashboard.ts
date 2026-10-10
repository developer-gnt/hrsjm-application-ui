import type { UserEvent } from '../../events/data/user-events';
import type { MemberMembershipRecord } from '../types/member-dashboard.types';

export const MOCK_ACTIVE_MEMBERSHIP: MemberMembershipRecord = {
  status: 'active',
  category: 'Individual Member',
  memberName: 'Amaan Shaikh',
  memberId: 'HRSJM202600123',
  joinedDate: '15 Sep 2026',
  validUntil: '15 Sep 2027',
};

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const getEventDate = (event: UserEvent): Date | undefined => {
  const match = /^(\d{1,2})\s+([a-z]{3})\s+(\d{4})$/i.exec(event.date.trim());
  if (!match) {
    return undefined;
  }

  const day = Number(match[1]);
  const month = MONTHS[match[2].toLowerCase()];
  const year = Number(match[3]);
  if (month === undefined) {
    return undefined;
  }

  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
};

export const getUpcomingMemberEvents = (
  events: UserEvent[],
  now: Date,
): UserEvent[] => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return events
    .filter(event => {
      const date = getEventDate(event);
      return date !== undefined && date.getTime() >= today;
    })
    .sort((first, second) => {
      const firstDate = getEventDate(first);
      const secondDate = getEventDate(second);
      return (firstDate?.getTime() ?? 0) - (secondDate?.getTime() ?? 0);
    });
};
