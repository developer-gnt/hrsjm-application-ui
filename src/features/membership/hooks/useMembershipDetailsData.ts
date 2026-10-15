import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  getRegistrationState,
  subscribeRegistrationState,
  RegistrationState,
} from '../../auth/state/registrationState';
import {
  membershipApplicationsStore,
} from '../../admin/membershipApplications/services/membershipApplicationsStore';
import { MembershipApplicationItem, ApplicationStatus } from '../../admin/membershipApplications/types/membershipApplications.types';
import { useProfileStore } from '../../admin/profile/profileStore';
import { useAuthStore } from '../../auth/store/authStore';

export type DisplayMembershipStatus = 'Active' | 'Under Review' | 'Rejected' | 'Inactive';

export interface MembershipDetailsData {
  hasData: boolean;
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  membershipType: string;
  memberId: string;
  joinDate: string;
  validTill: string;
  status: DisplayMembershipStatus;
  statusRaw: ApplicationStatus | string;
  totalDuration: string;
  daysRemaining: string;
}

const formatDateDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const useMembershipDetailsData = (
  initialOverride?: Partial<MembershipDetailsData>
): MembershipDetailsData => {
  const regState = useSyncExternalStore(
    subscribeRegistrationState,
    getRegistrationState,
    getRegistrationState
  );
  const profile = useProfileStore(state => state.profile);
  const authUser = useAuthStore(state => state.user);

  const [applications, setApplications] = useState<MembershipApplicationItem[]>(() =>
    membershipApplicationsStore.getApplications()
  );

  useEffect(() => {
    const unsubscribe = membershipApplicationsStore.subscribe(() => {
      setApplications(membershipApplicationsStore.getApplications());
    });
    return unsubscribe;
  }, []);

  // Find most recent application matching registered user or created via registration
  const latestApp =
    profile?.email || authUser?.email || regState.email || profile?.fullName || authUser?.full_name || regState.fullName
      ? applications.find(
          app =>
            (profile?.email && app.email?.toLowerCase() === profile.email.toLowerCase()) ||
            (authUser?.email && app.email?.toLowerCase() === authUser.email.toLowerCase()) ||
            (regState.email && app.email?.toLowerCase() === regState.email.toLowerCase()) ||
            (profile?.fullName && app.applicantName?.toLowerCase() === profile.fullName.toLowerCase()) ||
            (authUser?.full_name && app.applicantName?.toLowerCase() === authUser.full_name.toLowerCase()) ||
            (regState.fullName && app.applicantName?.toLowerCase() === regState.fullName.toLowerCase())
        )
      : applications.find(app => app.id.startsWith('app-reg-'));

  // Check if member data exists
  const candidateName =
    initialOverride?.fullName ||
    profile?.fullName?.trim() ||
    authUser?.full_name?.trim() ||
    regState.fullName?.trim() ||
    latestApp?.applicantName?.trim() ||
    '';
  const hasData = Boolean(
    candidateName.length > 0 ||
    profile?.memberId ||
    authUser?.id ||
    Boolean(latestApp)
  );

  const fullName = candidateName || (authUser ? 'HRSJM Member' : 'Member');
  const email =
    initialOverride?.email ||
    profile?.email?.trim() ||
    authUser?.email?.trim() ||
    regState.email?.trim() ||
    latestApp?.email ||
    '';
  const phone =
    initialOverride?.phone ||
    profile?.phone?.trim() ||
    authUser?.mobile_number?.trim() ||
    regState.phone?.trim() ||
    latestApp?.phone ||
    '';
  const dob =
    initialOverride?.dob ||
    profile?.dateOfBirth ||
    (profile as any)?.dob ||
    (authUser as any)?.dob ||
    regState.dob?.trim() ||
    latestApp?.dob ||
    '';

  // Membership type
  const rawType =
    initialOverride?.membershipType ||
    regState.accountTypeLabel ||
    latestApp?.membershipType ||
    (authUser as any)?.membership_category ||
    profile?.membershipType ||
    'Individual Member';
  let membershipType = 'Individual Member';
  if (
    rawType.toLowerCase() === 'member' ||
    rawType.toLowerCase() === 'individual member' ||
    rawType.toLowerCase() === 'general member'
  ) {
    membershipType = 'Individual Member';
  } else if (rawType.toLowerCase().includes('member')) {
    membershipType = rawType;
  } else if (rawType) {
    membershipType = `${rawType} Member`;
  }

  // Status mapping
  let status: DisplayMembershipStatus = 'Active';
  let statusRaw: string = 'approved';

  if (latestApp) {
    statusRaw = latestApp.status;
    if (latestApp.status === 'approved') {
      status = 'Active';
    } else if (latestApp.status === 'rejected') {
      status = 'Rejected';
    } else {
      status = 'Under Review';
    }
  } else if (profile?.accountStatus) {
    if (profile.accountStatus === 'Active') {
      status = 'Active';
      statusRaw = 'approved';
    } else if (profile.accountStatus === 'Inactive') {
      status = 'Inactive';
      statusRaw = 'inactive';
    } else {
      status = 'Under Review';
      statusRaw = 'pending';
    }
  } else if (regState.accountType === 'member' || Boolean(authUser)) {
    status = 'Active';
    statusRaw = 'approved';
  }

  // Member ID
  const memberId =
    initialOverride?.memberId ||
    profile?.memberId ||
    profile?.adminId ||
    (authUser as any)?.member_id ||
    (authUser as any)?.custom_id ||
    latestApp?.applicationId ||
    (latestApp?.id && !latestApp.id.startsWith('app-reg-') ? latestApp.id : '') ||
    (status === 'Active' ? 'HRSJM-MEM-2026-0842' : 'HRSJM-PENDING');

  // Dates
  let joinDate = profile?.memberSince || '';
  let validTill = profile?.validTill || '';

  if (!joinDate) {
    if (latestApp?.submittedAt) {
      const parts = latestApp.submittedAt.split(',');
      joinDate = parts[0].trim();
    } else {
      joinDate = formatDateDisplay(new Date());
    }
  }

  if (!validTill) {
    if (status === 'Active') {
      const joinDateObj = new Date(latestApp?.submittedDate || Date.now());
      if (!isNaN(joinDateObj.getTime())) {
        const expiry = new Date(joinDateObj);
        expiry.setFullYear(expiry.getFullYear() + 1);
        validTill = formatDateDisplay(expiry);
      } else {
        validTill = '13 Oct 2027';
      }
    } else {
      validTill = 'Pending Approval';
    }
  }

  let daysRemaining = status === 'Active' ? '352 Days' : '—';
  if (status === 'Active') {
    try {
      const validDate = new Date(validTill);
      if (!isNaN(validDate.getTime())) {
        const diffDays = Math.ceil((validDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          daysRemaining = `${diffDays} Days`;
        }
      }
    } catch {
      // keep default 352 Days
    }
  }

  const derived: MembershipDetailsData = {
    hasData,
    fullName,
    email,
    phone,
    dob,
    membershipType,
    memberId,
    joinDate,
    validTill,
    status,
    statusRaw,
    totalDuration: '1 Year',
    daysRemaining: initialOverride?.daysRemaining || (status === 'Active' ? '352 Days' : daysRemaining),
    ...initialOverride,
  };

  return derived;
};
