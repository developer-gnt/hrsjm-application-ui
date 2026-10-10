import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminDashboard,
  getRecentApplications,
  getRecentMembers,
} from '../services/dashboard.service';
import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import { ApiError } from '../../../../core/api/api-error';

export const DASHBOARD_QUERY_KEYS = {
  dashboard: ['admin', 'dashboard'] as const,
  recentMembers: ['admin', 'recent-members'] as const,
  recentApplications: ['admin', 'recent-applications'] as const,
};

/** Dashboard KPIs, breakdowns, growth series and recent-activity feed. */
export const useDashboard = () =>
  useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.dashboard,
    queryFn: getAdminDashboard,
    staleTime: 30_000,
  });

/** Recent members list for the dashboard card. */
export const useRecentMembers = (limit = 5) =>
  useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.recentMembers,
    queryFn: () => getRecentMembers(limit),
    staleTime: 30_000,
  });

/** Recent assistance applications list for the dashboard card. */
export const useRecentApplications = (limit = 5) =>
  useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.recentApplications,
    queryFn: () => getRecentApplications(limit),
    staleTime: 30_000,
  });

/** Unread notification count for the header bell badge (GET /notifications/me). */
export const useUnreadNotifications = () =>
  useQuery({
    queryKey: ['notifications', 'me', 'unread-count'] as const,
    queryFn: async (): Promise<number> => {
      const response = await apiClient.get<{ unread_count: number }>(
        ApiRoutes.NOTIFICATIONS.ME,
        { params: { page: 1, limit: 1 } },
      );
      return response.data.unread_count ?? 0;
    },
    staleTime: 30_000,
  });

/** Pull-to-refresh: revalidates every dashboard query at once. */
export const useDashboardRefresh = () => {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.dashboard }),
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.recentMembers }),
      queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY_KEYS.recentApplications,
      }),
    ]);
  }, [queryClient]);
};

/** Extracts a human-friendly message from a failed dashboard query. */
export const dashboardErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.statusCode === 0) {
      return 'Cannot reach the HRSJM server. Check your connection and try again.';
    }
    if (error.statusCode === 401) {
      return 'Your session has expired. Please log in again.';
    }
    if (error.statusCode === 403) {
      return 'Your role does not have access to the admin dashboard.';
    }
    return error.message;
  }
  return 'Something went wrong while loading the dashboard. Please try again.';
};
