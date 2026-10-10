import { create } from 'zustand';
import { PermissionKey } from './permission.constants';
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
      const { permissions } = await permissionService.getMyPermissions();
      set({ permissions, isLoaded: true });
    } catch {
      // Leave the previous state; guards hide gated UI until a successful load.
      set({ permissions: [], isLoaded: false });
    }
  },

  setPermissions: permissions =>
    set({ permissions: [...new Set(permissions)].sort(), isLoaded: true }),

  clear: () => set({ permissions: [], isLoaded: false }),
}));

export type { PermissionKey };