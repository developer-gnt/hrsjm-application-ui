import type { AppUser, UserRole } from '../api/types';

// Permission identifiers documented by the development phase plan:
//   assistance.read / assistance.approve / assistance.reject / assistance.manage_status
// The implemented backend currently authorizes with roles only (no permission
// catalog yet), so this map is the single alignment point. When the backend
// ships a permission catalog, replace ROLE_PERMISSIONS with the real claims.
export type Permission =
  | 'assistance.read'
  | 'assistance.approve'
  | 'assistance.reject'
  | 'assistance.manage_status';

const ASSISTANCE_REVIEW_PERMISSIONS: Permission[] = [
  'assistance.read',
  'assistance.approve',
  'assistance.reject',
  'assistance.manage_status',
];

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [...ASSISTANCE_REVIEW_PERMISSIONS],
  MEMBER: [],
  DONOR: [],
  DONATION_SEEKER: [],
};

export function can(user: AppUser | null | undefined, permission: Permission): boolean {
  if (!user) {
    return false;
  }
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
}

export function canAny(
  user: AppUser | null | undefined,
  permissions: Permission[],
): boolean {
  return permissions.some(permission => can(user, permission));
}
