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

const formatDateStr = (dateStr?: string | Date | null, fallback = '15 Sep 2026'): string => {
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
  if (!roles || roles.length === 0) return 'Member';
  const roleNames = roles.map(r => r.name.toUpperCase());
  if (roleNames.includes('ADMIN')) return 'Admin';
  if (roleNames.includes('DONATION_SEEKER')) return 'Donar Seeker';
  if (roleNames.includes('DONOR')) return 'User';
  if (roleNames.includes('MEMBER')) return 'Member';
  const first = roles[0].name;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
};

const generateAutoMemberId = (userId?: string, seq = 1): string => {
  if (!userId) return 'HRSJM-00001';
  // Extract digits from uuid or fallback
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
    const isUserAdmin = user.roles?.some((r: any) => r.name?.toUpperCase() === 'ADMIN');
    const adminId = isUserAdmin
      ? `ADMIN${user.id ? user.id.replace(/\D/g, '').slice(-3).padStart(3, '0') || '201' : '201'}`
      : generateAutoMemberId(user.id, 1);
    return {
      fullName: user.full_name || 'Member',
      accountName: user.full_name || 'User',
      email: user.email || 'admin@hrsjm.org',
      phone: user.mobile_number || '—',
      avatar: user.avatar || null,
      role: mapBackendRole(user.roles),
      accountStatus: user.status === 'INACTIVE' ? 'Inactive' : 'Active',
      membershipType: isUserAdmin ? 'Executive Member' : 'Individual Member',
      memberId: adminId,
      adminId,
      dateOfBirth: '12 Mar 2002',
      memberSince: formatDateStr(user.created_at, '15 Sep 2026'),
      validTill: '15 Sep 2027',
    };
  }
  return {
    accountName: 'Admin User',
    adminId: 'ADMIN201',
    fullName: 'Mubasshir Farooqui',
    email: 'admin@hrsjm.org',
    phone: '8850248290',
    avatar: null,
    role: 'Admin',
    accountStatus: 'Active',
    membershipType: 'Executive Member',
    memberId: 'ADMIN201',
    dateOfBirth: '12 Mar 2002',
    memberSince: '15 Sep 2026',
    validTill: '15 Sep 2027',
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
        const res = await apiClient.get<any>(ApiRoutes.AUTH.ME);
        user = res?.data || res;
        if (user && user.id) {
          useAuthStore.setState({ user });
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
        membershipData = await apiClient.get<any>('/memberships/my');
      } catch {
        try {
          membershipData = await apiClient.get<any>('/users/me/membership');
        } catch {
          membershipData = null;
        }
      }

      const role = mapBackendRole(user.roles);
      const isUserAdmin = user.roles?.some((r: any) => r.name?.toUpperCase() === 'ADMIN');
      const memberId =
        membershipData?.membership_number ||
        generateAutoMemberId(user.id, 1);
      const adminId = isUserAdmin
        ? `ADMIN${user.id ? user.id.replace(/\D/g, '').slice(-3).padStart(3, '0') || '001' : '001'}`
        : memberId;

      const memberSince = formatDateStr(
        membershipData?.start_date || user.created_at,
        '15 Sep 2026',
      );
      const defaultValidDate = new Date();
      defaultValidDate.setFullYear(defaultValidDate.getFullYear() + 1);
      const validTill = formatDateStr(
        membershipData?.expiry_date || defaultValidDate,
        formatDateStr(defaultValidDate),
      );

      const dynamicProfile: AdminProfile = {
        fullName: user.full_name || 'Member',
        accountName: user.full_name || 'User',
        email: user.email || '—',
        phone: user.mobile_number || '—',
        avatar: user.avatar || get().profile.avatar || null,
        role,
        accountStatus: user.status === 'INACTIVE' ? 'Inactive' : 'Active',
        membershipType: membershipData?.category?.name || (isUserAdmin ? 'Executive Member' : 'Individual Member'),
        memberId,
        adminId,
        dateOfBirth: (membershipData?.application_data as any)?.personal_details?.dob || '—',
        memberSince,
        validTill,
      };

      set({ profile: dynamicProfile, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updatePersonalInfo: async input => {
    // 1. Persist to backend /auth/me
    try {
      const updatedUser = await apiClient.patch<any>(ApiRoutes.AUTH.ME, {
        full_name: input.fullName,
        email: input.email,
        mobile_number: input.phone,
        phone: input.phone,
      });

      // 2. Sync useAuthStore with updated user
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({
          user: {
            ...currentUser,
            full_name: input.fullName,
            email: input.email,
            mobile_number: input.phone,
            ...(updatedUser?.data || updatedUser || {}),
          },
        });
      }
    } catch (err) {
      console.warn('Backend profile update notice:', err);
    }

    set(state => ({
      profile: {
        ...state.profile,
        fullName: input.fullName,
        accountName: input.fullName,
        email: input.email,
        phone: input.phone,
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
