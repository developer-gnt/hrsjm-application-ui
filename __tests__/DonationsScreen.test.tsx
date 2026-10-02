import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DonationsScreen } from '../src/features/admin/donations/screens/DonationsScreen';
import {
  filterPreviewRowsAdvanced,
  getPreviewStats,
  getPreviewTabCounts,
  addPreviewDonation,
} from '../src/features/admin/donations/services/donations.preview';
import {
  computeLiveStats,
  inferDonationType,
} from '../src/features/admin/donations/hooks/useDonations';
import { donationsService } from '../src/features/admin/donations/services/donations.service';
import { apiClient } from '../src/core';
import { AddDonationModal } from '../src/features/admin/donations/components/AddDonationModal';
import { DonationReceiptModal } from '../src/features/admin/donations/components/DonationReceiptModal';
import { DonationDetailsModal } from '../src/features/admin/donations/components/DonationDetailsModal';
import { DateRangePickerModal } from '../src/features/admin/donations/components/DateRangePickerModal';

jest.mock('../src/core/api/client', () => {
  const actual = jest.requireActual('../src/core/api/client');
  return {
    ...actual,
    apiClient: {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    },
  };
});

describe('Donations Functionality Tests', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return ReactTestRenderer.create(
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>{ui}</SafeAreaProvider>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Add Donation Flow', () => {
    it('creates donation via service API', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: {
          id: 'don-new-1',
          donor_name: 'Rahul Sharma',
          donor_mobile: '9876543210',
          amount: 5000,
          status: 'PENDING',
          cause: 'Medical Support',
        },
      });

      const result = await donationsService.createDonation({
        donor_name: 'Rahul Sharma',
        donor_mobile: '9876543210',
        amount: 5000,
        cause: 'Medical Support',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/donations', {
        donor_name: 'Rahul Sharma',
        donor_mobile: '9876543210',
        amount: 5000,
        cause: 'Medical Support',
      });
      expect(result.id).toBe('don-new-1');
      expect(result.donor_name).toBe('Rahul Sharma');
    });

    it('adds donation to preview dataset when in preview mode', () => {
      const initialCounts = getPreviewTabCounts();
      const added = addPreviewDonation({
        donor_name: 'Sneha Patel',
        donor_mobile: '9988776655',
        amount: 15000,
        cause: 'Education Fund',
        donation_type: 'ONE_TIME',
      });

      expect(added.donor_name).toBe('Sneha Patel');
      expect(added.amount).toBe(15000);

      const afterCounts = getPreviewTabCounts();
      expect(afterCounts.all).toBe(initialCounts.all + 1);
      expect(afterCounts.oneTime).toBe(initialCounts.oneTime + 1);
    });

    it('renders AddDonationModal properly with all required inputs', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <AddDonationModal
            visible={true}
            onClose={() => undefined}
            onSubmit={() => undefined}
          />,
        );
      });
      const root = renderer!.root;
      expect(root.findByProps({ label: 'Donor Full Name' })).toBeDefined();
      expect(root.findByProps({ label: 'Mobile Number' })).toBeDefined();
      expect(root.findByProps({ label: 'Amount (₹)' })).toBeDefined();
    });
  });

  describe('2. Search Functionality', () => {
    it('filters rows by donor name', () => {
      const results = filterPreviewRowsAdvanced({ search: 'Aman' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.donorName.toLowerCase().includes('aman'))).toBe(true);
    });

    it('filters rows by phone number', () => {
      const results = filterPreviewRowsAdvanced({ search: '98765' });
      expect(results.length).toBeGreaterThan(0);
    });

    it('filters rows by amount', () => {
      const results = filterPreviewRowsAdvanced({ search: '25000' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.amount === 25000)).toBe(true);
    });

    it('returns empty array when search has no results', () => {
      const results = filterPreviewRowsAdvanced({ search: 'NonExistentDonorXYZ' });
      expect(results.length).toBe(0);
    });
  });

  describe('3. Category Tabs & Status Filter', () => {
    it('correctly filters rows for One-time tab', () => {
      const results = filterPreviewRowsAdvanced({ tab: 'ONE_TIME' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.donationType === 'ONE_TIME')).toBe(true);
    });

    it('correctly filters rows for Recurring tab', () => {
      const results = filterPreviewRowsAdvanced({ tab: 'RECURRING' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.donationType === 'RECURRING')).toBe(true);
    });

    it('filters by status when status filter is provided', () => {
      const results = filterPreviewRowsAdvanced({ status: 'SUCCESS' });
      expect(results.every(r => r.rawStatus === 'SUCCESS')).toBe(true);
    });
  });

  describe('4. Custom Date Range Functionality', () => {
    it('filters preview rows by custom date range', () => {
      const sepResults = filterPreviewRowsAdvanced({
        from: '2026-09-01',
        to: '2026-09-30',
      });
      expect(sepResults.length).toBeGreaterThan(0);
      expect(
        sepResults.every(
          r => r.dateText.includes('Sep 2026') || r.dateText.includes('Sept 2026'),
        ),
      ).toBe(true);

      const emptyResults = filterPreviewRowsAdvanced({
        from: '2020-01-01',
        to: '2020-01-31',
      });
      expect(emptyResults.length).toBe(0);
    });

    it('renders DateRangePickerModal with From and To fields', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <DateRangePickerModal
            visible={true}
            from={null}
            to={null}
            onApply={() => undefined}
            onClose={() => undefined}
          />,
        );
      });
      const root = renderer!.root;
      expect(root.findByProps({ children: 'Custom Date Range' })).toBeDefined();
      expect(root.findByProps({ children: 'From' })).toBeDefined();
      expect(root.findByProps({ children: 'To' })).toBeDefined();
    });
  });

  describe('5. Receipt & Details Modals', () => {
    const mockRow = {
      id: 'test-don-1',
      donorName: 'Aman Shaikh',
      memberCode: 'MEM000123',
      phone: '+91 98765 43210',
      donationTitle: 'General Donation',
      donationDescription: 'Support for mission activities',
      amount: 10000,
      dateText: '28 Sept 2026',
      timeText: '11:24 AM',
      statusLabel: 'Completed',
      statusTone: 'active' as const,
      hasReceipt: true,
      donationType: 'ONE_TIME' as const,
      rawStatus: 'SUCCESS',
    };

    it('renders DonationReceiptModal with official HRSJM receipt', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <DonationReceiptModal
            visible={true}
            row={mockRow}
            onClose={() => undefined}
          />,
        );
      });
      const root = renderer!.root;
      expect(root.findByProps({ children: 'DONATION RECEIPT' })).toBeDefined();
      expect(root.findByProps({ children: '₹ 10,000' })).toBeDefined();
    });

    it('renders DonationDetailsModal with complete donor & donation information', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <DonationDetailsModal
            visible={true}
            row={mockRow}
            onClose={() => undefined}
            onViewReceipt={() => undefined}
          />,
        );
      });
      const root = renderer!.root;
      expect(root.findByProps({ children: 'Donation Details' })).toBeDefined();
      expect(root.findByProps({ children: 'Aman Shaikh' })).toBeDefined();
    });
  });

  describe('6. Statistics Calculations', () => {
    it('computes live stats accurately from donation list', () => {
      const items = [
        {
          id: '1',
          donor_name: 'Alice',
          donor_mobile: '111',
          donor_email: null,
          cause: 'One-off aid',
          amount: 5000,
          status: 'SUCCESS',
          remark: null,
          created_at: '2026-10-01T10:00:00Z',
          updated_at: '2026-10-01T10:00:00Z',
          created_by: null,
          updated_by: null,
          deleted_at: null,
          deleted_by: null,
        },
        {
          id: '2',
          donor_name: 'Bob',
          donor_mobile: '222',
          donor_email: null,
          cause: 'Recurring monthly contribution',
          amount: 2000,
          status: 'SUCCESS',
          remark: 'monthly recurring',
          created_at: '2026-10-02T10:00:00Z',
          updated_at: '2026-10-02T10:00:00Z',
          created_by: null,
          updated_by: null,
          deleted_at: null,
          deleted_by: null,
        },
      ];

      const { stats, counts } = computeLiveStats(items, {
        from: '2026-10-01',
        to: '2026-10-31',
      });
      expect(counts.all).toBe(2);
      expect(counts.oneTime).toBe(1);
      expect(counts.recurring).toBe(1);

      const totalDonationStat = stats.find(s => s.id === 'total-donations');
      expect(totalDonationStat?.value).toBe('₹7,000');

      const totalDonorsStat = stats.find(s => s.id === 'total-donors');
      expect(totalDonorsStat?.value).toBe('2');
    });

    it('infers donation type correctly from cause and remarks', () => {
      expect(
        inferDonationType({
          cause: 'Monthly recurring gift',
          remark: '',
        } as any),
      ).toBe('RECURRING');

      expect(
        inferDonationType({
          cause: 'Relief offline cheque',
          remark: 'offline',
        } as any),
      ).toBe('OFFLINE');

      expect(
        inferDonationType({
          cause: 'General Medical Aid',
          remark: '',
        } as any),
      ).toBe('ONE_TIME');
    });
  });

  describe('7. Screen Mounting and Controls', () => {
    it('renders the complete DonationsScreen with locked approved design and all controls', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(() => {
        renderer = renderWithProviders(<DonationsScreen />);
      });
      const root = renderer!.root;

      // Page Title
      expect(root.findByProps({ children: 'Donations' })).toBeDefined();

      // Controls
      expect(root.findByProps({ title: 'Add Donation' })).toBeDefined();
      expect(root.findByProps({ title: 'Filters' })).toBeDefined();

      // Tab pills
      expect(root.findByProps({ children: 'All' })).toBeDefined();
    });
  });
});
