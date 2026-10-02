import { Member, MemberStats } from '../types';

/** ISO date shifted by `days` from now — keeps mock data deterministic and plausible. */
const daysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

/**
 * Mock member directory for UI development (no API integration in this phase).
 * Names/IDs mirror the approved Members reference screen; validity dates are
 * generated relative to today so "days left" always reads sensibly.
 */
export const MEMBER_STATS: MemberStats = {
  total: 2486,
  active: 2124,
  expiringSoon: 284,
  inactive: 78,
};

export const MOCK_MEMBERS: Member[] = [
  {
    id: 'mem-001',
    name: 'Aman Shaikh',
    phone: '+91 98765 43210',
    email: 'aman@gmail.com',
    membershipId: 'HRSJM202600123',
    joinedDate: daysFromNow(-16),
    validTill: daysFromNow(352),
    status: 'ACTIVE',
  },
  {
    id: 'mem-002',
    name: 'Sanjya Khan',
    phone: '+91 98765 43211',
    email: 'sanjya@gmail.com',
    membershipId: 'HRSJM202600124',
    joinedDate: daysFromNow(-372),
    validTill: daysFromNow(12),
    status: 'EXPIRING_SOON',
  },
  {
    id: 'mem-003',
    name: 'Rohit Verma',
    phone: '+91 98765 43212',
    email: 'rohit@gmail.com',
    membershipId: 'HRSJM202600125',
    joinedDate: daysFromNow(-388),
    validTill: daysFromNow(342),
    status: 'ACTIVE',
  },
  {
    id: 'mem-004',
    name: 'Faiza Ansari',
    phone: '+91 98765 43213',
    email: 'faiza@gmail.com',
    membershipId: 'HRSJM202600126',
    joinedDate: daysFromNow(-394),
    validTill: daysFromNow(-30),
    status: 'INACTIVE',
  },
  {
    id: 'mem-005',
    name: 'Imran Qureshi',
    phone: '+91 98765 43214',
    email: 'imran@gmail.com',
    membershipId: 'HRSJM202600127',
    joinedDate: daysFromNow(-406),
    validTill: daysFromNow(326),
    status: 'ACTIVE',
  },
  {
    id: 'mem-006',
    name: 'Neha Kapoor',
    phone: '+91 98765 43215',
    email: 'neha@gmail.com',
    membershipId: 'HRSJM202600128',
    joinedDate: daysFromNow(-408),
    validTill: daysFromNow(5),
    status: 'EXPIRING_SOON',
  },
  {
    id: 'mem-007',
    name: 'Karan Mehta',
    phone: '+91 98765 43216',
    email: 'karan@gmail.com',
    membershipId: 'HRSJM202600129',
    joinedDate: daysFromNow(-414),
    validTill: daysFromNow(318),
    status: 'ACTIVE',
  },
  {
    id: 'mem-008',
    name: 'Shabana Taj',
    phone: '+91 98765 43217',
    email: 'shabana@gmail.com',
    membershipId: 'HRSJM202600130',
    joinedDate: daysFromNow(-418),
    validTill: daysFromNow(-54),
    status: 'INACTIVE',
  },
];
