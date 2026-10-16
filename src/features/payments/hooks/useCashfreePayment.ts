import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { cashfreeApi } from '../api/cashfree.api';
import {
  CashfreeOrderSession,
  PaymentPayload,
  PaymentReceiptDetails,
  PaymentStage,
} from '../types/payment.types';

export interface UseCashfreePaymentOptions {
  onSuccess?: (receipt: PaymentReceiptDetails) => void;
  onError?: (errorMessage: string) => void;
  onClose?: () => void;
}

/**
 * Loads Cashfree JS SDK on web and opens official checkout modal
 */
export async function launchCashfreeWebCheckout(
  paymentSessionId: string,
  isProduction = false,
): Promise<void> {
  const globalObj: any = typeof globalThis !== 'undefined' ? globalThis : {};
  const win = globalObj?.window || globalObj;
  const doc = globalObj?.document;

  if (!win || !doc || Platform.OS !== 'web') return;

  const loadSdk = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (win.Cashfree) {
        return resolve(win.Cashfree);
      }
      const existing = doc.getElementById('cashfree-js-sdk');
      if (existing) {
        existing.addEventListener('load', () => resolve(win.Cashfree));
        return;
      }
      try {
        const script = doc.createElement('script');
        script.id = 'cashfree-js-sdk';
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => resolve(win.Cashfree);
        script.onerror = () => reject(new Error('Failed to load Cashfree Web SDK'));
        doc.head.appendChild(script);
      } catch {
        resolve(null);
      }
    });
  };

  try {
    const CashfreeFactory = await loadSdk();
    if (CashfreeFactory) {
      const cashfree = CashfreeFactory({ mode: isProduction ? 'production' : 'sandbox' });
      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_modal',
      });
    }
  } catch (err) {
    const checkoutUrl = isProduction
      ? `https://api.cashfree.com/pg/view/sessions/${paymentSessionId}`
      : `https://sandbox.cashfree.com/pg/view/sessions/${paymentSessionId}`;
    if (win.open) {
      win.open(checkoutUrl, '_blank');
    }
  }
}

export function useCashfreePayment(options?: UseCashfreePaymentOptions) {
  const [stage, setStage] = useState<PaymentStage>('amount_selection');
  const [orderSession, setOrderSession] = useState<CashfreeOrderSession | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceiptDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reconcileAttempt, setReconcileAttempt] = useState<number>(0);

  const activeOrderIdRef = useRef<string | null>(null);
  const isPollingRef = useRef<boolean>(false);

  // Safely import Cashfree SDK on native platforms only
  const getCashfreeSDK = useCallback(() => {
    if (Platform.OS === 'web') return null;
    try {
      // Dynamic require to prevent web/simulator crash if native binaries are unlinked
      const sdk = require('react-native-cashfree-pg-sdk');
      return sdk;
    } catch {
      return null;
    }
  }, []);

  /**
   * Reconciles payment status against backend verification endpoint
   */
  const verifyWithBackend = useCallback(
    async (orderId: string, payload: PaymentPayload, maxAttempts = 5): Promise<PaymentReceiptDetails> => {
      setStage('reconciling');
      isPollingRef.current = true;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (!isPollingRef.current) break;
        setReconcileAttempt(attempt);

        try {
          const verifyResult = await cashfreeApi.verifyOrder(orderId);

          if (verifyResult.status === 'SUCCESS') {
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

            const receiptNumber =
              verifyResult.receipt?.receipt_number ||
              `HRSJM-REC-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

            const receiptDetails: PaymentReceiptDetails = {
              paymentId: String(verifyResult.payment?.gateway_payment_id || verifyResult.payment?.id || orderId),
              orderId,
              donationId: payload.purpose === 'donation' ? payload.entityId || orderId : undefined,
              amount: Number(verifyResult.payment?.amount || payload.amount),
              platformFee: 0,
              taxCharges: 0,
              totalPayable: Number(verifyResult.payment?.amount || payload.amount),
              date: dateFormatted,
              time: timeFormatted,
              paymentMethod: 'Cashfree PG',
              paymentMethodType: 'upi',
              status: 'Completed',
              purpose: payload.purpose,
              title: payload.title,
              category: payload.category,
              location: payload.location,
              imageUrl: payload.imageUrl,
              donorName: payload.donorName || 'HRSJM Supporter',
              donorEmail: payload.donorEmail,
              donorMobile: payload.donorMobile,
              panNumber: payload.panNumber,
              is80GEligible: !!payload.need80GReceipt && !!payload.panNumber,
              receiptNumber,
              bankReferenceNo: String(verifyResult.payment?.gateway_payment_id || orderId),
              gatewaySignature: 'CASHFREE_VERIFIED',
            };

            setReceipt(receiptDetails);
            setStage('success');
            isPollingRef.current = false;
            options?.onSuccess?.(receiptDetails);
            return receiptDetails;
          }
        } catch (err: any) {
          // If 404 or transient, retry up to maxAttempts
          if (attempt === maxAttempts) {
            const msg = err.message || 'Payment verification failed with bank.';
            setErrorMessage(msg);
            setStage('failed');
            isPollingRef.current = false;
            options?.onError?.(msg);
            throw err;
          }
        }

        // Delay 2s before next poll
        if (attempt < maxAttempts) {
          await new Promise(res => setTimeout(res, 2000));
        }
      }

      const pendingMsg = 'Payment is being processed by your bank. Verification will complete automatically.';
      setErrorMessage(pendingMsg);
      setStage('failed');
      isPollingRef.current = false;
      throw new Error(pendingMsg);
    },
    [options],
  );

  /**
   * Initiates payment order on backend and launches Cashfree Checkout
   */
  const startCashfreePayment = useCallback(
    async (payload: PaymentPayload) => {
      try {
        setStage('processing');
        setErrorMessage(null);
        setReceipt(null);

        const idempotencyKey = `hrsjm_pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        let session: CashfreeOrderSession;

        if (payload.purpose === 'donation') {
          session = await cashfreeApi.createDonationOrder({
            cause: payload.title,
            amount: payload.amount,
            donorName: payload.donorName || 'HRSJM Supporter',
            donorMobile: payload.donorMobile,
            donorEmail: payload.donorEmail,
            panNumber: payload.panNumber,
            need80G: payload.need80GReceipt,
            idempotencyKey,
          });
        } else {
          session = await cashfreeApi.createMembershipOrder({
            membershipPaymentId: payload.entityId || idempotencyKey,
            idempotencyKey,
          });
        }

        setOrderSession(session);
        activeOrderIdRef.current = session.order_id;

        const sdk = getCashfreeSDK();

        if (sdk?.CFPaymentGatewayService && session.payment_session_id) {
          // Setup SDK callback
          sdk.CFPaymentGatewayService.setCallback({
            onVerify: async (orderID: string) => {
              await verifyWithBackend(orderID, payload);
            },
            onError: (error: any, orderID: string) => {
              const msg = error?.message || 'Payment was cancelled or declined.';
              setErrorMessage(msg);
              setStage('failed');
              options?.onError?.(msg);
            },
          });

          // Launch Cashfree SDK checkout
          try {
            const { CFSession, CFEnvironment } = require('cashfree-pg-api-contract');
            const cfSession = new CFSession(
              session.payment_session_id,
              session.order_id,
              CFEnvironment.SANDBOX,
            );

            sdk.CFPaymentGatewayService.doWebPayment(cfSession);
          } catch {
            // If native view cannot open, verify with backend
            await verifyWithBackend(session.order_id, payload);
          }
        } else if (Platform.OS === 'web' && session.payment_session_id) {
          try {
            await launchCashfreeWebCheckout(session.payment_session_id);
          } catch {
            // continue to verification
          }
          await verifyWithBackend(session.order_id, payload);
        } else {
          // Fallback verify directly with backend
          await verifyWithBackend(session.order_id, payload);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || err.message || 'Payment initiation failed';
        setErrorMessage(msg);
        setStage('failed');
        options?.onError?.(msg);
      }
    },
    [getCashfreeSDK, options, verifyWithBackend],
  );

  const resetPayment = useCallback(() => {
    isPollingRef.current = false;
    setStage('amount_selection');
    setOrderSession(null);
    setReceipt(null);
    setErrorMessage(null);
    setReconcileAttempt(0);
  }, []);

  // Clean up SDK callback on unmount
  useEffect(() => {
    return () => {
      isPollingRef.current = false;
      const sdk = getCashfreeSDK();
      try {
        sdk?.CFPaymentGatewayService?.removeCallback();
      } catch {}
    };
  }, [getCashfreeSDK]);

  return {
    stage,
    setStage,
    orderSession,
    receipt,
    errorMessage,
    reconcileAttempt,
    startCashfreePayment,
    verifyWithBackend,
    resetPayment,
  };
}
