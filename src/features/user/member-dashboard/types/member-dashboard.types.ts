export type MemberDashboardTab = 'overview' | 'activity' | 'learning' | 'membership';

export type MembershipStatus = 'active' | 'pending' | 'inactive';

export interface MemberMembershipRecord {
  status: MembershipStatus;
  category: string;
  memberName?: string;
  memberId?: string;
  joinedDate?: string;
  validUntil?: string;
}
