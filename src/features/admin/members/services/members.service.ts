import { apiClient } from '../../../../core/api/client';
import { ApiRoutes } from '../../../../core/constants/api-routes';
import { Member, MemberStats, MemberStatus } from '../types';

export type BackendMembershipStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'REJECTED'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'CANCELLED';

export interface BackendMembership {
  id: string;
  user_id: string;
  category_id: string;
  membership_number: string | null;
  status: BackendMembershipStatus;
  applied_at: string;
  start_date: string | null;
  expiry_date: string | null;
  approval_date: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  application_data?: {
    full_name?: string;
    mobile_number?: string;
    email?: string;
    personal_details?: Record<string, unknown>;
    [key: string]: unknown;
  } | null;
  user?: {
    id: string;
    full_name?: string;
    mobile_number?: string;
    email?: string;
    avatar?: string;
    status?: string;
  };
  category?: {
    id: string;
    name: string;
    code: string;
    fee: string | number;
    validity_days?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ListMembershipsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category_id?: string;
  user_id?: string;
}

export interface ListMembershipsResponse {
  items: BackendMembership[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateMembershipStatusPayload {
  status: BackendMembershipStatus;
  admin_notes?: string;
  rejection_reason?: string;
}

/**
 * Maps a backend MembershipEntity to the UI Member model.
 */
export function mapBackendMembershipToMember(backend: BackendMembership): Member {
  const name =
    backend.user?.full_name?.trim() ||
    backend.application_data?.full_name?.trim() ||
    'Member';

  const phone =
    backend.user?.mobile_number?.trim() ||
    backend.application_data?.mobile_number?.trim() ||
    '—';

  const email =
    backend.user?.email?.trim() ||
    backend.application_data?.email?.trim() ||
    '—';

  const membershipId =
    backend.membership_number ||
    `APP-${backend.id.substring(0, 8).toUpperCase()}`;

  const joinedDate =
    backend.approval_date ||
    backend.start_date ||
    backend.applied_at ||
    backend.created_at;

  const validTill = backend.expiry_date || 'Lifetime';

  // Determine UI status: ACTIVE, EXPIRING_SOON, or INACTIVE
  let status: MemberStatus = 'ACTIVE';

  if (
    backend.status === 'EXPIRED' ||
    backend.status === 'SUSPENDED' ||
    backend.status === 'REJECTED' ||
    backend.status === 'CANCELLED'
  ) {
    status = 'INACTIVE';
  } else if (backend.status === 'ACTIVE' || backend.status === 'APPROVED') {
    if (backend.expiry_date) {
      const expiry = new Date(backend.expiry_date).getTime();
      const now = Date.now();
      const daysLeft = (expiry - now) / (1000 * 60 * 60 * 24);
      if (daysLeft >= 0 && daysLeft <= 30) {
        status = 'EXPIRING_SOON';
      } else if (daysLeft < 0) {
        status = 'INACTIVE';
      } else {
        status = 'ACTIVE';
      }
    } else {
      status = 'ACTIVE';
    }
  } else {
    // PENDING / UNDER_REVIEW
    status = 'ACTIVE';
  }

  const avatarUri = backend.user?.avatar;

  return {
    id: backend.id,
    name,
    phone,
    email,
    membershipId,
    joinedDate,
    validTill,
    status,
    photo: avatarUri ? { uri: avatarUri } : undefined,
    rawBackend: backend,
  };
}

export const membersService = {
  /**
   * List memberships with pagination, search, and status filters.
   */
  async list(params?: ListMembershipsParams): Promise<{
    items: Member[];
    rawItems: BackendMembership[];
    meta: ListMembershipsResponse['meta'];
    stats: MemberStats;
  }> {
    const res = await apiClient.get<ListMembershipsResponse>(
      ApiRoutes.MEMBERSHIPS.BASE,
      { params }
    );

    const rawItems = res.data?.items || [];
    const meta = res.data?.meta || {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      total: rawItems.length,
      totalPages: 1,
    };

    const items = rawItems.map(mapBackendMembershipToMember);

    // Compute stats from returned items or total
    let active = 0;
    let expiringSoon = 0;
    let inactive = 0;

    items.forEach(m => {
      if (m.status === 'ACTIVE') active++;
      else if (m.status === 'EXPIRING_SOON') expiringSoon++;
      else if (m.status === 'INACTIVE') inactive++;
    });

    const stats: MemberStats = {
      total: meta.total,
      active,
      expiringSoon,
      inactive,
    };

    return {
      items,
      rawItems,
      meta,
      stats,
    };
  },

  /**
   * Fetch all active membership categories.
   */
  async getCategories(): Promise<MembershipCategoryItem[]> {
    try {
      const res = await apiClient.get<any>(
        ApiRoutes.MEMBERSHIPS.CATEGORIES
      );
      if (Array.isArray(res.data)) {
        return res.data;
      }
      return res.data?.items || [];
    } catch {
      return [
        { id: '1', name: 'General Member', code: 'GENERAL', fee: 500, status: 'ACTIVE' },
        { id: '2', name: 'Life Member', code: 'LIFE', fee: 5000, status: 'ACTIVE' },
        { id: '3', name: 'Patron Member', code: 'PATRON', fee: 15000, status: 'ACTIVE' },
        { id: '4', name: 'Executive Member', code: 'EXECUTIVE', fee: 25000, status: 'ACTIVE' },
      ];
    }
  },

  /**
   * Create / register a new member with membership application.
   */
  async create(payload: CreateMemberPayload): Promise<BackendMembership> {
    const { auto_activate, ...dto } = payload;
    const res = await apiClient.post<BackendMembership>(
      ApiRoutes.MEMBERSHIPS.BASE,
      dto
    );
    const created = res.data;
    if (auto_activate && created?.id) {
      try {
        await apiClient.patch(ApiRoutes.MEMBERSHIPS.STATUS(created.id), {
          status: 'ACTIVE',
          admin_notes: 'Auto-approved on creation by admin',
        });
      } catch (err) {
        console.warn('Could not auto-activate newly created member:', err);
      }
    }
    return created;
  },

  /**
   * Fetch a single membership details by ID.
   */
  async getById(id: string): Promise<BackendMembership> {
    const res = await apiClient.get<BackendMembership>(
      ApiRoutes.MEMBERSHIPS.DETAILS(id)
    );
    return res.data;
  },

  /**
   * Update membership status (Approve, Reject, Suspend, Activate).
   */
  async updateStatus(
    id: string,
    payload: UpdateMembershipStatusPayload
  ): Promise<BackendMembership> {
    const res = await apiClient.patch<BackendMembership>(
      ApiRoutes.MEMBERSHIPS.STATUS(id),
      payload
    );
    return res.data;
  },
};

export interface MembershipCategoryItem {
  id: string;
  name: string;
  code: string;
  fee: number | string;
  validity_days?: number;
  status: string;
}

export interface CreateMemberPayload {
  category_id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  personal_details?: {
    dob?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  admin_notes?: string;
  auto_activate?: boolean;
}

export default membersService;
