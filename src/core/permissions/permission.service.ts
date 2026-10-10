import { apiClient } from '../api/client';
import { ApiRoutes } from '../constants/api-routes';

/** Response of GET /users/me/permissions (backend UsersController). */
export interface MePermissionsResponse {
  user_id: string;
  permissions: string[];
}

/**
 * Permission service — fetches the signed-in user's effective permission keys
 * (aggregated across their roles server-side). No other module may resolve
 * permissions from role names directly (rule.md §3).
 */
export const permissionService = {
  async getMyPermissions(): Promise<MePermissionsResponse> {
    const response = await apiClient.get<MePermissionsResponse>(
      ApiRoutes.USERS.ME_PERMISSIONS,
    );
    return response.data;
  },
};