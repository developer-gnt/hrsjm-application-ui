import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { cashfreeApi } from '../api/cashfree.api';
import {
  CashfreeOrderSession,
  PaymentPayload,
  PaymentReceiptDetails,
  PaymentStage,
  PaymentMethodType,
  UPIAppType,
} from '../types/payment.types';

export interface CardDetailsPayload {
  cardNumber: string;
  cardHolderName: string;
  cardExpiry: string; // MM/YY
  cardCvv: string;
}

export interface PaymentMethodOptions {
  methodType: PaymentMethodType;
  upiApp?: UPIAppType;
  upiId?: string;
  card?: CardDetailsPayload;
  bankName?: string;
  walletName?: string;
}

export interface UseCashfreePaymentOptions {
  onSuccess?: (receipt: PaymentReceiptDetails) => void;
  onError?: (errorMessage: string) => void;
  onClose?: () => void;
}

/**
 * Android UPI Package Names for Supported Apps
 */
export const UPI_PACKAGE_NAMES: Record<UPIAppType, string> = {
  gpay: 'com.google.android.apps.nbu.paisa.user',
  phonepe: 'com.phonepe.app',
  paytm: 'net.one97.paytm',
  bhim: 'in.org.npci.upiapp',
};

export interface UpiFormatValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Validates UPI VPA syntax format strictly:
 * - Non-empty and not just whitespace
 * - Length between 5 and 100 characters
 * - Must contain exactly one '@' separating handle and bank/PSP
 * - Username part must be at least 2 alphanumeric/period/dash characters
 * - Bank part must be at least 2 alphanumeric/period/dash characters
 * Note: A valid format does NOT prove the account exists or is active.
 */
export function validateUpiFormat(vpa?: string): UpiFormatValidationResult {
  if (!vpa || typeof vpa !== 'string') {
    return { isValid: false, error: 'UPI ID is required' };
  }
  const trimmed = vpa.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'UPI ID cannot be empty or whitespace' };
  }
  if (trimmed.length < 5) {
    return { isValid: false, error: 'UPI ID is too short (min 5 characters)' };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: 'UPI ID cannot exceed 100 characters' };
  }
  if (!trimmed.includes('@')) {
    return { isValid: false, error: 'UPI ID must contain "@" (e.g. name@bank)' };
  }
  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { isValid: false, error: 'Invalid UPI format. Must be username@handle' };
  }
  const vpaRegex = /^[A-Za-z0-9._-]{2,}@[A-Za-z0-9.-]{2,}$/;
  if (!vpaRegex.test(trimmed)) {
    return { isValid: false, error: 'Enter a UPI ID in a supported format (e.g. 9888880002@upi)' };
  }
  return { isValid: true, normalized: trimmed.toLowerCase() };
}

/**
 * Validates UPI VPA format
 * Pattern: username@bank (e.g. 9888880002@upi, rahul@okaxis)
 */
export function validateUpiVpa(vpa: string): boolean {
  return validateUpiFormat(vpa).isValid;
}

/**
 * Validates card number using Luhn's algorithm (Mod 10)
 */
export function validateLuhnCardNumber(cardNumber: string): boolean {
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Formats a raw card number string into 4-digit groups (e.g. 4111 2222 3333 4444)
 */
export function formatCardNumber(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 19);
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Validates MM/YY card expiry date and checks if the card is expired
 */
export function validateCardExpiry(expiry: string): { isValid: boolean; error?: string } {
  const clean = expiry.replace(/\s/g, '');
  const parts = clean.split('/');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Expiry must be in MM/YY format.' };
  }
  const month = parseInt(parts[0], 10);
  let year = parseInt(parts[1], 10);
  if (isNaN(month) || month < 1 || month > 12) {
    return { isValid: false, error: 'Invalid month (01-12).' };
  }
  if (isNaN(year)) {
    return { isValid: false, error: 'Invalid year.' };
  }
  if (year < 100) year += 2000;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, error: 'Card has expired.' };
  }
  return { isValid: true };
}

/**
 * Validates CVV length (3-4 digits)
 */
export function validateCardCvv(cvv: string): boolean {
  const clean = cvv.replace(/\D/g, '');
  return clean.length >= 3 && clean.length <= 4;
}

/**
 * Validates Cardholder name
 */
export function validateCardHolderName(name: string): boolean {
  return name.trim().length >= 2;
}

/**
 * Safely loads Cashfree Web SDK for web checkout using an inline DOM container
 * to avoid triggering browser popup blocker restrictions.
 */
export async function launchCashfreeWebCheckout(
  paymentSessionId: string,
  isProduction = false,
  orderId?: string,
): Promise<{ status?: string; error?: string }> {
  if (Platform.OS !== 'web' || !paymentSessionId) return { status: 'SKIPPED' };

  const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : null;
  const win = globalObj?.window;
  const doc = globalObj?.document;
  if (!win || !doc) return { status: 'SKIPPED' };

  const sessionId = paymentSessionId.trim();
  if (!sessionId) return { status: 'SKIPPED' };

  const getCashfree = (): any => {
    return win?.Cashfree || globalObj?.Cashfree || null;
  };

  const loadSdk = (): Promise<any> => {
    return new Promise(resolve => {
      const existingCashfree = getCashfree();
      if (existingCashfree) return resolve(existingCashfree);

      const existing: any = doc.getElementById('cashfree-js-sdk');
      if (existing) {
        let pollAttempts = 0;
        const interval = setInterval(() => {
          pollAttempts++;
          const inst = getCashfree();
          if (inst) {
            clearInterval(interval);
            return resolve(inst);
          }
          if (pollAttempts >= 30) {
            clearInterval(interval);
            return resolve(null);
          }
        }, 50);

        if (typeof existing.addEventListener === 'function') {
          existing.addEventListener('load', () => {
            clearInterval(interval);
            resolve(getCashfree() || null);
          });
          existing.addEventListener('error', () => {
            clearInterval(interval);
            resolve(null);
          });
        }
        return;
      }

      try {
        const script: any = doc.createElement('script');
        script.id = 'cashfree-js-sdk';
        script.crossOrigin = 'anonymous';
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => resolve(getCashfree() || null);
        script.onerror = () => resolve(null);
        doc.head.appendChild(script);

        // Failsafe timeout so it never hangs indefinitely
        setTimeout(() => resolve(getCashfree() || null), 3500);
      } catch {
        resolve(null);
      }
    });
  };

  // Inject responsive styles for modal and Cashfree iframe on web
  const styleId = 'cashfree-responsive-modal-style';
  let styleEl: any = doc.getElementById(styleId);
  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.id = styleId;
    styleEl.innerHTML = `
      #cashfree-modal-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        background: rgba(15, 23, 42, 0.75) !important;
        backdrop-filter: blur(5px) !important;
        -webkit-backdrop-filter: blur(5px) !important;
        z-index: 99999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 12px !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
      #cashfree-modal-card {
        position: relative !important;
        width: 100% !important;
        max-width: 480px !important;
        height: 700px !important;
        max-height: 94vh !important;
        max-height: 94dvh !important;
        background: #ffffff !important;
        border-radius: 16px !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45) !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        box-sizing: border-box !important;
      }
      #cashfree-modal-header {
        flex-shrink: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 12px 16px !important;
        background: #F8FAFC !important;
        border-bottom: 1px solid #E2E8F0 !important;
        box-sizing: border-box !important;
      }
      #cashfree-checkout-mount {
        flex: 1 1 auto !important;
        width: 100% !important;
        max-width: 100% !important;
        height: 100% !important;
        min-height: 480px !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
        background: #ffffff !important;
        position: relative !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
      }
      #cashfree-checkout-mount > div {
        width: 100% !important;
        max-width: 100% !important;
        height: 100% !important;
        min-height: 100% !important;
        box-sizing: border-box !important;
      }
      #cashfree-checkout-mount iframe {
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100% !important;
        height: 100% !important;
        min-height: 100% !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
        box-sizing: border-box !important;
      }
      @media (max-width: 640px) {
        #cashfree-modal-overlay {
          padding: 0 !important;
          align-items: stretch !important;
        }
        #cashfree-modal-card {
          width: 100vw !important;
          max-width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          max-height: 100vh !important;
          max-height: 100dvh !important;
          border-radius: 0 !important;
          border: none !important;
          box-shadow: none !important;
        }
        #cashfree-modal-header {
          padding: 10px 14px !important;
          border-radius: 0 !important;
        }
        #cashfree-checkout-mount {
          height: calc(100vh - 52px) !important;
          height: calc(100dvh - 52px) !important;
          min-height: calc(100vh - 52px) !important;
          min-height: calc(100dvh - 52px) !important;
        }
      }
    `;
    doc.head.appendChild(styleEl);
  }

  // Clean up any stale overlay
  const existingOverlay = doc.getElementById('cashfree-modal-overlay');
  if (existingOverlay && existingOverlay.parentNode) {
    existingOverlay.parentNode.removeChild(existingOverlay);
  }

  // Create responsive inline modal overlay in the DOM (bypasses browser popup blockers completely)
  const overlay = doc.createElement('div');
  overlay.id = 'cashfree-modal-overlay';

  const card = doc.createElement('div');
  card.id = 'cashfree-modal-card';

  const header = doc.createElement('div');
  header.id = 'cashfree-modal-header';

  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:28px;height:28px;border-radius:8px;background:#E0F2FE;display:flex;align-items:center;justify-content:center;color:#0284C7;font-size:14px;font-weight:bold;">
        🔒
      </div>
      <div>
        <div style="font-weight:700;font-size:14px;color:#0F2860;line-height:18px;">Cashfree Payment Gateway</div>
        <div style="font-size:11px;color:#64748B;">Secure 256-bit Encrypted Checkout</div>
      </div>
    </div>
    <button id="cashfree-close-btn" style="border:none;background:#F1F5F9;color:#475569;font-size:22px;width:34px;height:34px;border-radius:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;" title="Close">&times;</button>
  `;

  const mountPoint = doc.createElement('div');
  mountPoint.id = 'cashfree-checkout-mount';

  card.appendChild(header);
  card.appendChild(mountPoint);
  overlay.appendChild(card);
  doc.body.appendChild(overlay);

  return new Promise<{ status?: string; error?: string }>(async resolve => {
    let resolved = false;
    let pollInterval: any = null;
    let pollActive = false;

    // Real-time authoritative poller: instantly resolves when payment is paid on backend
    const checkVerification = async () => {
      if (!orderId || pollActive || resolved) return;
      pollActive = true;
      try {
        const verifyRes = await cashfreeApi.verifyOrder(orderId);
        const orderStatus = (verifyRes?.status || verifyRes?.latest_status || (verifyRes as any)?.order_status || '').toUpperCase();
        if (orderStatus === 'PAID' || orderStatus === 'SUCCESS') {
          cleanup();
          win.removeEventListener('message', onMessage);
          resolve({ status: 'SUCCESS' });
        }
      } catch {
        // silent background retry
      } finally {
        pollActive = false;
      }
    };

    if (orderId) {
      setTimeout(() => {
        if (!resolved) {
          checkVerification();
          pollInterval = setInterval(checkVerification, 1200);
        }
      }, 1500);
    }

    // Observer on document.body to instantly suppress Cashfree's dead popup blocker prompt
    let bodyObserver: any = null;
    if (typeof win.MutationObserver === 'function') {
      bodyObserver = new win.MutationObserver((mutations: any[]) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node && node.nodeType === 1) {
              const text = (node.textContent || '').toLowerCase();
              if (
                text.includes('popup blocker') ||
                text.includes('proceed to payment') ||
                text.includes('open payment page')
              ) {
                try {
                  node.remove();
                } catch {
                  node.style.display = 'none';
                }
                if (orderId) {
                  checkVerification();
                }
              }
            }
          }
        }
      });
      try {
        bodyObserver.observe(doc.body, { childList: true });
      } catch {
        // ignore
      }
    }

    // Mutation observer to ensure child elements and iframe generated by Cashfree stay responsive
    const enforceDimensions = () => {
      try {
        const divs = mountPoint.querySelectorAll('div');
        divs.forEach((d: any) => {
          d.style.setProperty('width', '100%', 'important');
          d.style.setProperty('max-width', '100%', 'important');
        });
        const iframes = mountPoint.querySelectorAll('iframe');
        iframes.forEach((iframe: any) => {
          iframe.style.setProperty('width', '100%', 'important');
          iframe.style.setProperty('min-width', '100%', 'important');
          iframe.style.setProperty('max-width', '100%', 'important');
          iframe.style.setProperty('height', '100%', 'important');
          iframe.style.setProperty('min-height', '100%', 'important');
          iframe.style.setProperty('border', 'none', 'important');
          iframe.style.setProperty('margin', '0 auto', 'important');
          iframe.style.setProperty('display', 'block', 'important');
        });
      } catch {
        // ignore
      }
    };

    let observer: any = null;
    if (typeof win.MutationObserver === 'function') {
      observer = new win.MutationObserver(() => {
        enforceDimensions();
      });
      observer.observe(mountPoint, { childList: true, subtree: true });
    }

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        if (observer) {
          try {
            observer.disconnect();
          } catch {
            // ignore
          }
        }
        if (bodyObserver) {
          try {
            bodyObserver.disconnect();
          } catch {
            // ignore
          }
        }
        try {
          const bodyDivs = doc.body.querySelectorAll('div');
          bodyDivs.forEach((div: any) => {
            const txt = (div.textContent || '').toLowerCase();
            if (txt.includes('popup blocker') || txt.includes('open payment page')) {
              div.remove();
            }
          });
        } catch {
          // ignore
        }
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }
    };

    const closeBtn = doc.getElementById('cashfree-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        cleanup();
        resolve({ status: 'CLOSED' });
      };
    }

    const onMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (typeof data === 'string') {
          if (data.includes('PAYMENT_SUCCESS') || data.includes('SUCCESS') || data.includes('PAID')) {
            cleanup();
            win.removeEventListener('message', onMessage);
            resolve({ status: 'SUCCESS' });
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (
              parsed?.event_data?.paymentStatus === 'SUCCESS' ||
              parsed?.paymentStatus === 'SUCCESS' ||
              parsed?.status === 'SUCCESS' ||
              parsed?.order_status === 'PAID'
            ) {
              cleanup();
              win.removeEventListener('message', onMessage);
              resolve({ status: 'SUCCESS' });
              return;
            }
          } catch {
            // not JSON
          }
        } else if (data && typeof data === 'object') {
          if (
            data.status === 'SUCCESS' ||
            data.name === 'PAYMENT_SUCCESS' ||
            data.type === 'cashfree_success' ||
            data?.event_data?.paymentStatus === 'SUCCESS' ||
            data?.paymentStatus === 'SUCCESS' ||
            data?.order_status === 'PAID'
          ) {
            cleanup();
            win.removeEventListener('message', onMessage);
            resolve({ status: 'SUCCESS' });
          }
        }
      } catch {
        // ignore
      }
    };
    win.addEventListener('message', onMessage);

    try {
      const CashfreeFactory = await loadSdk();
      if (!CashfreeFactory) {
        console.warn('Cashfree SDK is unavailable or blocked');
        cleanup();
        win.removeEventListener('message', onMessage);
        return resolve({ error: 'SDK_UNAVAILABLE' });
      }

      const cashfree = CashfreeFactory({ mode: isProduction ? 'production' : 'sandbox' });
      cashfree
        .checkout({
          paymentSessionId: sessionId,
          redirectTarget: mountPoint,
          redirect: 'if_required',
          appearance: {
            width: '100%',
            height: '100%',
          },
        })
        .then((result: any) => {
          if (result?.error) {
            console.warn('Cashfree checkout error:', result.error);
            cleanup();
            win.removeEventListener('message', onMessage);
            resolve({ error: result.error?.message || 'CHECKOUT_ERROR' });
          } else if (result?.paymentDetails) {
            cleanup();
            win.removeEventListener('message', onMessage);
            resolve({ status: 'SUCCESS' });
          }
        })
        .catch((err: any) => {
          console.warn('Cashfree checkout launch error:', err);
          cleanup();
          win.removeEventListener('message', onMessage);
          resolve({ error: err?.message || 'CHECKOUT_EXCEPTION' });
        });
    } catch (err: any) {
      console.warn('Cashfree web checkout launch error:', err);
      cleanup();
      win.removeEventListener('message', onMessage);
      resolve({ error: err?.message || 'LAUNCH_FAILED' });
    }
  });
}

/**
 * Primary React Native Cashfree Payment Hook
 */
export function useCashfreePayment(options?: UseCashfreePaymentOptions) {
  const [stage, setStage] = useState<PaymentStage>('amount_selection');
  const [orderSession, setOrderSession] = useState<CashfreeOrderSession | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceiptDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reconcileAttempt, setReconcileAttempt] = useState<number>(0);
  const [installedUpiApps, setInstalledUpiApps] = useState<any[]>([]);

  const activeOrderIdRef = useRef<string | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  // Safely import Cashfree SDK on native platforms only
  const getCashfreeSDK = useCallback(() => {
    if (Platform.OS === 'web') return null;
    try {
      const sdk = require('react-native-cashfree-pg-sdk');
      return sdk;
    } catch {
      return null;
    }
  }, []);

  // Fetch installed UPI apps on Android
  useEffect(() => {
    isMountedRef.current = true;
    if (Platform.OS === 'android') {
      try {
        const sdk = getCashfreeSDK();
        if (sdk?.CFPaymentGatewayService?.getInstalledUpiApps) {
          sdk.CFPaymentGatewayService.getInstalledUpiApps()
            .then((apps: any) => {
              if (isMountedRef.current && apps) {
                const parsed = typeof apps === 'string' ? JSON.parse(apps) : apps;
                if (Array.isArray(parsed)) {
                  setInstalledUpiApps(parsed);
                }
              }
            })
            .catch(() => {
              // Ignore if no UPI apps or simulator
            });
        }
      } catch {
        // Native SDK not linked or simulator
      }
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [getCashfreeSDK]);

  /**
   * Reconciles payment status against backend authoritative verification endpoint
   */
  const verifyWithBackend = useCallback(
    async (
      orderId: string,
      payload: PaymentPayload,
      methodOptions?: PaymentMethodOptions,
      maxAttempts = 5,
    ): Promise<PaymentReceiptDetails> => {
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

            let methodLabel = 'Cashfree UPI';
            if (methodOptions?.methodType === 'upi') {
              methodLabel = methodOptions.upiApp
                ? `UPI (${methodOptions.upiApp.toUpperCase()})`
                : `UPI (${methodOptions.upiId || 'Direct UPI'})`;
            } else if (methodOptions?.methodType === 'card') {
              const last4 = (methodOptions.card?.cardNumber || '4111').replace(/\D/g, '').slice(-4);
              methodLabel = `Debit / Credit Card (ending in ${last4})`;
            } else if (methodOptions?.methodType === 'netbanking') {
              methodLabel = `Net Banking (${methodOptions.bankName || 'Online'})`;
            } else if (methodOptions?.methodType === 'wallet') {
              methodLabel = `Wallet (${methodOptions.walletName || 'Digital'})`;
            }

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
              paymentMethod: methodLabel,
              paymentMethodType: methodOptions?.methodType || 'upi',
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
            isSubmittingRef.current = false;
            options?.onSuccess?.(receiptDetails);
            return receiptDetails;
          }
        } catch (err: any) {
          if (attempt === maxAttempts) {
            const msg = err.message || 'Payment verification failed with bank.';
            setErrorMessage(msg);
            setStage('failed');
            isPollingRef.current = false;
            isSubmittingRef.current = false;
            options?.onError?.(msg);
            throw err;
          }
        }

        if (attempt < maxAttempts) {
          await new Promise(res => setTimeout(res, 2000));
        }
      }

      const pendingMsg =
        'Payment is being processed by your bank. Verification is currently pending. Please check status before attempting another payment.';
      setErrorMessage(pendingMsg);
      setStage('pending');
      isPollingRef.current = false;
      isSubmittingRef.current = false;
      throw new Error(pendingMsg);
    },
    [options],
  );

  /**
   * Initiates payment order on backend and launches Cashfree Checkout with method-specific handling
   */
  const startCashfreePayment = useCallback(
    async (payload: PaymentPayload, methodOptions?: PaymentMethodOptions) => {
      // Prevent duplicate submissions
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;

      try {
        setStage('processing');
        setErrorMessage(null);
        setReceipt(null);

        // Client-side validations
        if (methodOptions?.methodType === 'upi') {
          if (methodOptions.upiId && !validateUpiVpa(methodOptions.upiId)) {
            isSubmittingRef.current = false;
            throw new Error('Please enter a valid UPI ID (e.g. yourname@upi).');
          }
        } else if (methodOptions?.methodType === 'card' && methodOptions.card) {
          const { cardNumber, cardHolderName, cardExpiry, cardCvv } = methodOptions.card;
          if (!validateLuhnCardNumber(cardNumber)) {
            isSubmittingRef.current = false;
            throw new Error('Please enter a valid card number.');
          }
          const expiryCheck = validateCardExpiry(cardExpiry);
          if (!expiryCheck.isValid) {
            isSubmittingRef.current = false;
            throw new Error(expiryCheck.error || 'Please enter a valid card expiry.');
          }
          if (!validateCardCvv(cardCvv)) {
            isSubmittingRef.current = false;
            throw new Error('CVV must be 3 or 4 digits.');
          }
          if (!validateCardHolderName(cardHolderName)) {
            isSubmittingRef.current = false;
            throw new Error('Please enter cardholder name.');
          }
        }

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
            amount: payload.amount,
            customerName: payload.donorName || 'HRSJM Member',
            customerMobile: payload.donorMobile,
            customerEmail: payload.donorEmail,
            membershipType: payload.title || 'Membership Registration Fee',
            idempotencyKey,
          });
        }

        setOrderSession(session);
        activeOrderIdRef.current = session.order_id;

        const sdk = getCashfreeSDK();

        if (sdk?.CFPaymentGatewayService && session.payment_session_id) {
          // Remove any stale callback before binding new one
          try {
            sdk.CFPaymentGatewayService.removeCallback();
          } catch {
            // ignore
          }

          // Setup SDK callback
          sdk.CFPaymentGatewayService.setCallback({
            onVerify: async (orderID: string) => {
              await verifyWithBackend(orderID, payload, methodOptions);
            },
            onError: async (error: any, orderID: string) => {
              isSubmittingRef.current = false;
              const errCode = (
                typeof error?.getCode === 'function'
                  ? error.getCode()
                  : typeof error?.code === 'string'
                  ? error.code
                  : ''
              ).toUpperCase();
              const errMsg = (
                typeof error?.getMessage === 'function'
                  ? error.getMessage()
                  : typeof error?.message === 'string'
                  ? error.message
                  : ''
              ).toUpperCase();
              const errStatus = (
                typeof error?.getStatus === 'function'
                  ? error.getStatus()
                  : typeof error?.status === 'string'
                  ? error.status
                  : ''
              ).toUpperCase();

              const isUserDropped =
                errCode.includes('USER_DROPPED') ||
                errMsg.includes('USER_DROPPED') ||
                errStatus.includes('USER_DROPPED') ||
                errCode.includes('CANCEL') ||
                errMsg.includes('CANCEL');

              // Authoritative backend check: verify whether payment secretly completed
              try {
                const oid = orderID || session.order_id;
                const check = await cashfreeApi.verifyOrder(oid);
                if (check.status === 'SUCCESS') {
                  await verifyWithBackend(oid, payload, methodOptions);
                  return;
                }
              } catch {
                // Ignore verification errors on error callback
              }

              if (isUserDropped) {
                const dropMsg =
                  'You left or cancelled the payment before completing it. No successful payment has been confirmed. You can try again.';
                setErrorMessage(dropMsg);
                setStage('user_dropped');
                options?.onError?.(dropMsg);
              } else {
                const failMsg =
                  error?.message || 'Payment authorization was declined or failed with gateway.';
                setErrorMessage(failMsg);
                setStage('failed');
                options?.onError?.(failMsg);
              }
            },
          });

          // Launch Cashfree SDK checkout with dynamic environment
          try {
            const {
              CFSession,
              CFEnvironment,
              CFUPI,
              UPIMode,
              CFUPIPayment,
              Card,
              CFCardPayment,
            } = require('cashfree-pg-api-contract');

            const isProduction = session.environment === 'PRODUCTION';
            const cfEnv = isProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
            const cfSession = new CFSession(
              session.payment_session_id,
              session.order_id,
              cfEnv,
            );

            // Specific method launch when available
            if (methodOptions?.methodType === 'upi' && methodOptions.upiApp && Platform.OS === 'android') {
              const packageName = UPI_PACKAGE_NAMES[methodOptions.upiApp];
              const upi = new CFUPI(UPIMode.INTENT, packageName);
              const upiPayment = new CFUPIPayment(cfSession, upi);
              sdk.CFPaymentGatewayService.makePayment(upiPayment);
            } else if (methodOptions?.methodType === 'upi' && methodOptions.upiId) {
              const upi = new CFUPI(UPIMode.COLLECT, methodOptions.upiId.trim());
              const upiPayment = new CFUPIPayment(cfSession, upi);
              sdk.CFPaymentGatewayService.makePayment(upiPayment);
            } else if (methodOptions?.methodType === 'card' && methodOptions.card) {
              const [mm, yy] = methodOptions.card.cardExpiry.replace(/\s/g, '').split('/');
              const card = new Card(
                methodOptions.card.cardNumber.replace(/\s/g, ''),
                methodOptions.card.cardHolderName.trim(),
                mm,
                yy,
                methodOptions.card.cardCvv.trim(),
                false,
              );
              const cardPayment = new CFCardPayment(cfSession, card);
              sdk.CFPaymentGatewayService.makePayment(cardPayment);
            } else {
              // Standard Web/Drop Checkout
              sdk.CFPaymentGatewayService.doWebPayment(cfSession);
            }
          } catch {
            // Fallback to web payment or direct backend verification
            await verifyWithBackend(session.order_id, payload, methodOptions);
          }
        } else if (Platform.OS === 'web' && session.payment_session_id) {
          try {
            const isProduction = session.environment === 'PRODUCTION';
            const outcome = await launchCashfreeWebCheckout(session.payment_session_id, isProduction, session.order_id);
            if (outcome?.status === 'CLOSED') {
              isSubmittingRef.current = false;
              setStage('amount_selection');
              options?.onClose?.();
              return;
            }
          } catch {
            // continue to verification
          }
          await verifyWithBackend(session.order_id, payload, methodOptions);
        } else {
          // Fallback verify directly with backend
          await verifyWithBackend(session.order_id, payload, methodOptions);
        }
      } catch (err: any) {
        isSubmittingRef.current = false;
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
    isSubmittingRef.current = false;
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
      isSubmittingRef.current = false;
      const sdk = getCashfreeSDK();
      try {
        sdk?.CFPaymentGatewayService?.removeCallback();
      } catch {
        // ignore
      }
    };
  }, [getCashfreeSDK]);

  return {
    stage,
    setStage,
    orderSession,
    receipt,
    errorMessage,
    reconcileAttempt,
    installedUpiApps,
    startCashfreePayment,
    verifyWithBackend,
    resetPayment,
  };
}
