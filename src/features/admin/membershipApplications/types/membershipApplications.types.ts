export type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';
export type ApplicationAccountType = 'membership' | 'seeker';

export function getApplicationAccountType(app?: {
  accountType?: string;
  membershipType?: string;
  applicationId?: string;
}): ApplicationAccountType {
  if (!app) return 'membership';
  if (app.accountType === 'seeker') return 'seeker';
  if (app.accountType === 'membership') return 'membership';
  const type = (app.membershipType || '').toLowerCase();
  const id = (app.applicationId || '').toUpperCase();
  if (type.includes('seeker') || id.startsWith('HRSJM-SEK')) {
    return 'seeker';
  }
  return 'membership';
}

export function formatApplicationAmount(amount?: number | string): string {
  if (amount === undefined || amount === null || amount === '') return '';
  if (typeof amount === 'number') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  const cleanStr = String(amount).trim();
  if (cleanStr.startsWith('₹')) {
    return cleanStr;
  }
  const num = Number(cleanStr.replace(/[^0-9.]/g, ''));
  if (!isNaN(num) && num > 0) {
    return `₹${num.toLocaleString('en-IN')}`;
  }
  return cleanStr;
}

export function getApplicationFeeAmount(application: Partial<MembershipApplicationItem>): string {
  if (application.amount !== undefined && application.amount !== null && application.amount !== '') {
    const formatted = formatApplicationAmount(application.amount);
    if (formatted) return formatted;
  }

  const isSeeker = getApplicationAccountType(application as any) === 'seeker';
  if (isSeeker) {
    return 'Free / Aid Request';
  }

  const typeStr = (application.membershipType || '').toLowerCase().replace(/’/g, "'").trim();
  if (typeStr.includes('director')) {
    return '₹10,000';
  }
  if (typeStr.includes('national') && typeStr.includes('council')) {
    return '₹10,000';
  }
  if (typeStr.includes('lion') || typeStr.includes('counselor') || typeStr.includes('ambassador')) {
    return '₹5,000';
  }
  if (typeStr.includes('state unit')) {
    return '₹2,300';
  }
  if (typeStr.includes('district unit')) {
    return '₹1,300';
  }
  if (typeStr.includes('state active')) {
    return '₹900';
  }
  if (typeStr.includes('district active') || typeStr.includes('standard') || typeStr.includes('individual')) {
    return '₹800';
  }

  return '₹800';
}

export function getApplicationPaymentStatus(
  application: Partial<MembershipApplicationItem>
): 'PAID' | 'UNPAID' | 'EXEMPT' {
  const isSeeker = getApplicationAccountType(application as any) === 'seeker';
  if (isSeeker) {
    return 'EXEMPT';
  }

  if (application.status === 'approved') {
    return 'PAID';
  }

  const statusStr = String(application.paymentStatus || '').toUpperCase().trim();
  if (
    statusStr === 'PAID' ||
    statusStr === 'COMPLETED' ||
    statusStr === 'SUCCESS' ||
    statusStr === 'SUCCESSFUL' ||
    statusStr === 'VERIFIED'
  ) {
    return 'PAID';
  }
  if (
    statusStr === 'UNPAID' ||
    statusStr === 'PENDING' ||
    statusStr === 'FAILED' ||
    statusStr === 'DUE'
  ) {
    return 'UNPAID';
  }

  if (typeof globalThis !== 'undefined') {
    try {
      const win = (globalThis as any).window;
      if (win?.sessionStorage) {
        if (
          (application.id && win.sessionStorage.getItem(`hrsjm_payment_done_${application.id}`) === 'true') ||
          (application.applicationId && win.sessionStorage.getItem(`hrsjm_payment_done_${application.applicationId}`) === 'true')
        ) {
          return 'PAID';
        }
      }
    } catch {
      // ignore
    }
  }

  return 'UNPAID';
}

export interface MembershipApplicationItem {
  id: string;
  applicationId: string;
  applicantName: string;
  accountType?: ApplicationAccountType;
  membershipType: string;
  avatarUrl?: string;
  status: ApplicationStatus;
  submittedAt: string; // formatted date string, e.g. "15 Sep 2026, 11:30 AM"
  submittedDate: string; // ISO date for sorting
  phone?: string;
  email?: string;
  gender?: string;
  dob?: string;
  fatherName?: string;
  address?: string;
  policeStation?: string;
  occupation?: string;
  amount?: number | string;
  paymentStatus?: 'PAID' | 'UNPAID' | 'EXEMPT' | string;
  rejectionReason?: string;
  documents?: {
    id: string;
    title: string;
    fileName: string;
    fileSize: string;
    uploadDate: string;
    uri?: string;
  }[];
  activityLog?: {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    status: ApplicationStatus | 'submitted';
  }[];
}

export interface ApplicationStatsData {
  total: number;
  underReview: number;
  approved: number;
  rejected: number;
}
