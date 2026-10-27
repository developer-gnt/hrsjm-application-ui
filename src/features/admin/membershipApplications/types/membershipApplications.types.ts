export type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';
export type ApplicationAccountType = 'membership' | 'seeker';

export function getApplicationAccountType(app?: {
  accountType?: string;
  membershipType?: string;
  applicationId?: string;
}): ApplicationAccountType {
  if (!app) return 'membership';
  if (app.accountType === 'seeker') return 'seeker';
  if (app.accountType === 'membership') return 'membership';
  const type = (app.membershipType || '').toLowerCase();
  const id = (app.applicationId || '').toUpperCase();
  if (type.includes('seeker') || id.startsWith('HRSJM-SEK')) {
    return 'seeker';
  }
  return 'membership';
}

export interface MembershipApplicationItem {
  id: string;
  applicationId: string;
  applicantName: string;
  accountType?: ApplicationAccountType;
  membershipType: string;
  avatarUrl?: string;
  status: ApplicationStatus;
  submittedAt: string; // formatted date string, e.g. "15 Sep 2026, 11:30 AM"
  submittedDate: string; // ISO date for sorting
  phone?: string;
  email?: string;
  gender?: string;
  dob?: string;
  fatherName?: string;
  address?: string;
  policeStation?: string;
  occupation?: string;
  rejectionReason?: string;
  documents?: {
    id: string;
    title: string;
    fileName: string;
    fileSize: string;
    uploadDate: string;
    uri?: string;
  }[];
  activityLog?: {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    status: ApplicationStatus | 'submitted';
  }[];
}

export interface ApplicationStatsData {
  total: number;
  underReview: number;
  approved: number;
  rejected: number;
}
