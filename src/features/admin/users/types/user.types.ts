export type UserType = 'member' | 'seeker' | 'donor' | 'general';

export type UserStatus = 'active' | 'pending' | 'blocked';

export type UserGender = 'Male' | 'Female' | 'Other';

export interface UserVerificationDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize?: string;
  fileType: string;
  fileUri?: string;
  uploadedAt?: string;
  verified?: boolean;
}

export interface UserItem {
  id: string;
  memberId?: string;
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  status: UserStatus;
  avatarUrl?: string;
  joinedDate: string; // ISO string or human string
  lastLogin?: string;
  totalDonations?: number;
  donationCount?: number;
  dob?: string;
  gender?: UserGender;
  address?: string;
  documents?: UserVerificationDocument[];
  notes?: string;
  remarks?: string;
}

export interface UserStats {
  total: number;
  active: number;
  pending: number;
  blocked: number;
  membersCount: number;
  seekersCount: number;
  donorsCount: number;
  generalCount: number;
}

export type UserTypeTabKey = 'all' | UserType;

export type UserSortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc';

export interface UserFilterOptions {
  typeTab?: UserTypeTabKey;
  status?: 'all' | UserStatus;
  searchQuery?: string;
  joinedFrom?: string;
  joinedTo?: string;
  sortBy?: UserSortOption;
}

export interface AddUserPayload {
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  password?: string;
  dob?: string;
  gender?: UserGender;
  address?: string;
  avatarUrl?: string;
  status?: UserStatus;
}

export interface EditUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  userType?: UserType;
  status?: UserStatus;
  dob?: string;
  gender?: UserGender;
  address?: string;
  avatarUrl?: string;
  remarks?: string;
  notes?: string;
}
