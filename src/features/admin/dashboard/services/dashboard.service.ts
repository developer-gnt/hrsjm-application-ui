import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import type {
  AdminDashboardResponse,
  AdminMemberItem,
  AssistanceRequestItem,
} from '../types/dashboard.types';

/** GET /admin/dashboard — all dashboard KPIs, breakdowns and feeds in one call. */
export const getAdminDashboard = async (
  params?: { month?: string; growthMonths?: number },
): Promise<AdminDashboardResponse> => {
  const response = await apiClient.get<AdminDashboardResponse>(
    ApiRoutes.ADMIN.DASHBOARD,
    { params },
  );
  return response.data;
};

/** Helper to safely extract an array of items from any backend response shape */
const extractItems = (res: any): any[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.items)) return res.data.items;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
};

/** GET /admin/members — recent members feed connected directly to database (only approved/active members). */
export const getRecentMembers = async (limit = 5): Promise<AdminMemberItem[]> => {
  try {
    const response = await apiClient.get<any>(ApiRoutes.ADMIN.MEMBERS, {
      params: { page: 1, limit, membershipStatus: 'ACTIVE' },
    });
    const rawItems = extractItems(response);

    if (rawItems.length > 0) {
      // Show only members whose applications have been approved.
      // Strictly exclude pending applications, unapproved applicants, and general registered users.
      const approvedItems = rawItems.filter((m: any) => {
        const memStatus = String(m.membership?.status || '').toUpperCase();
        return memStatus === 'ACTIVE' || memStatus === 'APPROVED';
      });

      return approvedItems.map((m: any) => ({
        id: m.id,
        full_name:
          m.full_name ||
          m.name ||
          m.user?.full_name ||
          m.application_data?.full_name ||
          'Member',
        mobile_number: m.mobile_number || m.mobile || m.user?.mobile_number || '',
        email: m.email || m.user?.email || null,
        status: 'ACTIVE' as const,
        roles: m.roles || [],
        created_at:
          m.membership?.approval_date ||
          m.membership?.startDate ||
          m.created_at ||
          new Date().toISOString(),
        updated_at: m.updated_at || new Date().toISOString(),
        membership: m.membership || null,
      }));
    }
  } catch (err) {
    console.warn('[dashboard.service] getRecentMembers failed:', err);
  }

  return [];
};

/** GET /memberships — recent membership applications feed connected directly to database, sorted newest first. */
export const getRecentApplications = async (
  limit = 5,
): Promise<AssistanceRequestItem[]> => {
  const allItems: AssistanceRequestItem[] = [];

  // Fetch exclusively from /memberships (Membership Applications)
  try {
    const response = await apiClient.get<any>(ApiRoutes.MEMBERSHIPS.BASE, {
      params: { page: 1, limit: Math.max(limit, 20) },
    });
    const rawItems = extractItems(response);

    for (const m of rawItems) {
      const appData = m.application_data || {};
      const personal = appData.personal_details || {};
      const fullName =
        m.user?.full_name?.trim() ||
        personal.full_name?.trim() ||
        appData.full_name?.trim() ||
        appData.applicant_name?.trim() ||
        'Applicant';

      const rawStatus = String(m.status || '').toUpperCase();
      let status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CLOSED' = 'PENDING';
      if (rawStatus === 'ACTIVE' || rawStatus === 'APPROVED') {
        status = 'APPROVED';
      } else if (rawStatus === 'UNDER_REVIEW') {
        status = 'UNDER_REVIEW';
      } else if (
        rawStatus === 'REJECTED' ||
        rawStatus === 'CANCELLED' ||
        rawStatus === 'EXPIRED'
      ) {
        status = 'REJECTED';
      } else {
        status = 'PENDING';
      }

      allItems.push({
        id: m.membership_number || m.id,
        user_id: m.user_id || m.user?.id || '',
        full_name: fullName,
        mobile: m.user?.mobile_number || personal.mobile_number || '',
        email: m.user?.email || personal.email || null,
        requested_amount: 0,
        reason: m.category?.name || 'Membership Application',
        status,
        created_at: m.created_at || m.applied_at || new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[dashboard.service] getRecentApplications memberships failed:', err);
  }

  // Deduplicate by ID
  const seen = new Set<string>();
  const uniqueItems = allItems.filter((item) => {
    if (!item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  // Sort strictly NEWEST FIRST (Descending by created_at)
  uniqueItems.sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime() || 0;
    const timeB = new Date(b.created_at || 0).getTime() || 0;
    return timeB - timeA;
  });

  return uniqueItems.slice(0, limit);
};

