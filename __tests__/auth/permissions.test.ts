import { can, canAny, canAll } from '../../src/core/permissions/can';
import { usePermissionStore } from '../../src/core/permissions/permission.store';
import {
  ALL_PERMISSION_KEYS,
  PermissionKeys,
} from '../../src/core/permissions/permission.constants';

/**
 * Dynamic permission engine (rule.md §3): `can()` must read backend-resolved
 * keys, never assume a role name implies anything.
 */
describe('permission engine', () => {
  beforeEach(() => {
    usePermissionStore.setState({ permissions: [], isLoaded: true });
  });

  it('denies everything when no permissions are loaded', () => {
    expect(can(PermissionKeys.PAYMENT_VERIFY)).toBe(false);
    expect(canAny([PermissionKeys.PAYMENT_VERIFY])).toBe(false);
    expect(canAll([PermissionKeys.PAYMENT_VERIFY])).toBe(false);
  });

  it('grants only the keys that were loaded', () => {
    usePermissionStore.setState({
      permissions: [PermissionKeys.PAYMENT_READ, PermissionKeys.PAYMENT_VERIFY],
    });

    expect(can(PermissionKeys.PAYMENT_VERIFY)).toBe(true);
    expect(can(PermissionKeys.EXPENSE_CREATE)).toBe(false);
    expect(canAny([PermissionKeys.EXPENSE_CREATE, PermissionKeys.PAYMENT_READ])).toBe(true);
    expect(canAny([PermissionKeys.EXPENSE_CREATE])).toBe(false);
    expect(canAll([PermissionKeys.PAYMENT_READ, PermissionKeys.PAYMENT_VERIFY])).toBe(true);
    expect(canAll([PermissionKeys.PAYMENT_READ, PermissionKeys.ROLE_READ])).toBe(false);
  });

  it('reflects store changes immediately (session lifecycle)', () => {
    usePermissionStore.setState({ permissions: [PermissionKeys.ROLE_READ] });
    expect(can(PermissionKeys.ROLE_READ)).toBe(true);

    // Logout / session expiry clears the set.
    usePermissionStore.getState().clear();
    expect(can(PermissionKeys.ROLE_READ)).toBe(false);
    expect(usePermissionStore.getState().isLoaded).toBe(false);
  });

  it('notifies store subscribers on change (the basis of useCan reactivity)', () => {
    const seen: string[][] = [];
    const unsubscribe = usePermissionStore.subscribe(state =>
      seen.push(state.permissions),
    );

    usePermissionStore.setState({ permissions: [PermissionKeys.MEMBERSHIP_READ] });
    usePermissionStore.getState().clear();
    unsubscribe();

    expect(seen).toEqual([[PermissionKeys.MEMBERSHIP_READ], []]);
  });

  it('ships the full 53-key backend catalog', () => {
    expect(ALL_PERMISSION_KEYS).toHaveLength(53);
    // Keys are dotted module.action strings.
    for (const key of ALL_PERMISSION_KEYS) {
      expect(key).toMatch(/^[a-z_]+\.[a-z_]+$/);
    }
  });

  it('dedupes and sorts on setPermissions', () => {
    usePermissionStore.getState().setPermissions([
      PermissionKeys.ROLE_READ,
      PermissionKeys.PAYMENT_VERIFY,
      PermissionKeys.ROLE_READ,
    ]);
    expect(usePermissionStore.getState().permissions).toEqual(
      [PermissionKeys.PAYMENT_VERIFY, PermissionKeys.ROLE_READ].sort(),
    );
  });
});