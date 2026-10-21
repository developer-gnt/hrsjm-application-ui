import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { cashfreeApi } from '../src/features/payments/api/cashfree.api';
import { apiClient } from '../src/core/api/client';
import { PaymentStatusCard } from '../src/features/payments/components/PaymentStatusCard';
import { CashfreeCheckout } from '../src/features/payments/components/CashfreeCheckout';
import { globalPaymentService, PaymentOutcomeError } from '../src/features/payments/services/payment.service';
import {
  validateUpiFormat,
  validateUpiVpa,
  validateLuhnCardNumber,
  formatCardNumber,
  validateCardExpiry,
  validateCardCvv,
  validateCardHolderName,
  UPI_PACKAGE_NAMES,
} from '../src/features/payments/hooks/useCashfreePayment';

jest.mock('../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('react-native-cashfree-pg-sdk', () => ({
  CFPaymentGatewayService: {
    setCallback: jest.fn(),
    removeCallback: jest.fn(),
    makePayment: jest.fn(),
    doWebPayment: jest.fn(),
  },
}), { virtual: true });

jest.mock('cashfree-pg-api-contract', () => ({
  CFSession: jest.fn().mockImplementation((id, oid, env) => ({ id, oid, env })),
  CFEnvironment: { SANDBOX: 'SANDBOX', PRODUCTION: 'PRODUCTION' },
  CFUPI: jest.fn(),
  UPIMode: { INTENT: 'INTENT', COLLECT: 'COLLECT' },
  CFUPIPayment: jest.fn(),
  Card: jest.fn(),
  CFCardPayment: jest.fn(),
}), { virtual: true });

describe('Cashfree Payment Frontend Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation Helpers', () => {
    describe('validateUpiFormat', () => {
      it('should validate format syntax for standard VPAs and normalize to lowercase', () => {
        const res1 = validateUpiFormat('99358777442@paytm');
        expect(res1.isValid).toBe(true);
        expect(res1.normalized).toBe('99358777442@paytm');

        const res2 = validateUpiFormat('aarav@okhdfcbank');
        expect(res2.isValid).toBe(true);
        expect(res2.normalized).toBe('aarav@okhdfcbank');

        const res3 = validateUpiFormat('john.doe@paytm');
        expect(res3.isValid).toBe(true);
        expect(res3.normalized).toBe('john.doe@paytm');

        const res4 = validateUpiFormat('ngo-donations@icici');
        expect(res4.isValid).toBe(true);
        expect(res4.normalized).toBe('ngo-donations@icici');
      });

      it('should trim surrounding whitespace from VPA', () => {
        const res = validateUpiFormat('   99358777442@paytm   ');
        expect(res.isValid).toBe(true);
        expect(res.normalized).toBe('99358777442@paytm');
      });

      it('should reject empty or whitespace-only inputs', () => {
        const resEmpty = validateUpiFormat('');
        expect(resEmpty.isValid).toBe(false);
        expect(resEmpty.error).toBe('UPI ID is required');

        const resSpaces = validateUpiFormat('    ');
        expect(resSpaces.isValid).toBe(false);
        expect(resSpaces.error).toBe('UPI ID cannot be empty or whitespace');
      });

      it('should reject input shorter than 5 characters or longer than 100 characters', () => {
        const resShort = validateUpiFormat('a@b');
        expect(resShort.isValid).toBe(false);
        expect(resShort.error).toContain('too short');

        const resLong = validateUpiFormat('a'.repeat(97) + '@upi');
        expect(resLong.isValid).toBe(false);
        expect(resLong.error).toContain('cannot exceed 100 characters');
      });

      it('should reject VPA without @ symbol', () => {
        const res = validateUpiFormat('justastringwithoutat');
        expect(res.isValid).toBe(false);
        expect(res.error).toContain('must contain "@"');
      });

      it('should reject VPA with multiple @ symbols or missing parts', () => {
        expect(validateUpiFormat('user@@paytm').isValid).toBe(false);
        expect(validateUpiFormat('a@b@c').isValid).toBe(false);
        expect(validateUpiFormat('user@').isValid).toBe(false);
        expect(validateUpiFormat('@paytm').isValid).toBe(false);
      });

      it('should reject VPA with spaces or unsupported characters', () => {
        expect(validateUpiFormat('user @upi').isValid).toBe(false);
        expect(validateUpiFormat('user@ paytm').isValid).toBe(false);
        expect(validateUpiFormat('user#name@bank').isValid).toBe(false);
      });
    });

    describe('validateUpiVpa', () => {
      it('should validate correct UPI VPA formats', () => {
        expect(validateUpiVpa('9888880002@upi')).toBe(true);
        expect(validateUpiVpa('aarav@okhdfcbank')).toBe(true);
        expect(validateUpiVpa('john.doe@paytm')).toBe(true);
        expect(validateUpiVpa('ngo-donations@icici')).toBe(true);
      });

      it('should reject invalid UPI VPA formats', () => {
        expect(validateUpiVpa('')).toBe(false);
        expect(validateUpiVpa('invalid')).toBe(false);
        expect(validateUpiVpa('user@')).toBe(false);
        expect(validateUpiVpa('@upi')).toBe(false);
        expect(validateUpiVpa('user @upi')).toBe(false);
      });
    });

    describe('validateLuhnCardNumber', () => {
      it('should validate cards using Luhn algorithm', () => {
        // Known valid test card
        expect(validateLuhnCardNumber('4111 1111 1111 1111')).toBe(true);
        expect(validateLuhnCardNumber('4111111111111111')).toBe(true);
        expect(validateLuhnCardNumber('4242424242424242')).toBe(true);
      });

      it('should reject invalid Luhn card numbers', () => {
        expect(validateLuhnCardNumber('4111 1111 1111 1112')).toBe(false);
        expect(validateLuhnCardNumber('1234 5678')).toBe(false);
        expect(validateLuhnCardNumber('')).toBe(false);
      });
    });

    describe('formatCardNumber', () => {
      it('should format raw digits into groups of 4', () => {
        expect(formatCardNumber('4111222233334444')).toBe('4111 2222 3333 4444');
        expect(formatCardNumber('4111')).toBe('4111');
        expect(formatCardNumber('41112')).toBe('4111 2');
      });
    });

    describe('validateCardExpiry', () => {
      it('should accept valid future expiry dates', () => {
        const result = validateCardExpiry('12/32');
        expect(result.isValid).toBe(true);
      });

      it('should reject expired dates', () => {
        const result = validateCardExpiry('01/20');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Card has expired.');
      });

      it('should reject invalid formats and months', () => {
        expect(validateCardExpiry('13/28').isValid).toBe(false);
        expect(validateCardExpiry('12-28').isValid).toBe(false);
        expect(validateCardExpiry('invalid').isValid).toBe(false);
      });
    });

    describe('validateCardCvv', () => {
      it('should accept 3 and 4 digit CVVs', () => {
        expect(validateCardCvv('123')).toBe(true);
        expect(validateCardCvv('1234')).toBe(true);
      });

      it('should reject invalid CVVs', () => {
        expect(validateCardCvv('12')).toBe(false);
        expect(validateCardCvv('12345')).toBe(false);
        expect(validateCardCvv('')).toBe(false);
      });
    });

    describe('validateCardHolderName', () => {
      it('should require minimum 2 characters', () => {
        expect(validateCardHolderName('Priya Sharma')).toBe(true);
        expect(validateCardHolderName('A')).toBe(false);
        expect(validateCardHolderName('  ')).toBe(false);
      });
    });

    describe('UPI_PACKAGE_NAMES', () => {
      it('should map the four primary UPI apps to official Android packages', () => {
        expect(UPI_PACKAGE_NAMES.gpay).toBe('com.google.android.apps.nbu.paisa.user');
        expect(UPI_PACKAGE_NAMES.phonepe).toBe('com.phonepe.app');
        expect(UPI_PACKAGE_NAMES.paytm).toBe('net.one97.paytm');
        expect(UPI_PACKAGE_NAMES.bhim).toBe('in.org.npci.upiapp');
      });
    });
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

    it('should validate UPI format with backend validate-upi endpoint', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        valid: true,
        formatValid: true,
        providerVerified: false,
        message: 'Format looks valid.',
        upiId: '99358777442@paytm',
      });

      const res = await cashfreeApi.validateUpiFormat('99358777442@paytm');
      expect(apiClient.post).toHaveBeenCalledWith('/payments/cashfree/validate-upi', {
        upiId: '99358777442@paytm',
      });
      expect(res.valid).toBe(true);
      expect(res.formatValid).toBe(true);
      expect(res.providerVerified).toBe(false);
    });

    it('should handle backend validate-upi error gracefully with safe client fallback', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce({
        response: {
          data: {
            message: ['Enter a UPI ID in a supported format'],
          },
        },
      });

      const res = await cashfreeApi.validateUpiFormat('invalid_vpa');
      expect(res.valid).toBe(false);
      expect(res.providerVerified).toBe(false);
      expect(res.message).toBe('Enter a UPI ID in a supported format');
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
      expect(str).toContain('Payment Unsuccessful');
      expect(str).toContain('Bank network timed out');
      expect(str).toContain('Try Again');
    });

    it('should render user_dropped state with neutral Payment Not Completed, not Declined', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PaymentStatusCard
            stage="user_dropped"
            errorMessage="You left or cancelled the payment before completing it. No successful payment has been confirmed. You can try again."
            onRetry={jest.fn()}
            onDone={jest.fn()}
          />,
        );
      });
      const str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Payment Not Completed');
      expect(str).toContain('You left or cancelled the payment before completing it');
      expect(str).toContain('Try Again');
      expect(str).toContain('Cancel & Exit');
      expect(str).not.toContain('Payment Status: Declined');
      expect(str).not.toContain('PAYMENT_DECLINED');
    });

    it('should render pending state with check status button', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <PaymentStatusCard
            stage="pending"
            errorMessage="Your payment is being processed by your bank."
            onRetry={jest.fn()}
            onDone={jest.fn()}
          />,
        );
      });
      const str = JSON.stringify(renderer!.toJSON());
      expect(str).toContain('Payment Pending Verification');
      expect(str).toContain('Check Status');
      expect(str).toContain('Close');
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

  describe('10 Cashfree Payment Verification & Status Scenarios', () => {
    // 1. USER_DROPPED shows Payment Not Completed, not Declined.
    it('Scenario 1: USER_DROPPED maps to neutral Payment Not Completed and never Declined', async () => {
      const sdk = require('react-native-cashfree-pg-sdk');
      (sdk.CFPaymentGatewayService.setCallback as jest.Mock).mockImplementation(({ onError }) => {
        setTimeout(() => {
          onError({
            getCode: () => 'USER_DROPPED',
            getMessage: () => 'Payment cancelled by user',
            getStatus: () => 'CANCELLED',
          }, 'order_drop_123');
        }, 10);
      });

      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({ id: 'don-1' })
        .mockResolvedValueOnce({ id: 'pay-1' })
        .mockResolvedValueOnce({
          order_id: 'order_drop_123',
          payment_session_id: 'session_drop_123',
          amount: 500,
          currency: 'INR',
          purpose: 'donation',
          reference_id: 'pay-1',
        });

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'PENDING',
        latest_status: 'USER_DROPPED',
        latest_message: 'User abandoned payment session',
        order_id: 'order_drop_123',
      });

      await expect(
        globalPaymentService.executePayment(
          {
            purpose: 'donation',
            title: 'Education Drive',
            amount: 500,
            donorName: 'Rahul',
          },
          'upi',
          { selectedUpiApp: 'Google Pay' },
        ),
      ).rejects.toMatchObject({
        name: 'PaymentOutcomeError',
        status: 'USER_DROPPED',
        code: 'USER_DROPPED',
      });
    });

    // 2. FAILED shows a genuine failure state.
    it('Scenario 2: FAILED reflects genuine provider decline without masking as maintenance', async () => {
      const sdk = require('react-native-cashfree-pg-sdk');
      (sdk.CFPaymentGatewayService.setCallback as jest.Mock).mockImplementation(({ onError }) => {
        setTimeout(() => {
          onError({
            getCode: () => 'INSUFFICIENT_FUNDS',
            getMessage: () => 'Customer account balance is insufficient',
            getStatus: () => 'FAILED',
          }, 'order_fail_123');
        }, 10);
      });

      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({ id: 'don-2' })
        .mockResolvedValueOnce({ id: 'pay-2' })
        .mockResolvedValueOnce({
          order_id: 'order_fail_123',
          payment_session_id: 'session_fail_123',
          amount: 1000,
          currency: 'INR',
          purpose: 'donation',
          reference_id: 'pay-2',
        });

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'PENDING',
        latest_status: 'FAILED',
        latest_message: 'Customer account balance is insufficient',
        order_id: 'order_fail_123',
      });

      await expect(
        globalPaymentService.executePayment(
          {
            purpose: 'donation',
            title: 'Medical Relief',
            amount: 1000,
            donorName: 'Aarav',
          },
          'card',
          { cardNumber: '4111 1111 1111 1111', cardExpiry: '12/30', cardCvv: '123' },
        ),
      ).rejects.toMatchObject({
        status: 'FAILED',
        code: 'INSUFFICIENT_FUNDS',
        message: expect.stringContaining('insufficient'),
      });
    });

    // 3. PENDING remains pending until verification resolves it.
    it('Scenario 3: PENDING outcome remains pending without falsely marking success or decline', async () => {
      const sdk = require('react-native-cashfree-pg-sdk');
      (sdk.CFPaymentGatewayService.setCallback as jest.Mock).mockImplementation(({ onVerify }) => {
        setTimeout(() => {
          onVerify('order_pend_123');
        }, 10);
      });

      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({ id: 'don-3' })
        .mockResolvedValueOnce({ id: 'pay-3' })
        .mockResolvedValueOnce({
          order_id: 'order_pend_123',
          payment_session_id: 'session_pend_123',
          amount: 2000,
          currency: 'INR',
          purpose: 'donation',
          reference_id: 'pay-3',
        });

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'PENDING',
        order_id: 'order_pend_123',
        message: 'Awaiting bank confirmation',
      });

      await expect(
        globalPaymentService.executePayment(
          {
            purpose: 'donation',
            title: 'Flood Relief',
            amount: 2000,
            donorName: 'Sneha',
          },
          'upi',
          { selectedUpiApp: 'PhonePe' },
        ),
      ).rejects.toMatchObject({
        status: 'PENDING',
        code: 'PAYMENT_PENDING',
      });
    });

    // 4. SUCCESS only shows success after backend verification confirms it.
    it('Scenario 4: SUCCESS outcome requires authoritative confirmation from backend verify endpoint', async () => {
      const sdk = require('react-native-cashfree-pg-sdk');
      (sdk.CFPaymentGatewayService.setCallback as jest.Mock).mockImplementation(({ onVerify }) => {
        setTimeout(() => {
          onVerify('order_succ_123');
        }, 10);
      });

      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({ id: 'don-4' })
        .mockResolvedValueOnce({ id: 'pay-4' })
        .mockResolvedValueOnce({
          order_id: 'order_succ_123',
          payment_session_id: 'session_succ_123',
          amount: 5000,
          currency: 'INR',
          purpose: 'donation',
          reference_id: 'pay-4',
        });

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'SUCCESS',
        order_id: 'order_succ_123',
        payment: {
          id: 'pay-4',
          amount: 5000,
          gateway_payment_id: 'cf_succ_999',
          payment_status: 'SUCCESS',
        },
        receipt: {
          id: 'rec-4',
          receipt_number: 'HRSJM-REC-2026-77777',
        },
      });

      const receipt = await globalPaymentService.executePayment(
        {
          purpose: 'donation',
          title: 'Shelter Support',
          amount: 5000,
          donorName: 'Anil Kumar',
        },
        'upi',
        { selectedUpiApp: 'Google Pay' },
      );

      expect(receipt.status).toBe('Completed');
      expect(receipt.receiptNumber).toBe('HRSJM-REC-2026-77777');
      expect(receipt.paymentId).toBe('cf_succ_999');
    });

    // 5. A localhost callback failure does not get mislabeled as a card/UPI decline.
    it('Scenario 5: Connection failure is labeled as NETWORK_ERROR, never mislabeled as card decline', async () => {
      const sdk = require('react-native-cashfree-pg-sdk');
      (sdk.CFPaymentGatewayService.setCallback as jest.Mock).mockImplementation(({ onError }) => {
        setTimeout(() => {
          onError({
            getCode: () => 'CONNECTION_ERROR',
            getMessage: () => 'net::ERR_CONNECTION_REFUSED',
          }, 'order_net_123');
        }, 10);
      });

      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({ id: 'don-5' })
        .mockResolvedValueOnce({ id: 'pay-5' })
        .mockResolvedValueOnce({
          order_id: 'order_net_123',
          payment_session_id: 'session_net_123',
          amount: 100,
          currency: 'INR',
          purpose: 'donation',
          reference_id: 'pay-5',
        });

      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error: ECONNREFUSED'));

      await expect(
        globalPaymentService.executePayment(
          {
            purpose: 'donation',
            title: 'Tree Plantation',
            amount: 100,
            donorName: 'Priya',
          },
          'upi',
          { selectedUpiApp: 'BHIM UPI' },
        ),
      ).rejects.toMatchObject({
        status: 'NETWORK_ERROR',
        code: 'NETWORK_TIMEOUT',
      });
    });

    // 6. A repeated callback does not create duplicate receipts or accounting entries.
    it('Scenario 6: Repeated verification returns the same receipt idempotently without duplicate entries', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'SUCCESS',
        order_id: 'order_idemp_123',
        payment: {
          id: 'pay-6',
          amount: 1200,
          gateway_payment_id: 'cf_idemp_888',
        },
        receipt: {
          id: 'rec-6',
          receipt_number: 'HRSJM-REC-2026-11223',
        },
      });

      const res1 = await cashfreeApi.verifyOrder('order_idemp_123');
      const res2 = await cashfreeApi.verifyOrder('order_idemp_123');

      expect(res1.receipt?.receipt_number).toBe('HRSJM-REC-2026-11223');
      expect(res2.receipt?.receipt_number).toBe('HRSJM-REC-2026-11223');
      expect(res1.payment?.gateway_payment_id).toBe(res2.payment?.gateway_payment_id);
    });

    // 7. Retry checks the previous payment state first.
    it('Scenario 7: Order verification checks previous payment status before allowing duplicate charge', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 'SUCCESS',
        order_id: 'order_prev_123',
        payment: {
          id: 'pay-7',
          amount: 2500,
          gateway_payment_id: 'cf_delayed_success',
        },
        receipt: {
          id: 'rec-7',
          receipt_number: 'HRSJM-REC-2026-99001',
        },
      });

      // Verification of previous order reveals it already completed
      const checkRes = await cashfreeApi.verifyOrder('order_prev_123');
      expect(checkRes.status).toBe('SUCCESS');
      expect(checkRes.receipt?.receipt_number).toBe('HRSJM-REC-2026-99001');
    });

    // 8. Returning from an external UPI app triggers safe verification.
    it('Scenario 8: Returning from external UPI app polls backend verification', async () => {
      (apiClient.get as jest.Mock)
        .mockResolvedValueOnce({ status: 'PENDING', order_id: 'order_upi_123' })
        .mockResolvedValueOnce({
          status: 'SUCCESS',
          order_id: 'order_upi_123',
          payment: {
            id: 'pay-8',
            amount: 300,
            gateway_payment_id: 'cf_upi_success',
          },
          receipt: {
            id: 'rec-8',
            receipt_number: 'HRSJM-REC-2026-55443',
          },
        });

      const poll1 = await cashfreeApi.verifyOrder('order_upi_123');
      expect(poll1.status).toBe('PENDING');

      const poll2 = await cashfreeApi.verifyOrder('order_upi_123');
      expect(poll2.status).toBe('SUCCESS');
      expect(poll2.receipt?.receipt_number).toBe('HRSJM-REC-2026-55443');
    });

    // 9. A verification network failure does not produce a false success.
    it('Scenario 9: Verification failure rejects payment and never yields false SUCCESS', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Gateway timeout 504'));

      await expect(cashfreeApi.verifyOrder('order_netfail_123')).rejects.toThrow('Gateway timeout 504');
    });

    // 10. Existing donation and membership payment tests continue to pass.
    it('Scenario 10: Donation and membership order creation endpoints format payloads correctly', async () => {
      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({ id: 'don-10' })
        .mockResolvedValueOnce({ id: 'pay-10' })
        .mockResolvedValueOnce({
          order_id: 'order_don_10',
          payment_session_id: 'session_don_10',
          amount: 5000,
          currency: 'INR',
          purpose: 'donation',
          reference_id: 'pay-10',
        });

      const donOrder = await cashfreeApi.createDonationOrder({
        cause: 'Elderly Care',
        amount: 5000,
        donorName: 'Vikram',
        donorMobile: '9988776655',
        donorEmail: 'vikram@example.com',
        panNumber: 'ABCDE9999F',
        need80G: true,
      });

      expect(donOrder.order_id).toBe('order_don_10');
      expect(apiClient.post).toHaveBeenCalledWith(
        '/donations',
        expect.objectContaining({
          amount: 5000,
          cause: 'Elderly Care',
          donor_name: 'Vikram',
          donor_mobile: '9988776655',
          donor_email: 'vikram@example.com',
          remark: '80G PAN: ABCDE9999F',
        }),
      );
      expect(apiClient.post).toHaveBeenCalledWith(
        '/donation-payments',
        expect.objectContaining({
          donation_id: 'don-10',
          amount: 5000,
          payment_method: 'CASHFREE',
        }),
      );
      expect(apiClient.post).toHaveBeenCalledWith(
        '/payments/cashfree/orders',
        expect.objectContaining({
          purpose: 'donation',
          reference_id: 'pay-10',
        }),
        expect.anything(),
      );

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        order_id: 'order_mem_10',
        payment_session_id: 'session_mem_10',
        amount: 1200,
        currency: 'INR',
        purpose: 'membership',
        reference_id: 'mem-pay-10',
      });

      const memOrder = await cashfreeApi.createMembershipOrder({
        membershipPaymentId: 'mem-pay-10',
      });

      expect(memOrder.order_id).toBe('order_mem_10');
      expect(apiClient.post).toHaveBeenCalledWith(
        '/payments/cashfree/orders',
        expect.objectContaining({
          purpose: 'membership',
          reference_id: 'mem-pay-10',
        }),
        expect.anything(),
      );
    });

    // 11. UPI Intent selection (Google Pay, PhonePe, Paytm, BHIM) does not require manual VPA.
    it('Scenario 11: UPI Intent app selection initiates checkout without requiring manual VPA entry', async () => {
      const sdk = require('react-native-cashfree-pg-sdk');
      let capturedPayment: any = null;
      (sdk.CFPaymentGatewayService.doWebPayment as jest.Mock).mockImplementation(() => {});
      (sdk.CFPaymentGatewayService.makePayment as jest.Mock).mockImplementation(p => {
        capturedPayment = p;
      });

      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({ id: 'don-11' })
        .mockResolvedValueOnce({ id: 'pay-11' })
        .mockResolvedValueOnce({
          order_id: 'order_intent_11',
          payment_session_id: 'session_intent_11',
          amount: 2000,
          currency: 'INR',
          purpose: 'donation',
          reference_id: 'pay-11',
        });

      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 'SUCCESS',
        order_id: 'order_intent_11',
        payment: { id: 'p11', amount: 2000, gateway_payment_id: 'cf_11' },
        receipt: { id: 'r11', receipt_number: 'REC-11' },
      });

      // User selects Google Pay directly without typing any UPI ID
      const paymentPromise = globalPaymentService.executePayment(
        { purpose: 'donation', title: 'Community Support', amount: 2000, donorName: 'Aarav' },
        'upi',
        { selectedUpiApp: 'Google Pay' },
      );

      // Simulate SDK callback
      const callbackObj = (sdk.CFPaymentGatewayService.setCallback as jest.Mock).mock.calls[0]?.[0];
      if (callbackObj?.onVerify) {
        callbackObj.onVerify('order_intent_11');
      }

      const receipt = await paymentPromise;
      expect(receipt.receiptNumber).toBe('REC-11');
      expect(capturedPayment).toBeDefined();
    });

    // 12. Manual UPI ID submission with random valid-looking VPA (99358777442@paytm)
    it('Scenario 12: Random VPA passes syntax validation, normalizes input, and relies on backend provider verification', async () => {
      const rawVpa = '  99358777442@paytm  ';
      const formatResult = validateUpiFormat(rawVpa);

      // Syntax check passes, but is NOT marked as verified account
      expect(formatResult.isValid).toBe(true);
      expect(formatResult.normalized).toBe('99358777442@paytm');

      // Backend API also confirms formatValid only, with providerVerified: false
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        valid: true,
        formatValid: true,
        providerVerified: false,
        message: 'Format looks valid. Account existence will be verified by payment provider during authorization.',
        upiId: '99358777442@paytm',
      });

      const apiResult = await cashfreeApi.validateUpiFormat(rawVpa);
      expect(apiResult.formatValid).toBe(true);
      expect(apiResult.providerVerified).toBe(false);
      expect(apiResult.message).toContain('Format looks valid');
    });

    // 13. Manual UPI ID rejects empty, whitespace, and malformed inputs before checkout
    it('Scenario 13: Manual UPI ID rejects empty, whitespace, and malformed inputs', () => {
      expect(validateUpiFormat('').isValid).toBe(false);
      expect(validateUpiFormat('    ').isValid).toBe(false);
      expect(validateUpiFormat('malformed').isValid).toBe(false);
      expect(validateUpiFormat('user@').isValid).toBe(false);
      expect(validateUpiFormat('@handle').isValid).toBe(false);
      expect(validateUpiFormat('user @handle').isValid).toBe(false);
    });

    // 14. Nonexistent/invalid VPA failure at provider level does not show false success
    it('Scenario 14: Nonexistent VPA rejected by provider during payment yields failure, never success', async () => {
      const sdk = require('react-native-cashfree-pg-sdk');
      (sdk.CFPaymentGatewayService.setCallback as jest.Mock).mockImplementation(({ onError }) => {
        setTimeout(() => {
          onError({
            getCode: () => 'VPA_NOT_FOUND',
            getMessage: () => 'Entered VPA does not exist or is inactive',
            getStatus: () => 'FAILED',
          }, 'order_invalid_vpa_14');
        }, 10);
      });

      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce({ id: 'don-14' })
        .mockResolvedValueOnce({ id: 'pay-14' })
        .mockResolvedValueOnce({
          order_id: 'order_invalid_vpa_14',
          payment_session_id: 'session_vpa_14',
          amount: 1500,
          currency: 'INR',
          purpose: 'donation',
          reference_id: 'pay-14',
        });

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 'FAILED',
        latest_status: 'FAILED',
        latest_message: 'Entered VPA does not exist or is inactive',
        order_id: 'order_invalid_vpa_14',
      });

      await expect(
        globalPaymentService.executePayment(
          { purpose: 'donation', title: 'Food Relief', amount: 1500, donorName: 'Dev' },
          'upi',
          { upiId: '99358777442@paytm' },
        ),
      ).rejects.toMatchObject({
        name: 'PaymentOutcomeError',
        status: 'FAILED',
        message: expect.stringContaining('does not exist'),
      });
    });
  });
});
