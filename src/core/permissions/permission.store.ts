import { create } from 'zustand';
import { ALL_PERMISSION_KEYS, PermissionKey } from './permission.constants';
import { permissionService } from './permission.service';

interface PermissionState {
  /** Effective permission keys for the signed-in user (deduped, sorted). */
  permissions: string[];
  /** True once the list has been fetched after the latest login/refresh. */
  isLoaded: boolean;

  loadPermissions: () => Promise<void>;
  setPermissions: (permissions: string[]) => void;
  clear: () => void;
}

/**
 * Session-scoped permission store (client state per rule.md §5). Loaded by the
 * auth store right after login/register/session-restore; cleared on logout or
 * session expiry. Navigation guards and `can()` read from here.
 */
export const usePermissionStore = create<PermissionState>()(set => ({
  permissions: [],
  isLoaded: false,

  loadPermissions: async () => {
    try {
      const res: any = await permissionService.getMyPermissions();
      const rawPerms =
        res?.permissions ||
        res?.data?.permissions ||
        (Array.isArray(res) ? res : []);
      const perms = Array.isArray(rawPerms) ? rawPerms : [];
      set({ permissions: perms, isLoaded: true });
    } catch {
      // If endpoint is unreachable, fallback to full admin permissions if user is Admin
      try {
        const { useAuthStore } = require('../../features/auth/store/authStore');
        const user = useAuthStore.getState().user;
        const roleNames = [
          ...(user?.roles || []).map((r: any) =>
            typeof r === 'string' ? r : r?.name || '',
          ),
          user?.role?.name,
          user?.roleName,
          user?.account_type,
          user?.role,
        ]
          .filter(Boolean)
          .map((r: string) => String(r).toUpperCase());

        if (
          roleNames.includes('ADMIN') ||
          roleNames.includes('SUPER_ADMIN') ||
          roleNames.includes('SUPERADMIN')
        ) {
          set({ permissions: ALL_PERMISSION_KEYS, isLoaded: true });
          return;
        }
      } catch {}

      // Leave the previous state; guards hide gated UI until a successful load.
      set({ permissions: [], isLoaded: false });
    }
  },

  setPermissions: permissions =>
    set({ permissions: [...new Set(permissions)].sort(), isLoaded: true }),

  clear: () => set({ permissions: [], isLoaded: false }),
}));

export type { PermissionKey };
