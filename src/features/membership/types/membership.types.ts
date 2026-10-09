export type MembershipStatus = 'Under Review' | 'Approved' | 'Rejected' | 'Draft';

export type MembershipType = 'Individual Membership' | 'Annual Membership' | 'Lifetime Membership' | 'Student Membership';

export interface PersonalInfo {
  profilePhotoUri?: string;
  fullName: string;
  dateOfBirth: string; // DD/MM/YYYY or YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other' | '';
  countryCode: string; // e.g. '+91'
  mobileNumber: string;
  email: string;
}

export interface AddressInfo {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface DocumentItem {
  type: 'identity' | 'address' | 'photo';
  name: string;
  fileName?: string;
  fileSize?: string;
  fileUri?: string;
  isUploaded: boolean;
  error?: string;
}

export interface DocumentUploads {
  identityProof?: DocumentItem;
  addressProof?: DocumentItem;
  photograph?: DocumentItem;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  dateTime?: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface MembershipApplicationRecord {
  id: string;
  applicationId: string;
  membershipId?: string;
  membershipType: MembershipType;
  status: MembershipStatus;
  submittedAt: string; // e.g. '14 Sep 2026, 04:15 PM'
  approvedAt?: string; // e.g. '18 Sep 2026, 10:30 AM'
  rejectedAt?: string; // e.g. '16 Sep 2026, 02:40 PM'
  validFrom?: string; // e.g. '14 Sep 2026'
  validTill?: string; // e.g. '14 Sep 2027'
  rejectionReason?: string;
  personalInfo: PersonalInfo;
  addressInfo: AddressInfo;
  documents: DocumentUploads;
  timeline: TimelineEvent[];
}
