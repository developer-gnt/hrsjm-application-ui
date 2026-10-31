import { usePermissionStore } from './permission.store';
import { useAuthStore } from '../../features/auth/store/authStore';

/**
 * Checks whether the current user holds Administrator privileges (ADMIN or SUPER_ADMIN).
 * Admin accounts inherently possess universal access across all admin features.
 */
export const isUserAdmin = (user?: any): boolean => {
  let currentUser = user || useAuthStore.getState().user;

  if (!currentUser) {
    try {
      const { appStorage } = require('../storage/app-storage');
      const { StorageKeys } = require('../constants/storage-keys');
      const raw = appStorage.getString(StorageKeys.USER_DATA);
      if (raw) currentUser = JSON.parse(raw);
    } catch {}
  }

  if (!currentUser && typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem('__hrsjm_secure_session');
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.user) currentUser = session.user;
      }
    } catch {}
  }

  if (!currentUser) {
    return false;
  }

  const roleNames = [
    ...(currentUser.roles || []).map((r: any) =>
      typeof r === 'string' ? r : r?.name || r?.role || r?.role_name || '',
    ),
    currentUser.role?.name,
    currentUser.role?.role,
    currentUser.roleName,
    currentUser.role_name,
    currentUser.account_type,
    currentUser.accountType,
    currentUser.role,
  ]
    .filter(Boolean)
    .map((r: string) => String(r).toUpperCase());

  return (
    roleNames.includes('ADMIN') ||
    roleNames.includes('SUPER_ADMIN') ||
    roleNames.includes('SUPERADMIN') ||
    roleNames.some((r: string) => r.includes('ADMIN')) ||
    String(currentUser.account_type || '').toLowerCase() === 'admin' ||
    String(currentUser.accountType || '').toLowerCase() === 'admin'
  );
};

/**
 * Imperative permission checks (rule.md §3). For React rendering use the
 * reactive `useCan`/`useCanAny` hooks so UI re-evaluates when the permission
 * set changes.
 *
 *   can('payment.verify')
 *   canAny(['role.read', 'permission.read'])
 */
export const can = (permission: string): boolean => {
  if (isUserAdmin()) return true;
  return usePermissionStore.getState().permissions.includes(permission);
};

export const canAny = (permissions: string[]): boolean => {
  if (isUserAdmin()) return true;
  return permissions.some(permission => can(permission));
};

export const canAll = (permissions: string[]): boolean => {
  if (isUserAdmin()) return true;
  return permissions.every(permission => can(permission));
};

/** Reactive single-permission check for components. */
export const useCan = (permission: string): boolean => {
  const user = useAuthStore(state => state.user);
  const permissions = usePermissionStore(state => state.permissions);
  if (isUserAdmin(user)) return true;
  return permissions.includes(permission);
};

/** Reactive any-of check for components. */
export const useCanAny = (permissions: string[]): boolean => {
  const user = useAuthStore(state => state.user);
  const userPermissions = usePermissionStore(state => state.permissions);
  if (isUserAdmin(user)) return true;
  return permissions.some(p => userPermissions.includes(p));
};
