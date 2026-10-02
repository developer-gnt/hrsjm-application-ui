export { DonationsScreen } from './screens/DonationsScreen';

export { donationsService } from './services/donations.service';

// Temporary UI-preview data (visual development only — remove once the
// backend is reachable with auth).
export {
  getPreviewRowModels,
  filterPreviewRows,
  PREVIEW_STATS,
  PREVIEW_TABS,
} from './services/donations.preview';

export { useDonations, useCreateDonation, useRefundDonation, useDonationReceipt, computeLiveStats } from './hooks/useDonations';

export { DonationStats } from './components/DonationStats';
export type { DonationStatItem } from './components/DonationStats';
export { DonationCard } from './components/DonationCard';
export {
  DonationRow,
  toDonationRowModel,
} from './components/DonationRow';
export { DonationSearch } from './components/DonationSearch';
export { DonationFilters } from './components/DonationFilters';
export { DateRangePickerModal } from './components/DateRangePickerModal';
export { AddDonationModal } from './components/AddDonationModal';
export { DonationReceiptModal } from './components/DonationReceiptModal';
export { DonationDetailsModal } from './components/DonationDetailsModal';
export {
  DonationStatusBadge,
  donationStatusPresentation,
} from './components/DonationStatusBadge';
export { DonationAmount } from './components/DonationAmount';
export { DonationSummary } from './components/DonationSummary';
export { DonationActions } from './components/DonationActions';
export type { DonationActionItem } from './components/DonationActions';
export { DonationsTopBar } from './components/DonationsTopBar';
export { DonationsBottomNav } from './components/DonationsBottomNav';
export { DonationsDateSelector } from './components/DonationsDateSelector';

export * from './types/donations.types';