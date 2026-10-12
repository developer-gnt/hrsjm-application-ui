import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { cashfreeApi } from '../src/features/payments/api/cashfree.api';
import { apiClient } from '../src/core/api/client';
import { PaymentStatusCard } from '../src/features/payments/components/PaymentStatusCard';
import { CashfreeCheckout } from '../src/features/payments/components/CashfreeCheckout';

jest.mock('../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('Cashfree Payment Frontend Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cashfreeApi', () => {
    it('should create donation order via backend orchestration', async () => {
      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({ id: 'don-123' }) // /donations
        .mockResolvedValueOnce({ id: 'pay-456' }) // /donation-payments
        .mockResolvedValueOnce({
          order_id: 'hrsjm_don_test',
          payment_session_id: 'session_test_123',
          amount: 1000,
          currency: 'INR',
          purpose: 'donation',
          reference_id: 'pay-456',
        }); // /payments/cashfree/orders

      const res = await cashfreeApi.createDonationOrder({
        cause: 'Child Education',
        amount: 1000,
        donorName: 'Aarav Sharma',
        donorMobile: '9876543210',
        donorEmail: 'aarav@example.com',
        panNumber: 'ABCDE1234F',
        need80G: true,
      });

      expect(apiClient.post).toHaveBeenCalledTimes(3);
      expect(res.order_id).toBe('hrsjm_don_test');
      expect(res.payment_session_id).toBe('session_test_123');
    });

    it('should verify order attempts via backend verification endpoint', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 'SUCCESS',
        order_id: 'hrsjm_don_test',
        payment: {
          id: 'pay-1',
          amount: 1000,
          gateway_payment_id: 'cf_pay_999',
        },
        receipt: {
          id: 'rec-1',
          receipt_number: 'HRSJM-REC-2026-12345',
        },
      });

      const res = await cashfreeApi.verifyOrder('hrsjm_don_test');
      expect(apiClient.get).toHaveBeenCalledWith('/payments/cashfree/orders/hrsjm_don_test/verify');
      expect(res.status).toBe('SUCCESS');
      expect(res.receipt?.receipt_number).toBe('HRSJM-REC-2026-12345');
    });
  });

  describe('PaymentStatusCard Component', () => {
    it('should render processing state', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(<PaymentStatusCard stage="processing" />);
      });
      const str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Securing Payment Session');
      expect(str).toContain('Connecting to Cashfree Payment Gateway');
    });

    it('should render reconciling state with attempt indicator', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PaymentStatusCard stage="reconciling" reconcileAttempt={2} />,
        );
      });
      const str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Reconciling with Bank');
      expect(str).toContain('Verification sync (Attempt');
      expect(str).toContain('/5)');
    });

    it('should render success state with receipt and 80G tax badge', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PaymentStatusCard
            stage="success"
            receipt={{
              paymentId: 'pay-1',
              orderId: 'order-1',
              amount: 2500,
              platformFee: 0,
              taxCharges: 0,
              totalPayable: 2500,
              date: '09 Oct 2026',
              time: '04:30 PM',
              paymentMethod: 'UPI',
              paymentMethodType: 'upi',
              status: 'Completed',
              purpose: 'donation',
              title: 'Women Empowerment Drive',
              donorName: 'Priya Singh',
              is80GEligible: true,
              receiptNumber: 'HRSJM-REC-2026-99999',
            }}
          />,
        );
      });
      const str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Payment Verified & Received');
      expect(str).toContain('HRSJM-REC-2026-99999');
      expect(str).toContain('80G Tax Exemption Certificate Generated');
    });

    it('should render failed state with retry button', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PaymentStatusCard
            stage="failed"
            errorMessage="Bank network timed out"
            onRetry={jest.fn()}
          />,
        );
      });
      const str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Payment Incomplete or Declined');
      expect(str).toContain('Bank network timed out');
      expect(str).toContain('Try Again');
    });
  });

  describe('CashfreeCheckout Component', () => {
    it('should render initial secure checkout screen with amount', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <CashfreeCheckout
            payload={{
              purpose: 'donation',
              title: 'Winter Blanket Drive',
              amount: 1500,
              donorName: 'Vikram Mehta',
            }}
          />,
        );
      });
      const str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('SECURE CHECKOUT');
      expect(str).toContain('Powered by Cashfree Payments');
      expect(str).toContain('Winter Blanket Drive');
    });
  });
});
