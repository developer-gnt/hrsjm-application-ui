export type DonationStatus = 'Completed' | 'Pending' | 'Failed';
export type ReceiptType = 'Donation' | 'Membership';

export interface DonationRecord {
  id: string;
  receiptNo: string;
  type: ReceiptType;
  title: string;
  cause: string;
  category: string;
  description: string;
  amount: number;
  amountInWords?: string;
  date: string;
  time: string;
  dateTime: string;
  isoDate: string; // YYYY-MM-DD
  status: DonationStatus;
  paymentMethod: string;
  transactionId: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  donorPan?: string;
  imageType: 'education' | 'medical' | 'tree' | 'disaster' | 'membership';
  imageUrl?: string;
}

export type DonationFilterTab = 'ALL' | 'Completed' | 'Pending' | 'Failed';
export type ReceiptFilterTab = 'ALL' | 'Membership' | 'Donation';

export interface DonationFilterState {
  status: 'ALL' | DonationStatus;
  fromDate?: string;
  toDate?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ReceiptFilterState {
  type: 'ALL' | ReceiptType;
  status?: 'ALL' | DonationStatus;
  fromDate?: string;
  toDate?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
}
