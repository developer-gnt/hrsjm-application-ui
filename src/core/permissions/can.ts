import { usePermissionStore } from './permission.store';

/**
 * Imperative permission checks (rule.md §3). For React rendering use the
 * reactive `useCan`/`useCanAny` hooks so UI re-evaluates when the permission
 * set changes.
 *
 *   can('payment.verify')
 *   canAny(['role.read', 'permission.read'])
 */
export const can = (permission: string): boolean =>
  usePermissionStore.getState().permissions.includes(permission);

export const canAny = (permissions: string[]): boolean =>
  permissions.some(permission => can(permission));

export const canAll = (permissions: string[]): boolean =>
  permissions.every(permission => can(permission));

/** Reactive single-permission check for components. */
export const useCan = (permission: string): boolean =>
  usePermissionStore(state => state.permissions.includes(permission));

/** Reactive any-of check for components. */
export const useCanAny = (permissions: string[]): boolean =>
  usePermissionStore(state => permissions.some(p => state.permissions.includes(p)));