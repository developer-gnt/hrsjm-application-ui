/**
 * Admin profile domain models. UI-phase data lives in the local
 * profile store (`profileStore.ts`); when the `/api/v1` admin profile
 * endpoints land, services will map their DTOs onto these types so the
 * screens and components below stay untouched.
 */

export type AccountStatus = 'Active' | 'Inactive' | 'Suspended';

/** Values editable through the Edit Personal Information screen. */
export interface PersonalInfoInput {
  fullName: string;
  email: string;
  phone: string;
}

/** Values editable through the Admin Details screen. */
export interface AdminDetailsInput {
  role: string;
  department: string;
  accountStatus: AccountStatus;
}

/** Complete profile shown across the My Profile flow. */
export interface AdminProfile extends PersonalInfoInput, AdminDetailsInput {
  /** Signed-in admin account display name (summary card). */
  accountName: string;
  /** Administrator identifier shown as the ADMIN001 badge. */
  adminId: string;
  /** Membership card identity (My ID Card section). */
  membershipType: string;
  memberId: string;
  dateOfBirth: string;
  memberSince: string;
  validTill: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof PersonalInfoInput, string>>;
}
