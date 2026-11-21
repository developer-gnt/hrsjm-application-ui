/** Small formatting helpers shared across the profile feature. */

export type IdCardRoleType = 'admin' | 'seeker' | 'member' | 'user';

export interface IdCardRoleInfo {
  roleType: IdCardRoleType;
  idLabel: 'Admin ID' | 'Seeker ID' | 'Member ID' | 'User ID';
  defaultPrefix: string;
  defaultMembershipType: string;
}

export const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return ((parts[0]?.substring(0, 2) as string) || 'AU').toUpperCase();
};

/**
 * Resolves user role type and appropriate ID label based on role name,
 * membership category, and raw roles list.
 *
 * Rules:
 *  - General User        -> "User ID"
 *  - Donor / Seeker      -> "Seeker ID"
 *  - Registered Member   -> "Member ID"
 *  - Administrator       -> "Admin ID"
 */
export const resolveIdCardRole = (
  role?: string,
  membershipType?: string,
  rawRoles?: Array<{ name?: string }> | string[],
): IdCardRoleInfo => {
  let roleNames: string[] = [];
  if (Array.isArray(rawRoles)) {
    roleNames = rawRoles.map(r =>
      (typeof r === 'string' ? r : r?.name || '').toUpperCase(),
    );
  }

  const roleText = (role || '').toLowerCase();
  const membershipText = (membershipType || '').toLowerCase();
  const combined = `${roleText} ${membershipText}`;

  // 1. Admin / Super Admin
  if (
    roleNames.includes('ADMIN') ||
    roleNames.includes('SUPER_ADMIN') ||
    combined.includes('admin')
  ) {
    return {
      roleType: 'admin',
      idLabel: 'Admin ID',
      defaultPrefix: 'ADMIN',
      defaultMembershipType: 'Executive Member',
    };
  }

  // 2. Seeker / Donation Seeker / Donor Seeker
  if (
    roleNames.includes('SEEKER') ||
    roleNames.includes('DONATION_SEEKER') ||
    combined.includes('seeker') ||
    combined.includes('donar') ||
    combined.includes('donor')
  ) {
    return {
      roleType: 'seeker',
      idLabel: 'Seeker ID',
      defaultPrefix: 'SEEKER',
      defaultMembershipType: 'Donation Seeker',
    };
  }

  // 3. Member
  if (
    roleNames.includes('MEMBER') ||
    combined.includes('member')
  ) {
    return {
      roleType: 'member',
      idLabel: 'Member ID',
      defaultPrefix: 'HRSJM-',
      defaultMembershipType: 'Individual Member',
    };
  }

  // 4. Default: User
  return {
    roleType: 'user',
    idLabel: 'User ID',
    defaultPrefix: 'USER',
    defaultMembershipType: 'General User',
  };
};

/**
 * Generates or normalizes a role-appropriate ID code ensuring it is never empty.
 */
export const generateRoleSpecificId = (
  roleType: IdCardRoleType,
  userId?: string,
  existingId?: string,
): string => {
  if (existingId && existingId.trim().length > 0) {
    const trimmed = existingId.trim();
    if (roleType === 'admin' && trimmed.startsWith('ADMIN')) return trimmed;
    if (roleType === 'seeker' && trimmed.startsWith('SEEKER')) return trimmed;
    if (roleType === 'user' && trimmed.startsWith('USER')) return trimmed;
    if (
      roleType === 'member' &&
      !trimmed.startsWith('ADMIN') &&
      !trimmed.startsWith('SEEKER') &&
      !trimmed.startsWith('USER')
    ) {
      return trimmed;
    }
  }

  const digits = (userId || '').replace(/\D/g, '');
  const suffix3 = digits ? digits.slice(-3).padStart(3, '0') : '001';
  const suffix4 = digits ? digits.slice(-4).padStart(4, '0') : '0001';
  const suffix5 = digits ? digits.slice(-5).padStart(5, '0') : '00001';

  switch (roleType) {
    case 'admin':
      return `ADMIN${suffix3}`;
    case 'seeker':
      return `SEEKER${suffix4}`;
    case 'member':
      return `HRSJM-${suffix5}`;
    case 'user':
    default:
      return `USER${suffix4}`;
  }
};
