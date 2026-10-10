/**
 * Admin dashboard contracts — shapes mirror the live backend responses:
 * - GET /api/v1/admin/dashboard  (AdminService.getDashboard)
 * - GET /api/v1/admin/members    (AdminService.listMembers)
 * - GET /api/v1/assistance-requests (AssistanceRequestEntity)
 * - GET /api/v1/notifications/me (unread_count for the bell badge)
 */
export interface AdminDashboardResponse {
  users: { total: number; thisMonth: number; prevMonth: number };
  memberships: { total: number; active: number; pending: number };
  renewals: { total: number; pending: number; collectedAmount: number };
  assistance: {
    total: number;
    pending: number;
    thisMonth: number;
    prevMonth: number;
  };
  tickets: {
    total: number;
    open: number;
    thisMonth: number;
    prevMonth: number;
  };
  donations: {
    total: number;
    receivedAmount: number;
    thisMonth: number;
    prevMonth: number;
  };
  membershipPayments: { pending: number; success: number; failed: number };
  applicationsByStatus: {
    PENDING: number;
    UNDER_REVIEW: number;
    APPROVED: number;
    REJECTED: number;
    CLOSED: number;
  };
  ticketsByStatus: {
    SUBMITTED: number;
    UNDER_REVIEW: number;
    RESOLVED: number;
    CLOSED: number;
  };
  revenue: { membershipIncome: number; donationIncome: number; total: number };
  memberGrowth: Array<{ month: string; total: number }>;
  recentActivity: Array<{
    id: string;
    event: string;
    entity_type: string | null;
    entity_id: string | null;
    actor_id: string | null;
    created_at: string;
  }>;
}

/** Item of GET /api/v1/admin/members (AdminService.listMembers). */
export interface AdminMemberItem {
  id: string;
  full_name: string;
  mobile_number: string;
  email: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  roles: Array<{ id: string; name: string }>;
  created_at: string;
  updated_at: string;
  membership: {
    id: string;
    membershipNumber: string | null;
    category: string | null;
    status: string;
    startDate: string | null;
    expiryDate: string | null;
  } | null;
}

/** Item of GET /api/v1/assistance-requests (AssistanceRequestEntity). */
export interface AssistanceRequestItem {
  id: string;
  user_id: string;
  full_name: string;
  mobile: string;
  email: string | null;
  requested_amount: number;
  reason: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  created_at: string;
}
