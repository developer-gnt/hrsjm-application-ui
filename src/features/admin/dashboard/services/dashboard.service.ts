import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type {
  AdminDashboardResponse,
  AdminMemberItem,
  AssistanceRequestItem,
} from '../types/dashboard.types';

/** GET /admin/dashboard — all dashboard KPIs, breakdowns and feeds in one call. */
export const getAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  const response = await apiClient.get<AdminDashboardResponse>(
    ApiRoutes.ADMIN.DASHBOARD,
  );
  return response.data;
};

/** GET /admin/members — recent members feed (first page, smallest slice). */
export const getRecentMembers = async (limit = 5): Promise<AdminMemberItem[]> => {
  const response = await apiClient.get<{
    items: AdminMemberItem[];
    meta: { total: number };
  }>(ApiRoutes.ADMIN.MEMBERS, { params: { page: 1, limit } });
  return response.data.items;
};

/** GET /assistance-requests — recent applications feed. */
export const getRecentApplications = async (
  limit = 5,
): Promise<AssistanceRequestItem[]> => {
  const response = await apiClient.get<{
    items: AssistanceRequestItem[];
    meta: { total: number };
  }>(ApiRoutes.ASSISTANCE_REQUESTS, { params: { page: 1, limit } });
  return response.data.items;
};
