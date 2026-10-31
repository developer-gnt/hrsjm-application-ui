export type CauseStatus = 'active' | 'under_review' | 'closed';

export type CauseCategoryKey =
  | 'all'
  | 'active'
  | 'education'
  | 'healthcare'
  | 'relief'
  | 'women'
  | 'human_rights'
  | 'environment';

export interface MemberCause {
  id: string;
  title: string;
  category: string;
  categoryKey: CauseCategoryKey;
  categoryIcon: string;
  location: string;
  imageUrl: string;
  description: string;
  aboutStory: string;
  targetAmount: number;
  raisedAmount: number;
  status: CauseStatus;
  beneficiariesCount: number;
  targetBeneficiaries: string;
  donorCount: number;
  daysLeft?: number;
  isVerified: boolean;
  createdAt: string;
}

export interface DonationFormData {
  causeId: string;
  causeTitle: string;
  amount: number;
  panNumber?: string;
  email?: string;
  phone?: string;
  donorName?: string;
  need80GReceipt: boolean;
}

export interface DonationReceiptResult {
  receiptNumber: string;
  donationId: string;
  causeTitle: string;
  amount: number;
  date: string;
  paymentMode: string;
  donorName: string;
  panNumber?: string;
  is80GEligible: boolean;
}
