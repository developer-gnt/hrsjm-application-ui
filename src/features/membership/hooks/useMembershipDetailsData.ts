import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  getRegistrationState,
  subscribeRegistrationState,
  RegistrationState,
} from '../../auth/state/registrationState';
import { useAuthStore } from '../../auth/store/authStore';
import {
  membershipApplicationsStore,
} from '../../admin/membershipApplications/services/membershipApplicationsStore';
import { MembershipApplicationItem, ApplicationStatus } from '../../admin/membershipApplications/types/membershipApplications.types';

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
  const user = useAuthStore(state => state.user);

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
    regState.email || regState.fullName || user?.email || user?.full_name
      ? applications.find(
          app =>
            (regState.email && app.email?.toLowerCase() === regState.email.toLowerCase()) ||
            (regState.fullName && app.applicantName?.toLowerCase() === regState.fullName.toLowerCase()) ||
            (user?.email && app.email?.toLowerCase() === user.email.toLowerCase()) ||
            (user?.full_name && app.applicantName?.toLowerCase() === user.full_name.toLowerCase())
        )
      : applications.find(app => app.id.startsWith('app-reg-'));

  // Check if member data exists
  const candidateName =
    regState.fullName?.trim() ||
    latestApp?.applicantName?.trim() ||
    user?.full_name?.trim() ||
    '';
  const hasData = candidateName.length > 0 || Boolean(user);

  const fullName = candidateName || user?.full_name || 'HRSJM Member';
  const email = regState.email?.trim() || latestApp?.email || user?.email || '';
  const phone = regState.phone?.trim() || latestApp?.phone || user?.mobile_number || '';
  const dob = regState.dob?.trim() || latestApp?.dob || '';

  // Membership type
  const rawType =
    regState.accountTypeLabel ||
    latestApp?.membershipType ||
    (user as any)?.membership_category ||
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
  } else if (regState.accountType === 'member' || Boolean(user)) {
    status = 'Active';
    statusRaw = 'approved';
  }

  // Member ID
  const memberId =
    (user as any)?.member_id ||
    (user as any)?.custom_id ||
    latestApp?.applicationId ||
    (latestApp?.id && !latestApp.id.startsWith('app-reg-') ? latestApp.id : '') ||
    (status === 'Active' ? 'HRSJM-MEM-2026-0842' : 'HRSJM-PENDING');

  // Dates
  let joinDate = '15 Sep 2026';
  let validTill = '15 Sep 2027';

  if (latestApp?.submittedAt) {
    const parts = latestApp.submittedAt.split(',');
    joinDate = parts[0].trim();
  } else {
    joinDate = formatDateDisplay(new Date());
  }

  if (status === 'Active') {
    // 1 year from join date
    const joinDateObj = new Date(latestApp?.submittedDate || Date.now());
    if (!isNaN(joinDateObj.getTime())) {
      const expiry = new Date(joinDateObj);
      expiry.setFullYear(expiry.getFullYear() + 1);
      validTill = formatDateDisplay(expiry);
    } else {
      validTill = '15 Sep 2027';
    }
  } else {
    validTill = 'Pending Approval';
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
    daysRemaining: status === 'Active' ? '352 Days' : '—',
    ...initialOverride,
  };

  return derived;
};
