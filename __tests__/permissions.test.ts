import { can, canAny } from '../src/core/permissions/permissions';
import type { AppUser } from '../src/core/api/types';

function userWithRoles(roleNames: string[]): AppUser {
  return {
    id: 'u-1',
    full_name: 'Test Admin',
    mobile_number: '9888880001',
    email: 'admin@example.com',
    status: 'ACTIVE',
    roles: roleNames.map((name, index) => ({ id: `r-${index}`, name })),
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
}

describe('permission helper', () => {
  it('grants ADMIN the confirmed catalog permissions', () => {
    const admin = userWithRoles(['ADMIN']);
    expect(can(admin, 'assistance.review')).toBe(true);
    expect(can(admin, 'support.manage')).toBe(true);
  });

  it('denies non-admin roles the catalog permissions', () => {
    for (const roles of [['MEMBER'], ['DONOR'], ['DONATION_SEEKER']] as const) {
      const user = userWithRoles([...roles]);
      expect(can(user, 'assistance.review')).toBe(false);
      expect(can(user, 'support.manage')).toBe(false);
    }
  });

  it('denies everything for missing users and sessions', () => {
    expect(can(null, 'assistance.review')).toBe(false);
    expect(can(undefined, 'support.manage')).toBe(false);
  });

  it('handles users with multiple roles', () => {
    const mixed = userWithRoles(['DONOR', 'ADMIN']);
    expect(can(mixed, 'support.manage')).toBe(true);
  });

  it('canAny requires at least one matching permission', () => {
    const admin = userWithRoles(['ADMIN']);
    const member = userWithRoles(['MEMBER']);
    expect(canAny(admin, ['assistance.review', 'support.manage'])).toBe(true);
    expect(canAny(member, ['assistance.review', 'support.manage'])).toBe(false);
    expect(canAny(null, ['assistance.review'])).toBe(false);
  });

  it('never grants permissions by role string alone outside the catalog', () => {
    // Guarding the documented rule: role === 'ADMIN' must not be used as an
    // ad-hoc check; everything flows through the permission catalog.
    const admin = userWithRoles(['ADMIN']);
    expect(can(admin, 'support.resolve' as never)).toBe(false);
  });
});
