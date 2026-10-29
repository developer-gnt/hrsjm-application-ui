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
  /**
   * Executes genuine payment via Cashfree Payment Gateway on backend, with server-side verification.
   */
  public async executePayment(
    payload: PaymentPayload,
    paymentMethodType: PaymentMethodType,
    methodDetails: ExecutePaymentMethodDetails,
  ): Promise<PaymentReceiptDetails> {
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
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to initiate payment with Cashfree Payment Gateway.';
      throw new PaymentOutcomeError(
        'FAILED',
        'ORDER_INIT_FAILED',
        errorMsg,
        'Could not create order on payment gateway.',
        undefined,
        true,
      );
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
        await launchCashfreeWebCheckout(session.payment_session_id, isProduction);
      } catch {
        // Fall through to backend verification
      }
    } else if (Platform.OS !== 'web' && session.payment_session_id) {
      try {
        const sdk = require('react-native-cashfree-pg-sdk');
        if (sdk?.CFPaymentGatewayService) {
          const {
            CFSession,
            CFEnvironment,
            CFUPI,
            UPIMode,
            CFUPIPayment,
            Card,
            CFCardPayment,
          } = require('cashfree-pg-api-contract');

          const cfEnv = isProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
          const cfSession = new CFSession(
            session.payment_session_id,
            session.order_id,
            cfEnv,
          );

          await new Promise<void>(resolve => {
            let settled = false;
            const finish = () => {
              if (!settled) {
                settled = true;
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

            // Dispatches payment with method-specific handling
            try {
              if (
                paymentMethodType === 'upi' &&
                methodDetails.selectedUpiApp &&
                Platform.OS === 'android'
              ) {
                const appKey = methodDetails.selectedUpiApp.toLowerCase().replace(/\s/g, '') as UPIAppType;
                const pkg = UPI_PACKAGE_NAMES[appKey] || UPI_PACKAGE_NAMES.gpay;
                const upi = new CFUPI(UPIMode.INTENT, pkg);
                const upiPayment = new CFUPIPayment(cfSession, upi);
                sdk.CFPaymentGatewayService.makePayment(upiPayment);
              } else if (paymentMethodType === 'upi' && methodDetails.upiId) {
                const upi = new CFUPI(UPIMode.COLLECT, methodDetails.upiId.trim());
                const upiPayment = new CFUPIPayment(cfSession, upi);
                sdk.CFPaymentGatewayService.makePayment(upiPayment);
              } else if (
                paymentMethodType === 'card' &&
                methodDetails.cardNumber &&
                methodDetails.cardExpiry &&
                methodDetails.cardCvv
              ) {
                const [mm, yy] = methodDetails.cardExpiry.replace(/\s/g, '').split('/');
                const card = new Card(
                  methodDetails.cardNumber.replace(/\s/g, ''),
                  (methodDetails.cardHolderName || 'Card Holder').trim(),
                  mm,
                  yy,
                  methodDetails.cardCvv.trim(),
                  false,
                );
                const cardPayment = new CFCardPayment(cfSession, card);
                sdk.CFPaymentGatewayService.makePayment(cardPayment);
              } else {
                sdk.CFPaymentGatewayService.doWebPayment(cfSession);
              }
            } catch {
              finish();
            }

            // Failsafe timeout in case SDK lifecycle does not trigger callback
            setTimeout(finish, 60000);
          });
        }
      } catch {
        // Fallback to backend verification
      }
    }

    // 3. Reconcile and Verify with Backend Server
    let verifyResponse: CashfreeVerifyResponse | null = null;
    let lastNetworkError: any = null;
    const maxAttempts = sdkError ? 2 : 5;
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
