import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { apiClient } from '../src/core/api/client';
import { cashfreeApi } from '../src/features/payments/api/cashfree.api';
import { globalPaymentService } from '../src/features/payments/services/payment.service';
import { GlobalPaymentModal } from '../src/features/payments/screens/GlobalPaymentModal';

jest.mock('../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
}));

jest.mock('react-native-cashfree-pg-sdk', () => ({
  CFPaymentGatewayService: {
    setCallback: jest.fn(),
    makePayment: jest.fn(),
    doWebPayment: jest.fn(),
    removeCallback: jest.fn(),
  },
}));

describe('Membership Payment Gateway Amount Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. Connects Cashfree PG order with exact selected fee of ₹5000 (Ambassador of State)', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({
      order_id: 'hrsjm_mem_ord_5000',
      payment_session_id: 'session_mem_5000',
      order_status: 'ACTIVE',
      amount: 5000,
      currency: 'INR',
      purpose: 'membership',
    });

    const session = await cashfreeApi.createMembershipOrder({
      membershipPaymentId: 'mem-app-12345',
      amount: 5000,
      customerName: 'Aarav Sharma',
      customerMobile: '9888880002',
      customerEmail: 'aarav@example.com',
      membershipType: 'Membership Fee - Ambassador of State',
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/payments/cashfree/orders',
      expect.objectContaining({
        purpose: 'membership',
        reference_id: 'mem-app-12345',
        amount: 5000,
        customer_name: 'Aarav Sharma',
        customer_phone: '9888880002',
        customer_email: 'aarav@example.com',
        order_note: 'Membership Fee - Ambassador of State',
      }),
      expect.anything(),
    );

    expect(session.amount).toBe(5000);
    expect(session.order_id).toBe('hrsjm_mem_ord_5000');
  });

  it('2. GlobalPaymentService.executePayment forwards the selected fee of ₹5000 to gateway API', async () => {
    const sdk = require('react-native-cashfree-pg-sdk');
    (sdk.CFPaymentGatewayService.setCallback as jest.Mock).mockImplementation(({ onVerify }) => {
      setTimeout(() => {
        onVerify('hrsjm_mem_ambassador_5000');
      }, 10);
    });

    (apiClient.post as jest.Mock).mockResolvedValue({
      order_id: 'hrsjm_mem_ambassador_5000',
      payment_session_id: 'session_5000',
      order_status: 'ACTIVE',
      amount: 5000,
      currency: 'INR',
      purpose: 'membership',
    });

    (apiClient.get as jest.Mock).mockResolvedValue({
      status: 'SUCCESS',
      order_id: 'hrsjm_mem_ambassador_5000',
      payment: {
        id: 'pay_cf_5000',
        amount: 5000,
        gateway_payment_id: 'cf_pay_5000',
        payment_status: 'SUCCESS',
      },
    });

    const receipt = await globalPaymentService.executePayment(
      {
        purpose: 'membership',
        title: 'Membership Fee - Ambassador of State',
        subtitle: 'Human Rights & Social Justice Mission',
        category: 'New Membership Registration',
        amount: 5000,
        donorName: 'Dr. Ramesh Gupta',
        donorMobile: '9876543210',
        donorEmail: 'ramesh@hrsjm.org',
        entityId: 'mem-app-custom-5000',
      },
      'upi',
      { selectedUpiApp: 'Google Pay' },
    );

    expect(apiClient.post).toHaveBeenCalledWith(
      '/payments/cashfree/orders',
      expect.objectContaining({
        purpose: 'membership',
        amount: 5000,
      }),
      expect.anything(),
    );

    expect(receipt.amount).toBe(5000);
    expect(receipt.totalPayable).toBe(5000);
    expect(receipt.status).toBe('Completed');
  });

  it('3. GlobalPaymentModal renders the exact selected fee and locks amount for membership', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <GlobalPaymentModal
          visible={true}
          initialStage="checkout"
          payload={{
            purpose: 'membership',
            title: 'Membership Fee - Ambassador of State',
            category: 'New Membership Registration',
            amount: 5000,
            donorName: 'Test Applicant',
            donorMobile: '9999999999',
            donorEmail: 'applicant@example.com',
            entityId: 'mem-app-1',
          }}
          onClose={jest.fn()}
        />,
      );
    });

    const str = JSON.stringify(renderer!.toJSON());

    // Displays Registration Fee instead of Donation Amount
    expect(str).toContain('Registration Fee');

    // Renders exact 5,000 amount
    expect(str).toContain('5,000');

    // Bottom checkout button shows Pay and 5,000
    expect(str).toContain('Pay');
    expect(str).toContain('5,000');

    // Edit Amount button should NOT be shown for fixed membership fee
    expect(str).not.toContain('Edit Amount');
  });

  it('4. GlobalPaymentModal supports different category fees (e.g. ₹800, ₹3000)', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <GlobalPaymentModal
          visible={true}
          initialStage="checkout"
          payload={{
            purpose: 'membership',
            title: 'Membership Fee - District Active Member',
            category: 'New Membership Registration',
            amount: 800,
            donorName: 'District Member',
            donorMobile: '9888880001',
            entityId: 'mem-app-dist',
          }}
          onClose={jest.fn()}
        />,
      );
    });

    const str = JSON.stringify(renderer!.toJSON());
    expect(str).toContain('800');
    expect(str).toContain('Pay');
    expect(str).not.toContain('Edit Amount');
  });
});
