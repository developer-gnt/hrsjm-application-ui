import type { ImageSourcePropType } from 'react-native';

/** Member lifecycle status shown as the row pill. */
export type MemberStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'INACTIVE';

export type MemberFilterTab = 'ALL' | MemberStatus;

export type MemberSortOption =
  | 'default' // as returned by the source list
  | 'name_asc'
  | 'joined_desc'
  | 'expiry_asc';

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  /** Display membership number, e.g. HRSJM202600123. */
  membershipId: string;
  /** ISO date string. */
  joinedDate: string;
  /** ISO date string — membership validity end. */
  validTill: string;
  status: MemberStatus;
  /** Optional member photo; initials avatar is used as fallback. */
  photo?: ImageSourcePropType | { uri: string };
  categoryName?: string;
  rawBackend?: unknown;
}

/** Aggregate counts for the statistics cards / filter tabs. */
export interface MemberStats {
  total: number;
  active: number;
  expiringSoon: number;
  inactive: number;
}
