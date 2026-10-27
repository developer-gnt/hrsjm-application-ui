import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import {
  MembershipDetailsInfoTab,
} from '../src/features/admin/membershipApplications/components/MembershipDetailsInfoTab';
import {
  MembershipApplicantSummaryCard,
} from '../src/features/admin/membershipApplications/components/MembershipApplicantSummaryCard';
import {
  MembershipApplicationItem,
  getApplicationFeeAmount,
  getApplicationPaymentStatus,
} from '../src/features/admin/membershipApplications/types/membershipApplications.types';
import { mapBackendToApplicationItem } from '../src/features/admin/membershipApplications/services/membershipApplicationsStore';

describe('Membership Details Amount and Payment Status Display', () => {
  it('resolves fee amount correctly for Hon\'ble State Director', () => {
    const app: Partial<MembershipApplicationItem> = {
      membershipType: "Hon'ble State Director",
    };
    expect(getApplicationFeeAmount(app)).toBe('₹10,000');
  });

  it('resolves fee amount correctly when explicit amount is set', () => {
    const app: Partial<MembershipApplicationItem> = {
      amount: 3000,
      membershipType: "Hon'ble State Director",
    };
    expect(getApplicationFeeAmount(app)).toBe('₹3,000');
  });

  it('resolves fee amount correctly for seeker as Free / Aid Request', () => {
    const app: Partial<MembershipApplicationItem> = {
      accountType: 'seeker',
      membershipType: 'Donation Seeker',
    };
    expect(getApplicationFeeAmount(app)).toBe('Free / Aid Request');
  });

  it('resolves payment status as PAID when status is approved', () => {
    const app: Partial<MembershipApplicationItem> = {
      status: 'approved',
      paymentStatus: 'UNPAID',
    };
    expect(getApplicationPaymentStatus(app)).toBe('PAID');
  });

  it('resolves payment status as UNPAID when under review without payment', () => {
    const app: Partial<MembershipApplicationItem> = {
      status: 'under_review',
      paymentStatus: 'UNPAID',
    };
    expect(getApplicationPaymentStatus(app)).toBe('UNPAID');
  });

  it('resolves payment status as PAID when paymentStatus is SUCCESS / COMPLETED / PAID', () => {
    const app: Partial<MembershipApplicationItem> = {
      status: 'under_review',
      paymentStatus: 'PAID',
    };
    expect(getApplicationPaymentStatus(app)).toBe('PAID');
  });

  it('renders Amount and Payment Status (Unpaid) in MembershipDetailsInfoTab', async () => {
    const sampleApp: MembershipApplicationItem = {
      id: 'app-test-1',
      applicationId: 'HRSJM-00045',
      applicantName: 'sahil shaikh',
      accountType: 'membership',
      membershipType: "Hon'ble State Director",
      status: 'under_review',
      submittedAt: '27 Oct 2026, 06:38 PM',
      submittedDate: '2026-10-27T13:08:00Z',
      phone: '4444444444',
      email: 'sahilsk0909@gmail.com',
      gender: 'Male',
      dob: '2000-09-08',
      address: 'marol, naka, mumbai, Maharashtra, 400059',
      policeStation: 'marol',
      paymentStatus: 'UNPAID',
    };

    let renderer: any;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipDetailsInfoTab application={sampleApp} />
      );
    });

    const root = renderer.root;
    // Check Amount label and value
    expect(root.findByProps({ children: 'Amount' })).toBeDefined();
    expect(root.findByProps({ children: '₹10,000' })).toBeDefined();

    // Check Payment Status label and pill
    expect(root.findByProps({ children: 'Payment Status' })).toBeDefined();
    expect(root.findByProps({ children: 'Unpaid' })).toBeDefined();
  });

  it('renders Amount and Payment Status (Paid) in MembershipDetailsInfoTab when paid', async () => {
    const sampleApp: MembershipApplicationItem = {
      id: 'app-test-2',
      applicationId: 'HRSJM-00046',
      applicantName: 'sahil shaikh',
      accountType: 'membership',
      membershipType: "Hon'ble State Director",
      status: 'under_review',
      submittedAt: '27 Oct 2026, 06:38 PM',
      submittedDate: '2026-10-27T13:08:00Z',
      phone: '4444444444',
      email: 'sahilsk0909@gmail.com',
      gender: 'Male',
      dob: '2000-09-08',
      address: 'marol, naka, mumbai, Maharashtra, 400059',
      policeStation: 'marol',
      amount: 10000,
      paymentStatus: 'PAID',
    };

    let renderer: any;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipDetailsInfoTab application={sampleApp} />
      );
    });

    const root = renderer.root;
    expect(root.findByProps({ children: 'Amount' })).toBeDefined();
    expect(root.findByProps({ children: '₹10,000' })).toBeDefined();
    expect(root.findByProps({ children: 'Payment Status' })).toBeDefined();
    expect(root.findByProps({ children: 'Paid' })).toBeDefined();
  });

  it('renders amount and payment status in MembershipApplicantSummaryCard', async () => {
    const sampleApp: MembershipApplicationItem = {
      id: 'app-test-3',
      applicationId: 'HRSJM-00047',
      applicantName: 'sahil shaikh',
      accountType: 'membership',
      membershipType: "Hon'ble State Director",
      status: 'under_review',
      submittedAt: '27 Oct 2026, 06:38 PM',
      submittedDate: '2026-10-27T13:08:00Z',
      phone: '4444444444',
      email: 'sahilsk0909@gmail.com',
      gender: 'Male',
      dob: '2000-09-08',
      paymentStatus: 'PAID',
    };

    let renderer: any;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MembershipApplicantSummaryCard application={sampleApp} />
      );
    });

    const root = renderer.root;
    expect(root.findByProps({ children: '₹10,000 • Paid' })).toBeDefined();
  });

  it('maps amount and paymentStatus from database payment record in mapBackendToApplicationItem', () => {
    const backendData: any = {
      id: 'uuid-1',
      membership_number: 'HRSJM-00047',
      status: 'UNDER_REVIEW',
      created_at: '2026-10-27T13:00:00Z',
      user: {
        full_name: 'Sahil Shaikh',
        mobile_number: '4444444444',
      },
      category: {
        name: "Hon'ble State Director",
        fee: 10000,
      },
      payment: {
        amount: 10000,
        payment_status: 'SUCCESS',
      },
    };

    const mapped = mapBackendToApplicationItem(backendData);
    expect(mapped.amount).toBe(10000);
    expect(mapped.paymentStatus).toBe('PAID');
  });

  it('maps category fee from database when no payment record exists in mapBackendToApplicationItem', () => {
    const backendData: any = {
      id: 'uuid-2',
      membership_number: 'HRSJM-00048',
      status: 'PENDING',
      created_at: '2026-10-27T13:00:00Z',
      user: {
        full_name: 'Test Applicant',
        mobile_number: '9999999999',
      },
      category: {
        name: 'District Unit',
        fee: 1300,
      },
      payment: null,
    };

    const mapped = mapBackendToApplicationItem(backendData);
    expect(mapped.amount).toBe(1300);
    expect(mapped.paymentStatus).toBe('UNPAID');
  });
});
