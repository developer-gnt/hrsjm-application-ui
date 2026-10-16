/**
 * Frontend state & backend sync for the My Profile flow.
 *
 * Connects directly with backend auth & membership APIs:
 * - GET /auth/me & GET /memberships/my to dynamically load the logged-in user profile & ID card
 * - PATCH /auth/me to update personal info in the database
 * - PATCH /users/:id/status for admin status updates
 * - Auto-generates Member ID formatted as HRSJM-00001
 */
import { create } from 'zustand';
import {
  AdminDetailsInput,
  AdminProfile,
  PersonalInfoInput,
} from './types/profile.types';
import { useAuthStore } from '../../auth/store/authStore';
import { apiClient } from '../../../core/api/client';
import { ApiRoutes } from '../../../core/constants/api-routes';
import { membershipApplicationsStore } from '../../admin/membershipApplications/services/membershipApplicationsStore';

interface ProfileStore {
  profile: AdminProfile;
  isLoading: boolean;
  /** One-shot success message staged for the profile screen toast. */
  stagedMessage: string | null;
  fetchProfile: () => Promise<void>;
  updatePersonalInfo: (input: PersonalInfoInput) => Promise<void>;
  updateAdminDetails: (input: AdminDetailsInput) => Promise<void>;
  updateAvatar: (avatarUri: string | null) => Promise<void>;
  stageMessage: (message: string) => void;
  consumeStagedMessage: () => string | null;
}

const formatDateStr = (dateStr?: string | Date | null, fallback = ''): string => {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return fallback;
  }
};

const mapBackendRole = (roles?: Array<{ name: string }>): string => {
  if (!roles || roles.length === 0) return 'User';
  const roleNames = roles.map(r => r.name.toUpperCase());
  if (roleNames.includes('ADMIN') || roleNames.includes('SUPER_ADMIN')) return 'Admin';
  if (roleNames.includes('DONATION_SEEKER')) return 'Donar Seeker';
  if (roleNames.includes('USER')) return 'User';
  if (roleNames.includes('MEMBER')) return 'Member';
  const first = roles[0].name;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
};

const generateAutoMemberId = (userId?: string, seq = 1): string => {
  if (!userId) return 'HRSJM-00001';
  const digits = userId.replace(/\D/g, '');
  if (digits.length >= 5) {
    return `HRSJM-${digits.slice(-5)}`;
  }
  const numericVal = parseInt(digits, 10);
  if (!isNaN(numericVal) && numericVal > 0) {
    return `HRSJM-${String(numericVal % 100000).padStart(5, '0')}`;
  }
  return `HRSJM-${String(seq).padStart(5, '0')}`;
};

const getInitialProfile = (): AdminProfile => {
  const user = useAuthStore.getState().user;
  if (user) {
    const isUserAdmin = user.roles?.some((r: any) =>
      r.name?.toUpperCase() === 'ADMIN' || r.name?.toUpperCase() === 'SUPER_ADMIN'
    );
    const isMember = user.roles?.some((r: any) => r.name?.toUpperCase() === 'MEMBER');
    const adminId = isUserAdmin
      ? `ADMIN${user.id ? user.id.replace(/\D/g, '').slice(-3).padStart(3, '0') || '001' : '001'}`
      : isMember
      ? generateAutoMemberId(user.id, 1)
      : '';
    return {
      fullName: user.full_name || '',
      accountName: user.full_name || '',
      email: user.email || '',
      phone: user.mobile_number || '',
      avatar: user.avatar || null,
      role: mapBackendRole(user.roles),
      accountStatus: user.status === 'INACTIVE' ? 'Inactive' : 'Active',
      membershipType: isUserAdmin ? 'Executive Member' : isMember ? 'Individual Member' : 'General User',
      memberId: adminId,
      adminId,
      dateOfBirth: '',
      memberSince: formatDateStr(user.created_at, ''),
      validTill: '',
    };
  }
  return {
    accountName: '',
    adminId: '',
    fullName: '',
    email: '',
    phone: '',
    avatar: null,
    role: 'Admin',
    accountStatus: 'Active',
    membershipType: 'Executive Member',
    memberId: '',
    dateOfBirth: '',
    memberSince: '',
    validTill: '',
  };
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: getInitialProfile(),
  isLoading: false,
  stagedMessage: null,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      // 1. Fetch fresh authenticated user profile from /auth/me to always stay synced with DB
      let user: any = null;
      try {
        const res: any = await apiClient.get<any>(ApiRoutes.AUTH.ME);
        user = res?.data || res;
        if (user && user.id) {
          useAuthStore.setState({ user: { ...useAuthStore.getState().user, ...user } });
        }
      } catch {
        user = useAuthStore.getState().user;
      }

      if (!user) {
        set({ isLoading: false });
        return;
      }

      // 2. Safely check for user's membership details
      let membershipData: any = null;
      try {
        const rawRes: any = await apiClient.get<any>('/memberships/my');
        membershipData = rawRes?.data !== undefined ? rawRes.data : rawRes;
      } catch {
        try {
          const rawRes: any = await apiClient.get<any>('/users/me/membership');
          membershipData = rawRes?.data !== undefined ? rawRes.data : rawRes;
        } catch {
          membershipData = null;
        }
      }

      // Check application status
      let hasAppliedMembership = Boolean(membershipData?.id);
      let membershipStatus: string | undefined = undefined;
      let rejectionReason: string | undefined = membershipData?.rejection_reason || undefined;

      if (membershipData?.status) {
        const raw = String(membershipData.status).toUpperCase();
        if (raw === 'ACTIVE' || raw === 'APPROVED') membershipStatus = 'Approved';
        else if (raw === 'REJECTED') membershipStatus = 'Rejected';
        else if (raw === 'UNDER_REVIEW') membershipStatus = 'Under Review';
        else membershipStatus = 'Applied';
      }

      // If not in backend /memberships/my yet, check local store
      if (!hasAppliedMembership) {
        const localApps = membershipApplicationsStore.getApplications();
        const userEmail = (user.email || '').toLowerCase().trim();
        const userPhone = (user.mobile_number || user.phone || '').replace(/\D/g, '').slice(-10);
        const match = localApps.find(
          a =>
            (userEmail && a.email && a.email.toLowerCase().trim() === userEmail) ||
            (userPhone && userPhone.length === 10 && a.phone && a.phone.replace(/\D/g, '').slice(-10) === userPhone)
        );
        if (match) {
          hasAppliedMembership = true;
          if (match.status === 'approved') membershipStatus = 'Approved';
          else if (match.status === 'rejected') {
            membershipStatus = 'Rejected';
            rejectionReason = (match as any).rejectionReason || 'Incomplete documents';
          } else if (match.status === 'under_review') {
            membershipStatus = 'Under Review';
          } else {
            membershipStatus = 'Applied';
          }
        }
      }

      const role = mapBackendRole(user.roles);
      const isUserAdmin = user.roles?.some((r: any) =>
        r.name?.toUpperCase() === 'ADMIN' || r.name?.toUpperCase() === 'SUPER_ADMIN'
      );
      const isApprovedMember =
        !isUserAdmin &&
        membershipStatus === 'Approved' &&
        user.roles?.some((r: any) => r.name?.toUpperCase() === 'MEMBER');

      const memberId =
        membershipData?.membership_number ||
        (isApprovedMember ? generateAutoMemberId(user.id, 1) : '');
      const adminId = isUserAdmin
        ? `ADMIN${user.id ? user.id.replace(/\D/g, '').slice(-3).padStart(3, '0') || '001' : '001'}`
        : (isApprovedMember ? memberId : '');

      const memberSince = formatDateStr(
        membershipData?.start_date || user.created_at,
        '',
      );
      const defaultValidDate = new Date();
      defaultValidDate.setFullYear(defaultValidDate.getFullYear() + 1);
      const validTill = formatDateStr(
        membershipData?.expiry_date || defaultValidDate,
        formatDateStr(defaultValidDate),
      );

      // Convert user's role to Member if approved and currently a standard User
      let effectiveRole = role;
      const isPlainUser =
        role === 'User' ||
        (user.roles && user.roles.length > 0 && user.roles.every((r: any) => r.name?.toUpperCase() === 'USER'));

      if (membershipStatus === 'Approved' && isPlainUser) {
        effectiveRole = 'Member';
        const hasMemberRole = user.roles?.some((r: any) => r.name?.toUpperCase() === 'MEMBER');
        if (!hasMemberRole) {
          useAuthStore.setState({
            user: {
              ...user,
              roles: [
                ...(user.roles?.filter((r: any) => r.name?.toUpperCase() !== 'USER') || []),
                { id: 'r-member', name: 'MEMBER' },
              ],
            },
          });
        }
      } else if (membershipStatus !== 'Approved' && !isUserAdmin) {
        effectiveRole = 'User';
        const hasMemberRole = user.roles?.some((r: any) => r.name?.toUpperCase() === 'MEMBER');
        if (hasMemberRole) {
          useAuthStore.setState({
            user: {
              ...user,
              roles: [
                ...(user.roles?.filter((r: any) => r.name?.toUpperCase() !== 'MEMBER') || []),
                { id: 'r-user', name: 'USER' },
              ],
            },
          });
        }
      }

      const dynamicProfile: AdminProfile = {
        fullName: user.full_name || '',
        accountName: user.full_name || '',
        email: user.email || '—',
        phone: user.mobile_number || user.phone || '—',
        avatar: user.avatar || get().profile.avatar || null,
        role: effectiveRole,
        accountStatus: user.status === 'INACTIVE' ? 'Inactive' : 'Active',
        membershipType:
          membershipData?.category?.name ||
          (membershipData?.application_data as any)?.membership_type ||
          (isUserAdmin ? 'Executive Member' : isApprovedMember ? 'Individual Member' : 'General User'),
        memberId,
        adminId,
        dateOfBirth: (user as any)?.dob || (membershipData?.application_data as any)?.personal_details?.dob || '',
        memberSince,
        validTill,
        hasAppliedMembership,
        membershipStatus,
        rejectionReason,
      };

      set({ profile: dynamicProfile, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updatePersonalInfo: async input => {
    const cleanEmail = (input.email || '').trim().toLowerCase();
    const cleanPhone = (input.phone || '').replace(/\D/g, '').slice(-10);
    const dob = (input.dob || input.dateOfBirth || '').trim();

    const patchPayload: Record<string, any> = {
      full_name: input.fullName.trim(),
      email: cleanEmail,
      mobile_number: cleanPhone,
      phone: cleanPhone,
    };
    if (dob) {
      patchPayload.dob = dob;
      patchPayload.dateOfBirth = dob;
    }

    // 1. Persist to backend /auth/me
    const res: any = await apiClient.patch<any>(ApiRoutes.AUTH.ME, patchPayload);

    const userData = res?.data || res;

    // 2. Sync useAuthStore with updated user (safely preserving roles)
    const currentUser = useAuthStore.getState().user;
    const roles =
      userData?.roles && Array.isArray(userData.roles) && userData.roles.length > 0
        ? userData.roles
        : currentUser?.roles || [];

    if (currentUser || userData) {
      useAuthStore.setState({
        user: {
          ...currentUser,
          ...(typeof userData === 'object' && userData ? userData : {}),
          full_name: input.fullName.trim(),
          email: cleanEmail,
          mobile_number: cleanPhone,
          dob: dob || (currentUser as any)?.dob,
          roles,
        },
      });
    }

    set(state => ({
      profile: {
        ...state.profile,
        fullName: input.fullName.trim(),
        accountName: input.fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        dateOfBirth: dob || state.profile.dateOfBirth,
      },
    }));
  },

  updateAdminDetails: async input => {
    // Sync to backend if user id exists and status changed
    try {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.id && input.accountStatus) {
        await apiClient.patch(`/users/${currentUser.id}/status`, {
          status: input.accountStatus === 'Active' ? 'ACTIVE' : 'INACTIVE',
        }).catch(() => undefined);
      }
    } catch {
      // best-effort
    }

    set(state => ({
      profile: {
        ...state.profile,
        role: input.role,
        accountStatus: input.accountStatus,
      },
    }));
  },

  updateAvatar: async (avatarUri: string | null) => {
    // 1. Sync useAuthStore so global header avatar updates immediately
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.setState({
        user: {
          ...currentUser,
          avatar: avatarUri,
        },
      });
    }

    // 2. Update profileStore state
    set(state => ({
      profile: {
        ...state.profile,
        avatar: avatarUri,
      },
    }));

    // 3. Best effort sync to backend
    try {
      await apiClient.patch(ApiRoutes.AUTH.ME, {
        avatar: avatarUri,
      }).catch(() => undefined);
    } catch {
      // ignore
    }
  },

  stageMessage: message => set({ stagedMessage: message }),
  consumeStagedMessage: () => {
    let message: string | null = null;
    set(state => {
      message = state.stagedMessage;
      return { stagedMessage: null };
    });
    return message;
  },
}));
