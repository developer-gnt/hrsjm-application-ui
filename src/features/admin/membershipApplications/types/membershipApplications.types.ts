export type ApplicationStatus = 'under_review' | 'approved' | 'rejected';

export interface MembershipApplicationItem {
  id: string;
  applicationId: string;
  applicantName: string;
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
  occupation?: string;
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
