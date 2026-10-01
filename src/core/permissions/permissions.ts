import type { AppUser, UserRoleName } from '../api/types';

// Permission catalog confirmed against the implemented backend
// (migrations CreateArshadModulesSchema seed): assistance.review, support.manage.
// Both are granted to the baseline ADMIN role. The backend authorizes each
// endpoint with @RequirePermissions - this helper mirrors that catalog for UI
// gating only; backend authorization stays authoritative.
export type Permission = 'assistance.review' | 'support.manage';

// Role -> permissions map, kept as the single alignment point when the backend
// grants permissions to additional roles.
const ROLE_PERMISSIONS: Record<UserRoleName, Permission[]> = {
  ADMIN: ['assistance.review', 'support.manage'],
  MEMBER: [],
  DONOR: [],
  DONATION_SEEKER: [],
};

function roleNames(user: AppUser | null | undefined): string[] {
  return (user?.roles ?? [])
    .map(role => role?.name)
    .filter((name): name is string => typeof name === 'string');
}

export function can(user: AppUser | null | undefined, permission: Permission): boolean {
  return roleNames(user).some(
    name => ROLE_PERMISSIONS[name as UserRoleName]?.includes(permission) ?? false,
  );
}

export function canAny(
  user: AppUser | null | undefined,
  permissions: Permission[],
): boolean {
  return permissions.some(permission => can(user, permission));
}
