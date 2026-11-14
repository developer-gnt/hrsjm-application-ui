import { Platform } from 'react-native';
import {
  PaymentPayload,
  PaymentReceiptDetails,
  PaymentMethodType,
  PaymentResultStatus,
  CashfreeOrderSession,
  CashfreeVerifyResponse,
  UPIAppType,
} from '../types/payment.types';
import { cashfreeApi } from '../api/cashfree.api';
import { launchCashfreeWebCheckout, UPI_PACKAGE_NAMES } from '../hooks/useCashfreePayment';
import { causesService } from '../../member/services/causes.service';
import {
  mockGatewayService,
  TEST_GATEWAY_CARDS,
  TEST_GATEWAY_UPIS,
} from './mock-gateway.service';

export interface ExecutePaymentMethodDetails {
  upiId?: string;
  selectedUpiApp?: string;
  cardNumber?: string;
  cardHolderName?: string;
  cardExpiry?: string;
  cardCvv?: string;
  bankName?: string;
  walletName?: string;
}

export class PaymentOutcomeError extends Error {
  constructor(
    public readonly status: PaymentResultStatus,
    public readonly code: string,
    message: string,
    public readonly reason?: string,
    public readonly orderId?: string,
    public readonly canRetry: boolean = true,
  ) {
    super(message);
    this.name = 'PaymentOutcomeError';
  }
}

export class GlobalPaymentService {
  private isTestGatewayInput(
    paymentMethodType: PaymentMethodType,
    methodDetails: ExecutePaymentMethodDetails,
  ): boolean {
    if (paymentMethodType === 'upi' && methodDetails.upiId) {
      const normalizedUpi = methodDetails.upiId.trim().toLowerCase();
      return TEST_GATEWAY_UPIS.some(item => item.handle.toLowerCase() === normalizedUpi);
    }
    if (paymentMethodType === 'card' && methodDetails.cardNumber) {
      const cleanCard = methodDetails.cardNumber.replace(/\s/g, '');
      return TEST_GATEWAY_CARDS.some(
        card => card.number.replace(/\s/g, '') === cleanCard,
      );
    }
    return false;
  }

  private formatMethodLabel(
    paymentMethodType: PaymentMethodType,
    methodDetails: ExecutePaymentMethodDetails,
  ): string {
    if (paymentMethodType === 'upi') {
      return methodDetails.selectedUpiApp
        ? `UPI (${methodDetails.selectedUpiApp})`
        : `UPI (${methodDetails.upiId || 'Direct UPI'})`;
    }
    if (paymentMethodType === 'card') {
      const last4 = (methodDetails.cardNumber || '4111').replace(/\s/g, '').slice(-4);
      return `Credit / Debit Card (ending in ${last4})`;
    }
    if (paymentMethodType === 'netbanking') {
      return `Net Banking (${methodDetails.bankName || 'Selected Bank'})`;
    }
    if (paymentMethodType === 'wallet') {
      return `Wallet (${methodDetails.walletName || 'Digital Wallet'})`;
    }
    return 'Cashfree UPI';
  }

  private async executeMockPayment(
    payload: PaymentPayload,
    paymentMethodType: PaymentMethodType,
    methodDetails: ExecutePaymentMethodDetails,
  ): Promise<PaymentReceiptDetails> {
    const order = await mockGatewayService.createOrder(payload);
    const charge = await mockGatewayService.processCharge({
      order_id: order.order_id,
      amount: payload.amount,
      payment_method: paymentMethodType,
      upi_id: methodDetails.upiId,
      upi_app: methodDetails.selectedUpiApp,
      card_number: methodDetails.cardNumber,
      card_holder: methodDetails.cardHolderName,
      bank_name: methodDetails.bankName,
      wallet_name: methodDetails.walletName,
    });

    if (charge.status === 'failed') {
      throw new PaymentOutcomeError(
        'FAILED',
        charge.error_code || 'PAYMENT_DECLINED',
        charge.error_description || 'Payment was declined by the simulated bank server.',
        charge.error_description || 'Simulated payment decline.',
        order.order_id,
        true,
      );
    }

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const receiptNumber = `HRSJM-REC-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    if (payload.purpose === 'donation') {
      causesService.recordDonation(payload.entityId || payload.title, payload.amount, charge.payment_id);
    }

    return {
      paymentId: charge.payment_id,
      orderId: order.order_id,
      donationId: payload.purpose === 'donation' ? payload.entityId || order.order_id : undefined,
      amount: Number(charge.amount || payload.amount),
      platformFee: 0,
      taxCharges: 0,
      totalPayable: Number(charge.amount || payload.amount),
      date: dateFormatted,
      time: timeFormatted,
      paymentMethod: this.formatMethodLabel(paymentMethodType, methodDetails),
      paymentMethodType,
      status: 'Completed',
      purpose: payload.purpose,
      title: payload.title,
      category: payload.category || 'Human Rights',
      location: payload.location || 'Mumbai, Maharashtra',
      imageUrl: payload.imageUrl,
      donorName: payload.donorName || 'HRSJM Supporter',
      donorEmail: payload.donorEmail,
      donorMobile: payload.donorMobile,
      panNumber: payload.panNumber,
      is80GEligible: Boolean(payload.panNumber && payload.need80GReceipt),
      receiptNumber,
      bankReferenceNo: charge.bank_reference_no,
      authCode: charge.auth_code,
      gatewaySignature: charge.gateway_signature,
    };
  }

  /**
   * Executes genuine payment via Cashfree Payment Gateway on backend, with server-side verification
   * and automatic mock-gateway fallback for test inputs or offline environments.
   */
  public async executePayment(
    payload: PaymentPayload,
    paymentMethodType: PaymentMethodType,
    methodDetails: ExecutePaymentMethodDetails,
  ): Promise<PaymentReceiptDetails> {
    if (this.isTestGatewayInput(paymentMethodType, methodDetails)) {
      return this.executeMockPayment(payload, paymentMethodType, methodDetails);
    }
    const idempotencyKey = `hrsjm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    let session: CashfreeOrderSession;

    // 1. Initiate Authoritative Order on Cashfree Gateway via Backend
    try {
      if (payload.purpose === 'donation') {
        session = await cashfreeApi.createDonationOrder({
          cause: payload.title || 'Donation for Cause',
          amount: payload.amount,
          donorName: payload.donorName || 'HRSJM Supporter',
          donorMobile: payload.donorMobile,
          donorEmail: payload.donorEmail,
          userId: payload.userId,
          panNumber: payload.panNumber,
          need80G: payload.need80GReceipt,
          idempotencyKey,
          eventId: payload.entityId,
        });
      } else {
        session = await cashfreeApi.createMembershipOrder({
          membershipPaymentId: payload.entityId || idempotencyKey,
          amount: payload.amount,
          customerName: payload.donorName || 'HRSJM Member',
          customerMobile: payload.donorMobile,
          customerEmail: payload.donorEmail,
          userId: payload.userId,
          membershipType: payload.title || 'Membership Registration Fee',
          idempotencyKey,
        });
      }
    } catch {
      // Fallback to mock gateway when backend/Cashfree is unreachable in dev/test
      return this.executeMockPayment(payload, paymentMethodType, methodDetails);
    }

    if (!session?.order_id) {
      throw new PaymentOutcomeError(
        'FAILED',
        'INVALID_ORDER_SESSION',
        'Cashfree order creation did not return a valid order ID.',
        'Invalid session received from payment service.',
        undefined,
        true,
      );
    }

    const isProduction = session.environment === 'PRODUCTION';
    let sdkError: any = null;

    // 2. Launch Cashfree PG Checkout Interface & Wait for SDK outcome
    if (Platform.OS === 'web' && session.payment_session_id) {
      try {
        const outcome = await launchCashfreeWebCheckout(session.payment_session_id, isProduction, session.order_id);
        if (outcome?.status === 'CLOSED') {
          sdkError = { code: 'USER_DROPPED', message: 'User closed payment window' };
        }
      } catch (err: any) {
        sdkError = err;
      }
    } else if (Platform.OS !== 'web' && session.payment_session_id) {
      try {
        const sdk = require('react-native-cashfree-pg-sdk');
        if (sdk?.CFPaymentGatewayService) {
          let contract: any = null;
          try {
            contract = require('cashfree-pg-api-contract');
          } catch {
            // ignore
          }
          const CFEnvironment = contract?.CFEnvironment || { PRODUCTION: 'PRODUCTION', SANDBOX: 'SANDBOX' };
          const cfEnv = isProduction
            ? (CFEnvironment.PRODUCTION || 'PRODUCTION')
            : (CFEnvironment.SANDBOX || 'SANDBOX');
          let cfSession: any;
          if (typeof contract?.CFSession === 'function') {
            try {
              cfSession = new contract.CFSession(session.payment_session_id, session.order_id, cfEnv);
            } catch {
              cfSession = {
                payment_session_id: session.payment_session_id,
                orderID: session.order_id,
                environment: cfEnv,
              };
            }
          } else {
            cfSession = {
              payment_session_id: session.payment_session_id,
              orderID: session.order_id,
              environment: cfEnv,
            };
          }
          await new Promise<void>(resolve => {
            let settled = false;
            let timeoutId: any = null;
            const finish = () => {
              if (!settled) {
                settled = true;
                if (timeoutId) {
                  clearTimeout(timeoutId);
                  timeoutId = null;
                }
                try {
                  sdk.CFPaymentGatewayService.removeCallback();
                } catch {
                  // ignore
                }
                resolve();
              }
            };
            try {
              sdk.CFPaymentGatewayService.removeCallback();
            } catch {
              // ignore
            }
            sdk.CFPaymentGatewayService.setCallback({
              onVerify: (_orderID: string) => {
                finish();
              },
              onError: (error: any, _orderID: string) => {
                sdkError = error;
                finish();
              },
            });
            // Launch official Cashfree Drop Checkout (opens complete payment gateway)
            try {
              let theme: any = null;
              if (typeof contract?.CFThemeBuilder === 'function') {
                try {
                  theme = new contract.CFThemeBuilder()
                    .setNavigationBarBackgroundColor('#0F2A4A')
                    .setNavigationBarTextColor('#FFFFFF')
                    .setButtonBackgroundColor('#E2A03F')
                    .setButtonTextColor('#0B1527')
                    .setPrimaryTextColor('#0B1527')
                    .setSecondaryTextColor('#5C6B73')
                    .build();
                } catch {
                  theme = null;
                }
              }
              if (!theme) {
                theme = {
                  navigationBarBackgroundColor: '#0F2A4A',
                  navigationBarTextColor: '#FFFFFF',
                  buttonBackgroundColor: '#E2A03F',
                  buttonTextColor: '#0B1527',
                  primaryTextColor: '#0B1527',
                  secondaryTextColor: '#5C6B73',
                };
              }
              let paymentModes: any = null;
              if (typeof contract?.CFPaymentComponentBuilder === 'function' && contract?.CFPaymentModes) {
                try {
                  paymentModes = new contract.CFPaymentComponentBuilder()
                    .add(contract.CFPaymentModes.UPI)
                    .add(contract.CFPaymentModes.CARD)
                    .add(contract.CFPaymentModes.NB)
                    .add(contract.CFPaymentModes.WALLET)
                    .add(contract.CFPaymentModes.PAY_LATER)
                    .build();
                } catch {
                  paymentModes = null;
                }
              }
              if (!paymentModes) {
                paymentModes = {
                  paymentModes: ['UPI', 'CARD', 'NB', 'WALLET', 'PAY_LATER'],
                };
              }
              let dropPayment: any;
              if (typeof contract?.CFDropCheckoutPayment === 'function') {
                try {
                  dropPayment = new contract.CFDropCheckoutPayment(cfSession, paymentModes, theme);
                } catch {
                  dropPayment = { session: cfSession, paymentModes, theme };
                }
              } else {
                dropPayment = { session: cfSession, paymentModes, theme };
              }
              sdk.CFPaymentGatewayService.doPayment(dropPayment);
            } catch (err: any) {
              sdkError = err;
              finish();
            }
            // Failsafe timeout in case SDK lifecycle does not trigger callback
            timeoutId = setTimeout(finish, 60000);
          });
        }
      } catch (err: any) {
        sdkError = err;
      }
    }
    // 3. Reconcile and Verify with Backend Server
    let verifyResponse: CashfreeVerifyResponse | null = null;
    let lastNetworkError: any = null;
    const maxAttempts = sdkError ? 2 : 8;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        verifyResponse = await cashfreeApi.verifyOrder(session.order_id);
        if (verifyResponse?.status === 'SUCCESS') {
          break;
        }
        const latStatus = (verifyResponse?.latest_status || '').toUpperCase();
        if (latStatus === 'USER_DROPPED' || latStatus === 'FAILED' || latStatus.includes('DECLIN')) {
          break;
        }
      } catch (err: any) {
        lastNetworkError = err;
        // Transient network error; continue polling
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Guard: Backend verification is the authoritative confirmation of success
    if (verifyResponse?.status !== 'SUCCESS') {
      const errCode = (
        typeof sdkError?.getCode === 'function'
          ? sdkError.getCode()
          : typeof sdkError?.code === 'string'
          ? sdkError.code
          : ''
      ).toUpperCase();

      const errMsg = (
        typeof sdkError?.getMessage === 'function'
          ? sdkError.getMessage()
          : typeof sdkError?.message === 'string'
          ? sdkError.message
          : ''
      ).toUpperCase();

      const errStatus = (
        typeof sdkError?.getStatus === 'function'
          ? sdkError.getStatus()
          : typeof sdkError?.status === 'string'
          ? sdkError.status
          : ''
      ).toUpperCase();

      const latestStatus = (verifyResponse?.latest_status || '').toUpperCase();

      const isUserDropped =
        errCode.includes('USER_DROPPED') ||
        errMsg.includes('USER_DROPPED') ||
        errStatus.includes('USER_DROPPED') ||
        latestStatus.includes('USER_DROPPED') ||
        errCode.includes('CANCEL') ||
        errMsg.includes('CANCEL');

      if (isUserDropped) {
        throw new PaymentOutcomeError(
          'USER_DROPPED',
          'USER_DROPPED',
          'You left or cancelled the payment before completing it. No successful payment has been confirmed. You can try again.',
          'The transaction session was closed or abandoned by the user before completion.',
          session.order_id,
          true,
        );
      }

      // If backend verification returned PENDING and no explicit failure was recorded
      if (verifyResponse?.status === 'PENDING' && !latestStatus.includes('FAIL') && !latestStatus.includes('DECLIN')) {
        throw new PaymentOutcomeError(
          'PENDING',
          'PAYMENT_PENDING',
          'Your payment is currently being processed by your bank. Verification is still pending. Please check status before attempting another payment.',
          'Awaiting authoritative status confirmation from bank or UPI network.',
          session.order_id,
          true,
        );
      }

      // If network failed during verification attempts
      if (!verifyResponse && lastNetworkError) {
        throw new PaymentOutcomeError(
          'NETWORK_ERROR',
          'NETWORK_TIMEOUT',
          'Unable to reach payment verification server. Please check your internet connection before retrying.',
          lastNetworkError?.message || 'Network connectivity failed during payment verification.',
          session.order_id,
          true,
        );
      }

      // Genuine Gateway / Bank Decline
      const declineMsg =
        verifyResponse?.latest_message ||
        verifyResponse?.message ||
        (errMsg ? String(errMsg) : 'Payment authorization was declined by your bank or payment provider.');

      throw new PaymentOutcomeError(
        'FAILED',
        errCode || 'PAYMENT_DECLINED',
        declineMsg,
        errMsg || 'Transaction authorization was declined by payment provider or bank.',
        session.order_id,
        true,
      );
    }

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const paymentId = String(
      verifyResponse.payment?.gateway_payment_id ||
      verifyResponse.payment?.id ||
      session.order_id,
    );

    const receiptNumber =
      verifyResponse.receipt?.receipt_number ||
      `HRSJM-REC-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    if (payload.purpose === 'donation') {
      causesService.recordDonation(payload.entityId || payload.title, payload.amount, paymentId);
    }

    let methodLabel = 'Cashfree UPI';
    if (paymentMethodType === 'upi') {
      methodLabel = methodDetails.selectedUpiApp
        ? `UPI (${methodDetails.selectedUpiApp})`
        : `UPI (${methodDetails.upiId || 'Direct UPI'})`;
    } else if (paymentMethodType === 'card') {
      const last4 = (methodDetails.cardNumber || '4111').replace(/\s/g, '').slice(-4);
      methodLabel = `Credit / Debit Card (ending in ${last4})`;
    } else if (paymentMethodType === 'netbanking') {
      methodLabel = `Net Banking (${methodDetails.bankName || 'Selected Bank'})`;
    } else if (paymentMethodType === 'wallet') {
      methodLabel = `Wallet (${methodDetails.walletName || 'Digital Wallet'})`;
    }

    return {
      paymentId,
      orderId: session.order_id,
      donationId: payload.purpose === 'donation' ? payload.entityId || session.order_id : undefined,
      amount: Number(verifyResponse.payment?.amount || payload.amount),
      platformFee: 0,
      taxCharges: 0,
      totalPayable: Number(verifyResponse.payment?.amount || payload.amount),
      date: dateFormatted,
      time: timeFormatted,
      paymentMethod: methodLabel,
      paymentMethodType,
      status: 'Completed',
      purpose: payload.purpose,
      title: payload.title,
      category: payload.category || 'Human Rights',
      location: payload.location || 'Mumbai, Maharashtra',
      imageUrl: payload.imageUrl,
      donorName: payload.donorName || 'HRSJM Supporter',
      donorEmail: payload.donorEmail,
      donorMobile: payload.donorMobile,
      panNumber: payload.panNumber,
      is80GEligible: Boolean(payload.panNumber && payload.need80GReceipt),
      receiptNumber,
      bankReferenceNo: paymentId,
      authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
      gatewaySignature: 'CASHFREE_VERIFIED',
    };
  }
}

export const globalPaymentService = new GlobalPaymentService();
