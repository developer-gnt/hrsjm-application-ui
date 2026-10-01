import { can, canAny } from '../src/core/permissions/permissions';
import type { AppUser } from '../src/core/api/types';

function userWithRole(role: AppUser['role']): AppUser {
  return {
    id: 'u-1',
    fullName: 'Test Admin',
    email: 'admin@example.com',
    role,
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('permission helper', () => {
  it('grants ADMIN the documented assistance permissions', () => {
    const admin = userWithRole('ADMIN');
    expect(can(admin, 'assistance.read')).toBe(true);
    expect(can(admin, 'assistance.approve')).toBe(true);
    expect(can(admin, 'assistance.reject')).toBe(true);
    expect(can(admin, 'assistance.manage_status')).toBe(true);
  });

  it('denies non-admin roles the assistance permissions', () => {
    for (const role of ['MEMBER', 'DONOR', 'DONATION_SEEKER'] as const) {
      const user = userWithRole(role);
      expect(can(user, 'assistance.read')).toBe(false);
      expect(can(user, 'assistance.approve')).toBe(false);
      expect(can(user, 'assistance.reject')).toBe(false);
    }
  });

  it('denies everything for missing users and sessions', () => {
    expect(can(null, 'assistance.read')).toBe(false);
    expect(can(undefined, 'assistance.approve')).toBe(false);
  });

  it('canAny requires at least one matching permission', () => {
    const admin = userWithRole('ADMIN');
    const member = userWithRole('MEMBER');
    expect(canAny(admin, ['assistance.approve', 'assistance.reject'])).toBe(true);
    expect(canAny(member, ['assistance.approve', 'assistance.reject'])).toBe(false);
    expect(canAny(null, ['assistance.read'])).toBe(false);
  });

  it('never grants permissions by role string alone outside the catalog', () => {
    // Guarding the documented rule: role === 'ADMIN' must not be used as an
    // ad-hoc check; everything flows through the permission catalog.
    const admin = userWithRole('ADMIN');
    expect(can(admin, 'support.resolve' as never)).toBe(false);
  });
});
