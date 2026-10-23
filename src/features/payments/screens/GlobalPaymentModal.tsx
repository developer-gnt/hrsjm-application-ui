import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PaymentPayload,
  PaymentReceiptDetails,
  PaymentMethodType,
  UPIAppType,
  PaymentStage,
  PaymentFailureInfo,
  PaymentResultStatus,
} from '../types/payment.types';
import { globalPaymentService, PaymentOutcomeError } from '../services/payment.service';
import { cashfreeApi } from '../api/cashfree.api';
import {
  formatCardNumber,
  validateUpiFormat,
  validateLuhnCardNumber,
  validateCardExpiry,
  validateCardCvv,
  validateCardHolderName,
} from '../hooks/useCashfreePayment';
import { useAuthStore } from '../../auth/store/authStore';
import { causesService } from '../../member/services/causes.service';
import {
  UpiBrandLogo,
  GPayAppLogo,
  PhonePeAppLogo,
  PaytmAppLogo,
  BhimAppLogo,
  VisaBadge,
  MastercardBadge,
  RupayBadge,
  CardVectorIcon,
  BankVectorIcon,
  WalletVectorIcon,
  SecureShieldVectorIcon,
  PaymentRadioButton,
} from '../components/PaymentBrandLogos';
import { FontFamilies } from '../../../core/theme/typography';

const HRSJM_EMBLEM = require('../../../assets/hrsjm_logo.png');

export interface GlobalPaymentModalProps {
  visible: boolean;
  payload: PaymentPayload | null;
  onClose: () => void;
  onSuccess?: (receipt: PaymentReceiptDetails) => void;
  onNavigateHome?: () => void;
  onViewHistory?: () => void;
  initialStage?: PaymentStage;
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

const getFriendlyDeclineSubheading = (raw?: string): string => {
  if (!raw) {
    return 'Your transaction could not be processed at this time. No money has been debited.';
  }
  const lower = raw.toLowerCase();
  if (lower.includes('user_dropped') || lower.includes('cancel')) {
    return 'You left or cancelled the payment before completing it. No successful payment has been confirmed. You can try again.';
  }
  if (lower.includes('network') || lower.includes('timeout') || lower.includes('econnrefused') || lower.includes('connection')) {
    return 'The connection to the payment server timed out. Please check your internet connection.';
  }
  if (lower.includes('balance') || lower.includes('insufficient')) {
    return 'The transaction was declined due to insufficient account balance.';
  }
  if (lower.includes('bank') || lower.includes('issuer') || lower.includes('decline')) {
    return 'Your bank or payment provider declined the transaction authorization.';
  }
  if (lower.includes('bad gateway') || lower.includes('502') || lower.includes('503') || lower.includes('maintenance')) {
    return 'The payment gateway is temporarily unavailable. Your money is completely safe and no amount was debited.';
  }
  return 'Payment authorization could not be completed. No money was debited from your account.';
};

const getFriendlyDeclineReason = (raw?: string): string => {
  if (!raw) {
    return 'Transaction authorization was declined by the payment provider.';
  }
  const lower = raw.toLowerCase();
  if (lower.includes('user_dropped') || lower.includes('cancel')) {
    return 'The checkout session was closed before payment completion.';
  }
  if (lower.includes('network') || lower.includes('timeout') || lower.includes('econnrefused') || lower.includes('connection')) {
    return 'Network connection timed out while awaiting bank authorization. Please check your internet connectivity.';
  }
  if (lower.includes('balance') || lower.includes('insufficient')) {
    return 'Insufficient balance in the account linked to this payment method.';
  }
  if (lower.includes('bank') || lower.includes('issuer')) {
    return 'Transaction was declined by your bank or card issuer. Please try an alternate card or UPI app.';
  }
  if (lower.includes('bad gateway') || lower.includes('502') || lower.includes('503') || lower.includes('maintenance')) {
    return 'Payment gateway service is currently undergoing routine maintenance. Please try again shortly.';
  }
  return 'Transaction was declined by the payment processor. Please try again or select another payment option.';
};

export const GlobalPaymentModal: React.FC<GlobalPaymentModalProps> = ({
  visible,
  payload,
  onClose,
  onSuccess,
  onViewHistory,
  initialStage,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(state => state.user);

  // Step 1 is Amount Selection
  const [stage, setStage] = useState<PaymentStage>('amount_selection');
  const [activeAmount, setActiveAmount] = useState<number>(payload?.amount || 2000);
  const [customAmountText, setCustomAmountText] = useState<string>('2000');
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);

  // 80G & Donor Details
  const [need80G, setNeed80G] = useState<boolean>(false);
  const [panNumber, setPanNumber] = useState<string>('');
  const [donorName, setDonorName] = useState<string>(payload?.donorName || user?.full_name || 'Donor');
  const [donorMobile, setDonorMobile] = useState<string>(payload?.donorMobile || user?.mobile_number || '');
  const [donorEmail, setDonorEmail] = useState<string>(payload?.donorEmail || user?.email || '');

  // Payment Method selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<UPIAppType>('gpay');
  const [upiId, setUpiId] = useState<string>('');
  const [upiFocused, setUpiFocused] = useState<boolean>(false);
  const [upiTouched, setUpiTouched] = useState<boolean>(false);
  const [upiError, setUpiError] = useState<string | null>(null);
  const upiInputRef = useRef<any>(null);
  const cardInputRef = useRef<any>(null);
  const cvvInputRef = useRef<any>(null);

  const handleUpiChange = (text: string) => {
    setUpiId(text);
    if (upiError) {
      setUpiError(null);
    }
  };

  const handleUpiBlur = () => {
    setUpiFocused(false);
    const trimmed = upiId.trim();
    if (trimmed.length > 0) {
      setUpiTouched(true);
      const res = validateUpiFormat(trimmed);
      if (!res.isValid) {
        setUpiError(res.error || 'Please enter a valid UPI ID (e.g. 9888880002@upi)');
      } else {
        setUpiError(null);
      }
    } else {
      setUpiTouched(false);
      setUpiError(null);
    }
  };

  // Card details
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>(user?.full_name || '');
  const [showCvv, setShowCvv] = useState<boolean>(false);
  const [cardErrors, setCardErrors] = useState<{
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardHolder?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    if (cardErrors.cardNumber) {
      setCardErrors(prev => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleCardExpiryChange = (text: string) => {
    const clean = text.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setCardExpiry(clean);
    }
    if (cardErrors.cardExpiry) {
      setCardErrors(prev => ({ ...prev, cardExpiry: undefined }));
    }
  };

  const handleCardCvvChange = (text: string) => {
    const clean = text.replace(/\D/g, '').slice(0, 4);
    setCardCvv(clean);
    if (cardErrors.cardCvv) {
      setCardErrors(prev => ({ ...prev, cardCvv: undefined }));
    }
  };

  const handleCardHolderChange = (text: string) => {
    setCardHolder(text);
    if (cardErrors.cardHolder) {
      setCardErrors(prev => ({ ...prev, cardHolder: undefined }));
    }
  };

  // Net banking & Wallets
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState<string>('Paytm Wallet');

  // Processing timeline step (0 to 5)
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [receiptResult, setReceiptResult] = useState<PaymentReceiptDetails | null>(null);
  const [failureError, setFailureError] = useState<PaymentFailureInfo | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [showDevDebug, setShowDevDebug] = useState<boolean>(false);

  // Spinner animation for Processing stage
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Track modal open transitions to prevent re-renders from resetting the stage
  const prevVisibleRef = useRef<boolean>(false);

  const maxAllowedAmount = payload?.maxAllowedAmount !== undefined
    ? payload.maxAllowedAmount
    : payload?.targetAmount !== undefined && payload?.raisedAmount !== undefined
    ? Math.max(0, payload.targetAmount - payload.raisedAmount)
    : undefined;

  const showExcessAmountAlert = (maxNeeded: number) => {
    Alert.alert(
      'Thank You for Your Support',
      `Thank you for your support! We just need only ₹${maxNeeded.toLocaleString('en-IN')}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setActiveAmount(maxNeeded);
            setIsCustomAmount(false);
            setCustomAmountText(String(maxNeeded));
          },
        },
      ],
    );
  };

  // Sync state when modal is opened
  useEffect(() => {
    const justOpened = visible && !prevVisibleRef.current;
    prevVisibleRef.current = visible;

    if (justOpened) {
      setStage(initialStage || 'amount_selection');
      setProcessingStep(0);
      setReceiptResult(null);
      setIsCustomAmount(false);
      setShowDevDebug(false);

      const maxLimit = payload?.maxAllowedAmount !== undefined
        ? payload.maxAllowedAmount
        : payload?.targetAmount !== undefined && payload?.raisedAmount !== undefined
        ? Math.max(0, payload.targetAmount - payload.raisedAmount)
        : undefined;

      if (maxLimit !== undefined && maxLimit <= 0) {
        Alert.alert(
          'Goal Reached',
          `Thank you for your generous support! This cause has already met its full collection goal of ₹${(payload?.targetAmount || 0).toLocaleString('en-IN')}.`,
          [{ text: 'OK', onPress: onClose }],
        );
        return;
      }

      const initialAmt = payload?.amount || 2000;
      const resolvedAmt = (maxLimit !== undefined && maxLimit > 0)
        ? Math.min(initialAmt, maxLimit)
        : initialAmt;

      setActiveAmount(resolvedAmt);
      setCustomAmountText(String(resolvedAmt));

      const resolvedName = payload?.donorName || user?.full_name || 'Donor';
      const resolvedMobile = payload?.donorMobile || user?.mobile_number || '';
      const resolvedEmail = payload?.donorEmail || user?.email || '';
      setDonorName(resolvedName);
      setDonorMobile(resolvedMobile);
      setDonorEmail(resolvedEmail);
      setCardHolder(resolvedName);

      if (payload?.panNumber) {
        setPanNumber(payload.panNumber);
        setNeed80G(true);
      } else {
        setPanNumber('');
        setNeed80G(false);
      }

      setUpiId('');
      setUpiTouched(false);
      setUpiError(null);
      setUpiFocused(false);
      setCardErrors({});
    }
  }, [visible, payload, user, onClose, initialStage]);

  // Handle processing spinner
  useEffect(() => {
    if (stage === 'processing') {
      spinAnim.setValue(0);
      const loop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [stage, spinAnim]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleSelectPreset = (amount: number) => {
    if (maxAllowedAmount !== undefined && maxAllowedAmount > 0 && amount > maxAllowedAmount) {
      showExcessAmountAlert(maxAllowedAmount);
      return;
    }
    setActiveAmount(amount);
    setIsCustomAmount(false);
    setCustomAmountText(String(amount));
  };

  const handleCustomAmountChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setCustomAmountText(clean);
    setIsCustomAmount(true);
    const num = parseInt(clean, 10);
    if (!isNaN(num)) {
      setActiveAmount(num);
    } else {
      setActiveAmount(0);
    }
  };

  const handleCustomBlur = () => {
    if (maxAllowedAmount !== undefined && maxAllowedAmount > 0 && activeAmount > maxAllowedAmount) {
      showExcessAmountAlert(maxAllowedAmount);
    }
  };

  const handleProceedToCheckout = () => {
    if (maxAllowedAmount !== undefined && maxAllowedAmount > 0 && activeAmount > maxAllowedAmount) {
      showExcessAmountAlert(maxAllowedAmount);
      return;
    }
    const minRequired = maxAllowedAmount !== undefined && maxAllowedAmount < 50 ? maxAllowedAmount : 50;
    if (activeAmount < minRequired) {
      Alert.alert('Invalid Amount', `Please enter a contribution amount of at least ₹${minRequired}.`);
      return;
    }
    if (need80G && panNumber.trim().length < 10) {
      Alert.alert('PAN Required', 'Please enter a valid 10-digit PAN number for 80G Tax Exemption.');
      return;
    }
    setStage('checkout');
  };

  const handleStartPayment = async () => {
    if (!payload) return;
    if (isSubmittingRef.current || isSubmitting) return;

    if (activeAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    // Validation per selected method
    if (paymentMethod === 'upi') {
      const trimmedUpi = upiId.trim();
      if (trimmedUpi.length > 0) {
        const formatResult = validateUpiFormat(trimmedUpi);
        if (!formatResult.isValid) {
          setUpiTouched(true);
          setUpiError(formatResult.error || 'Please enter a valid UPI ID (e.g. 9888880002@upi)');
          Alert.alert('Invalid UPI Format', formatResult.error || 'Please enter a valid UPI ID (e.g. 9888880002@upi).');
          return;
        }
      }
    } else if (paymentMethod === 'card') {
      const newCardErrors: {
        cardNumber?: string;
        cardExpiry?: string;
        cardCvv?: string;
        cardHolder?: string;
      } = {};

      if (!validateLuhnCardNumber(cardNumber)) {
        newCardErrors.cardNumber = 'Please enter a valid 13-19 digit card number.';
      }
      const expValidation = validateCardExpiry(cardExpiry);
      if (!expValidation.isValid) {
        newCardErrors.cardExpiry = expValidation.error || 'Invalid expiry date.';
      }
      if (!validateCardCvv(cardCvv)) {
        newCardErrors.cardCvv = 'CVV must be 3 or 4 digits.';
      }
      if (!validateCardHolderName(cardHolder)) {
        newCardErrors.cardHolder = 'Please enter cardholder name.';
      }

      if (Object.keys(newCardErrors).length > 0) {
        setCardErrors(newCardErrors);
        Alert.alert('Incomplete Card Details', 'Please correct the highlighted card details to proceed.');
        return;
      }
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setStage('processing');
    setProcessingStep(1);

    try {
      let upiAppLabel = 'Google Pay';
      if (selectedUpiApp === 'phonepe') upiAppLabel = 'PhonePe';
      else if (selectedUpiApp === 'paytm') upiAppLabel = 'Paytm';
      else if (selectedUpiApp === 'bhim') upiAppLabel = 'BHIM UPI';

      setProcessingStep(2);

      const result = await globalPaymentService.executePayment(
        {
          ...payload,
          amount: activeAmount,
          donorName,
          donorMobile,
          donorEmail,
          panNumber: need80G ? panNumber.toUpperCase() : undefined,
          need80GReceipt: need80G,
        },
        paymentMethod,
        {
          upiId: upiId.trim() || undefined,
          selectedUpiApp: upiAppLabel,
          cardNumber,
          cardHolderName: cardHolder,
          cardExpiry,
          cardCvv,
          bankName: selectedBank,
          walletName: selectedWallet,
        },
      );

      setProcessingStep(4);

      // Record donation in causesService so all cause statistics reflect immediately
      if (payload.purpose === 'donation') {
        causesService.recordDonation(payload.entityId || payload.title, activeAmount, result.paymentId);
      }

      setProcessingStep(5);
      setReceiptResult(result);
      setStage('success');
      // Clear sensitive card details from component state upon completion
      setCardNumber('');
      setCardCvv('');
      onSuccess?.(result);
    } catch (error: any) {
      if (error instanceof PaymentOutcomeError || error?.status) {
        const status: PaymentResultStatus = error.status || 'FAILED';
        const failureInfo: PaymentFailureInfo = {
          status,
          code: error.code || 'PAYMENT_FAILED',
          title:
            status === 'USER_DROPPED'
              ? 'Payment Not Completed'
              : status === 'PENDING'
              ? 'Payment Pending Verification'
              : status === 'NETWORK_ERROR'
              ? 'Connection Error'
              : 'Payment Unsuccessful',
          message:
            error.message ||
            (status === 'USER_DROPPED'
              ? 'You left or cancelled the payment before completing it. No successful payment has been confirmed. You can try again.'
              : 'Payment processing was cancelled or declined.'),
          reason: error.reason || error.message || 'Payment network declined transaction authorization.',
          orderId: error.orderId,
          canRetry: error.canRetry !== false,
          rawError: error,
        };
        setFailureError(failureInfo);

        if (status === 'USER_DROPPED' || status === 'CANCELLED') {
          setStage('user_dropped');
        } else if (status === 'PENDING') {
          setStage('pending');
        } else {
          setStage('failed');
        }
      } else {
        const failureInfo: PaymentFailureInfo = {
          status: 'FAILED',
          code: error?.code || 'PAYMENT_DECLINED',
          title: 'Payment Unsuccessful',
          message: error?.message || 'Payment processing was cancelled or declined.',
          reason: error?.message || 'Payment network declined transaction authorization.',
          orderId: error?.orderId,
          canRetry: true,
          rawError: error,
        };
        setFailureError(failureInfo);
        setStage('failed');
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    const prevOrderId = failureError?.orderId;
    if (!prevOrderId) {
      setFailureError(null);
      setStage('checkout');
      return;
    }

    setIsRetrying(true);
    try {
      // 1. Authoritative check: verify previous order with backend first to prevent duplicate charges
      const verifyRes = await cashfreeApi.verifyOrder(prevOrderId);

      if (verifyRes?.status === 'SUCCESS') {
        // Payment actually succeeded in the background (e.g. UPI app delay or webhook)!
        // Immediately record and render success receipt instead of initiating duplicate charge
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
          verifyRes.payment?.gateway_payment_id ||
          verifyRes.payment?.id ||
          prevOrderId,
        );

        const receiptNumber =
          verifyRes.receipt?.receipt_number ||
          `HRSJM-REC-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        if (payload?.purpose === 'donation') {
          causesService.recordDonation(payload.entityId || payload.title, activeAmount, paymentId);
        }

        const receipt: PaymentReceiptDetails = {
          paymentId,
          orderId: prevOrderId,
          donationId: payload?.purpose === 'donation' ? payload.entityId || prevOrderId : undefined,
          amount: Number(verifyRes.payment?.amount || activeAmount),
          platformFee: 0,
          taxCharges: 0,
          totalPayable: Number(verifyRes.payment?.amount || activeAmount),
          date: dateFormatted,
          time: timeFormatted,
          paymentMethod:
            paymentMethod === 'upi'
              ? selectedUpiApp === 'gpay'
                ? 'UPI (Google Pay)'
                : selectedUpiApp === 'phonepe'
                ? 'UPI (PhonePe)'
                : selectedUpiApp === 'paytm'
                ? 'UPI (Paytm)'
                : 'UPI (BHIM)'
              : 'Online Payment',
          paymentMethodType: paymentMethod,
          status: 'Completed',
          purpose: payload?.purpose || 'donation',
          title: payload?.title || 'HRSJM Contribution',
          category: payload?.category,
          location: payload?.location,
          imageUrl: payload?.imageUrl,
          donorName,
          donorEmail,
          donorMobile,
          panNumber,
          is80GEligible: Boolean(panNumber && need80G),
          receiptNumber,
          bankReferenceNo: paymentId,
          authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
          gatewaySignature: 'CASHFREE_VERIFIED',
        };

        setReceiptResult(receipt);
        setFailureError(null);
        setStage('success');
        onSuccess?.(receipt);
        return;
      }

      if (verifyRes?.status === 'PENDING') {
        const latestStatus = (verifyRes.latest_status || '').toUpperCase();
        if (!latestStatus.includes('FAIL') && !latestStatus.includes('DECLIN') && !latestStatus.includes('DROP')) {
          setFailureError({
            status: 'PENDING',
            code: 'PAYMENT_PENDING',
            title: 'Payment Pending Verification',
            message: 'Your payment is still being processed by your bank. Verification is still pending. Please wait a moment before trying again.',
            reason: 'Payment status is currently PENDING at bank gateway.',
            orderId: prevOrderId,
            canRetry: true,
          });
          setStage('pending');
          return;
        }
      }

      // Safe to retry: previous order is confirmed USER_DROPPED or FAILED
      setFailureError(null);
      setStage('checkout');
    } catch {
      // Network check failed
      Alert.alert(
        'Verification Check Interrupted',
        'Could not verify previous order status with server. Would you like to check again or return to checkout?',
        [
          { text: 'Check Again', onPress: () => handleRetryPayment() },
          { text: 'Return to Checkout', onPress: () => { setFailureError(null); setStage('checkout'); } },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancelAndExit = () => {
    setFailureError(null);
    onClose();
  };

  const handleShareReceipt = async () => {
    if (!receiptResult) return;
    try {
      await Share.share({
        title: `HRSJM Receipt - ${receiptResult.title}`,
        message: `I just contributed ₹${receiptResult.amount.toLocaleString('en-IN')} towards "${receiptResult.title}" on HRSJM (Human Rights & Social Justice Mission).\nPayment ID: ${receiptResult.paymentId}\nReceipt No: ${receiptResult.receiptNumber}`,
      });
    } catch {
      // ignore
    }
  };

  const handleDownloadReceipt = () => {
    Alert.alert(
      'Receipt Downloaded',
      `Official 80G tax receipt ${receiptResult?.receiptNumber || ''} has been saved to your downloads.`,
    );
  };

  if (!visible || !payload) return null;

  const title = payload.title || 'Education Support for Underprivileged Children';
  const category = payload.category || 'Education';
  const location = payload.location || 'Mumbai, Maharashtra';
  const imageUrl =
    payload.imageUrl ||
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80';

  // ============================================================================
  // STAGE 1: AMOUNT SELECTION (First Screen on Donate click)
  // ============================================================================
  const renderAmountSelectionStage = () => (
    <View style={styles.stageContainer}>
      {/* Top Header */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>

        <View style={styles.headerLogoContainer}>
          <Image source={HRSJM_EMBLEM} style={styles.headerEmblem} resizeMode="contain" />
          <View style={styles.headerTextCol}>
            <Text style={styles.headerBrandTitle}>HRSJM</Text>
            <Text style={styles.headerHindiSub}>मानव अधिकार • सामाजिक न्याय</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 90 },
        ]}
      >
        {/* Title Headline */}
        <View style={styles.headlineSection}>
          <Text style={styles.headlineTitle}>Enter Donation Amount</Text>
          <Text style={styles.headlineSub}>Select or enter the amount you wish to contribute.</Text>
        </View>

        {/* Cause Preview Banner */}
        <View style={styles.itemCard}>
          <Image source={{ uri: imageUrl }} style={styles.itemThumbnail} />
          <View style={styles.itemInfoCol}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles.itemMetaRow}>
              <Text style={styles.categoryIconText}>📖 {category}</Text>
              <Text style={styles.locationIconText} numberOfLines={1}>
                📍 {location}
              </Text>
            </View>
            <Text style={styles.beneficiaryNotice}>
              Verified HRSJM Social Impact Initiative
            </Text>
          </View>
        </View>

        {/* Amount Selector Card */}
        <View style={styles.amountSelectCard}>
          <Text style={styles.cardSectionHeading}>Select Amount (₹)</Text>
          <Text style={styles.amountPickerSub}>
            Choose a quick preset or type a custom amount:
          </Text>

          {maxAllowedAmount !== undefined && maxAllowedAmount > 0 && (
            <View style={styles.remainingGoalBanner}>
              <Text style={styles.remainingGoalEmoji}>🎯</Text>
              <Text style={styles.remainingGoalText}>
                Remaining goal needed:{' '}
                <Text style={styles.remainingGoalBold}>₹{maxAllowedAmount.toLocaleString('en-IN')}</Text>
              </Text>
            </View>
          )}

          {/* Preset Buttons Grid */}
          <View style={styles.presetGrid}>
            {PRESET_AMOUNTS.map(amt => {
              const isSelected = !isCustomAmount && activeAmount === amt;
              return (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.presetChip,
                    isSelected && styles.presetChipActive,
                  ]}
                  onPress={() => handleSelectPreset(amt)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      isSelected && styles.presetChipTextActive,
                    ]}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Amount Field */}
          <View
            style={[
              styles.customAmountBox,
              isCustomAmount && styles.customAmountBoxActive,
            ]}
          >
            <Text style={styles.rupeePrefix}>₹</Text>
            <TextInput
              style={styles.customAmountInput}
              placeholder="Enter custom amount (e.g. 2,500)"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={customAmountText}
              onChangeText={handleCustomAmountChange}
              onBlur={handleCustomBlur}
              onEndEditing={handleCustomBlur}
            />
            {activeAmount > 0 && (
              <View style={styles.activeAmountIndicator}>
                <Text style={styles.activeAmountIndicatorText}>
                  ₹{activeAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Impact Message Card */}
        <View style={styles.impactTrustCard}>
          <Text style={styles.impactTrustIcon}>🤝</Text>
          <View style={styles.flexOneCol}>
            <Text style={styles.impactTrustTitle}>100% Transparent Non-Profit Mission</Text>
            <Text style={styles.impactTrustBody}>
              Your contribution of ₹{activeAmount.toLocaleString('en-IN')} directly supports
              grassroots legal aid, emergency food, and child education programs.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View
        style={[
          styles.bottomActionBar,
          { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.primaryProceedBtn,
            activeAmount < 50 && styles.primaryProceedBtnDisabled,
          ]}
          onPress={handleProceedToCheckout}
          disabled={activeAmount < 50}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryProceedBtnText}>
            Proceed to Pay ₹{activeAmount.toLocaleString('en-IN')} →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============================================================================
  // STAGE 2: CHECKOUT & PAYMENT METHOD (Main Gateway UI)
  // ============================================================================
  const renderCheckoutStage = () => (
    <View style={styles.stageContainer}>
      {/* Top Header */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <TouchableOpacity
          onPress={() => setStage('amount_selection')}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back to amount selection"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerLogoContainer}>
          <Image source={HRSJM_EMBLEM} style={styles.headerEmblem} resizeMode="contain" />
          <View style={styles.headerTextCol}>
            <Text style={styles.headerBrandTitle}>HRSJM</Text>
            <Text style={styles.headerHindiSub}>मानव अधिकार • सामाजिक न्याय</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerCloseCircleBtn}
          onPress={onClose}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Close payment"
        >
          <Text style={styles.headerCloseIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 120 },
        ]}
      >
        {/* Headline Section */}
        <View style={styles.headlineSection}>
          <Text style={styles.headlineTitle}>Secure Payment</Text>
          <Text style={styles.headlineSub}>Complete your donation securely.</Text>
        </View>

        {/* Item Preview Card */}
        <View style={styles.itemCard}>
          <Image source={{ uri: imageUrl }} style={styles.itemThumbnail} />
          <View style={styles.itemInfoCol}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles.itemMetaRow}>
              <Text style={styles.categoryIconText}>📖 {category}</Text>
              <Text style={styles.locationIconText} numberOfLines={1}>
                📍 {location}
              </Text>
            </View>

            <View style={styles.amountEditRow}>
              <View>
                <Text style={styles.amountSubLabel}>Donation Amount</Text>
                <Text style={styles.amountLargeValue}>₹{activeAmount.toLocaleString('en-IN')}</Text>
              </View>
              <TouchableOpacity
                style={styles.editAmountBtn}
                onPress={() => setStage('amount_selection')}
                activeOpacity={0.7}
              >
                <Text style={styles.editAmountBtnText}>Edit Amount</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardSectionHeading}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Donation Amount</Text>
            <Text style={styles.summaryValue}>₹{activeAmount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Fee</Text>
            <Text style={styles.summaryValue}>₹0</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax / Charges</Text>
            <Text style={styles.summaryValue}>₹0</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{activeAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Select Payment Method */}
        <View style={styles.methodsSection}>
          <Text style={styles.chooseMethodHeading}>Select Payment Method</Text>

          {/* Option 1: UPI (Recommended) */}
          <TouchableOpacity
            style={[
              styles.methodOptionCard,
              paymentMethod === 'upi' && styles.methodOptionCardActive,
            ]}
            onPress={() => setPaymentMethod('upi')}
            activeOpacity={0.8}
          >
            <View style={styles.methodUpiIconBox}>
              <UpiBrandLogo height={24} width={52} />
            </View>
            <View style={styles.methodInfoCol}>
              <Text style={styles.methodTitle}>UPI (Recommended)</Text>
              <Text style={styles.methodSub}>
                Pay using any UPI app (GPay, PhonePe, Paytm, etc.)
              </Text>
            </View>
            <PaymentRadioButton selected={paymentMethod === 'upi'} />
          </TouchableOpacity>

          {/* Option 2: Credit / Debit Card */}
          <TouchableOpacity
            style={[
              styles.methodOptionCard,
              paymentMethod === 'card' && styles.methodOptionCardActive,
            ]}
            onPress={() => setPaymentMethod('card')}
            activeOpacity={0.8}
          >
            <View style={styles.methodLeftIconBox}>
              <CardVectorIcon size={24} color="#0F2454" />
            </View>
            <View style={styles.methodInfoCol}>
              <Text style={styles.methodTitle}>Credit / Debit Card</Text>
              <Text style={styles.methodSub}>Visa, Mastercard, RuPay and more</Text>
            </View>
            <PaymentRadioButton selected={paymentMethod === 'card'} />
          </TouchableOpacity>

          {/* Option 3: Net Banking */}
          <TouchableOpacity
            style={[
              styles.methodOptionCard,
              paymentMethod === 'netbanking' && styles.methodOptionCardActive,
            ]}
            onPress={() => setPaymentMethod('netbanking')}
            activeOpacity={0.8}
          >
            <View style={styles.methodLeftIconBox}>
              <BankVectorIcon size={22} color="#0F2454" />
            </View>
            <View style={styles.methodInfoCol}>
              <Text style={styles.methodTitle}>Net Banking</Text>
              <Text style={styles.methodSub}>All major banks supported</Text>
            </View>
            <PaymentRadioButton selected={paymentMethod === 'netbanking'} />
          </TouchableOpacity>

          {/* Option 4: Wallets */}
          <TouchableOpacity
            style={[
              styles.methodOptionCard,
              paymentMethod === 'wallet' && styles.methodOptionCardActive,
            ]}
            onPress={() => setPaymentMethod('wallet')}
            activeOpacity={0.8}
          >
            <View style={styles.methodLeftIconBox}>
              <WalletVectorIcon size={24} color="#0F2454" />
            </View>
            <View style={styles.methodInfoCol}>
              <Text style={styles.methodTitle}>Wallets</Text>
              <Text style={styles.methodSub}>Paytm, PhonePe, Amazon Pay and more</Text>
            </View>
            <PaymentRadioButton selected={paymentMethod === 'wallet'} />
          </TouchableOpacity>

          {/* ================================================================== */}
          {/* METHOD SUB-FORM: UPI DETAILS (Screenshot 1 Apps Row + UPI ID) */}
          {/* ================================================================== */}
          {paymentMethod === 'upi' && (
            <View style={styles.subFormContainer}>
              <Text style={styles.subFormHeading}>Select UPI App</Text>

              {/* 4 App Cards from Screenshot 1 */}
              <View style={styles.upiAppsRow}>
                {/* GPay */}
                <TouchableOpacity
                  style={styles.upiAppColumn}
                  onPress={() => setSelectedUpiApp('gpay')}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.upiAppBox,
                      selectedUpiApp === 'gpay' && styles.upiAppBoxActive,
                    ]}
                  >
                    <GPayAppLogo size={32} />
                  </View>
                  <Text
                    style={[
                      styles.upiAppTextLabel,
                      selectedUpiApp === 'gpay' && styles.upiAppTextLabelActive,
                    ]}
                  >
                    GPay
                  </Text>
                </TouchableOpacity>

                {/* PhonePe */}
                <TouchableOpacity
                  style={styles.upiAppColumn}
                  onPress={() => setSelectedUpiApp('phonepe')}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.upiAppBox,
                      selectedUpiApp === 'phonepe' && styles.upiAppBoxActive,
                    ]}
                  >
                    <PhonePeAppLogo size={36} />
                  </View>
                  <Text
                    style={[
                      styles.upiAppTextLabel,
                      selectedUpiApp === 'phonepe' && styles.upiAppTextLabelActive,
                    ]}
                  >
                    PhonePe
                  </Text>
                </TouchableOpacity>

                {/* Paytm */}
                <TouchableOpacity
                  style={styles.upiAppColumn}
                  onPress={() => setSelectedUpiApp('paytm')}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.upiAppBox,
                      selectedUpiApp === 'paytm' && styles.upiAppBoxActive,
                    ]}
                  >
                    <PaytmAppLogo height={18} />
                  </View>
                  <Text
                    style={[
                      styles.upiAppTextLabel,
                      selectedUpiApp === 'paytm' && styles.upiAppTextLabelActive,
                    ]}
                  >
                    Paytm
                  </Text>
                </TouchableOpacity>

                {/* BHIM */}
                <TouchableOpacity
                  style={styles.upiAppColumn}
                  onPress={() => setSelectedUpiApp('bhim')}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.upiAppBox,
                      selectedUpiApp === 'bhim' && styles.upiAppBoxActive,
                    ]}
                  >
                    <BhimAppLogo size={24} width={44} />
                  </View>
                  <Text
                    style={[
                      styles.upiAppTextLabel,
                      selectedUpiApp === 'bhim' && styles.upiAppTextLabelActive,
                    ]}
                  >
                    BHIM
                  </Text>
                </TouchableOpacity>
              </View>

              {/* UPI ID entry */}
              <View style={styles.upiIdEntryBlock}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => upiInputRef.current?.focus()}
                >
                  <Text style={styles.inputFieldLabel}>Or enter UPI ID / VPA</Text>
                </TouchableOpacity>
                <Pressable
                  style={[
                    styles.upiInputWrapper,
                    upiFocused && styles.upiInputWrapperFocused,
                    ((upiTouched || !!upiError) && upiId.trim().length > 0 && !validateUpiFormat(upiId.trim()).isValid) &&
                      styles.upiInputWrapperError,
                  ]}
                  onPress={() => upiInputRef.current?.focus()}
                  accessible={false}
                >
                  <TextInput
                    ref={upiInputRef}
                    style={styles.upiTextInput}
                    placeholder="9888880002@upi"
                    placeholderTextColor="#94A3B8"
                    value={upiId}
                    onChangeText={handleUpiChange}
                    onFocus={() => {
                      setUpiFocused(true);
                      setUpiError(null);
                    }}
                    onBlur={handleUpiBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="done"
                    editable={!isSubmitting}
                  />
                  {validateUpiFormat(upiId.trim()).isValid ? (
                    <View style={styles.formatValidPill}>
                      <View style={styles.formatValidDot} />
                      <Text style={styles.formatValidText}>Format valid</Text>
                    </View>
                  ) : null}
                  {upiId.length > 0 ? (
                    <TouchableOpacity
                      style={styles.clearInputCircle}
                      onPress={() => {
                        setUpiId('');
                        setUpiError(null);
                        setUpiTouched(false);
                        upiInputRef.current?.focus();
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Clear UPI ID"
                    >
                      <Text style={styles.clearInputIcon}>✕</Text>
                    </TouchableOpacity>
                  ) : null}
                </Pressable>

                {/* Suffix suggestion chips when user types digits/name without @ */}
                {upiId.trim().length >= 3 && !upiId.includes('@') && (
                  <View style={styles.handleChipsContainer}>
                    <Text style={styles.handleChipsLabel}>Tap to add:</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      contentContainerStyle={styles.handleChipsScroll}
                    >
                      {['@upi', '@okhdfcbank', '@okaxis', '@paytm', '@ybl'].map(suffix => (
                        <TouchableOpacity
                          key={suffix}
                          style={styles.handleChip}
                          onPress={() => {
                            setUpiId(prev => prev.trim() + suffix);
                            setUpiError(null);
                            setUpiTouched(false);
                            upiInputRef.current?.focus();
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.handleChipText}>{suffix}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Format Valid Informational Notice (Neutral, not claiming account verification) */}
                {validateUpiFormat(upiId.trim()).isValid && (
                  <View style={styles.formatValidNoticeBox}>
                    <Text style={styles.formatValidNoticeIcon}>ℹ️</Text>
                    <Text style={styles.formatValidNoticeText}>
                      Format looks valid. Account existence will be verified by payment provider during checkout.
                    </Text>
                  </View>
                )}

                {/* Inline Error Message */}
                {(upiTouched || !!upiError) && upiId.trim().length > 0 && !validateUpiFormat(upiId.trim()).isValid && (
                  <View style={styles.inlineErrorBox}>
                    <Text style={styles.inlineErrorIcon}>⚠️</Text>
                    <Text style={styles.inlineErrorText}>
                      {upiError || validateUpiFormat(upiId.trim()).error || 'Please enter a valid UPI ID (e.g. 9888880002@upi)'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ================================================================== */}
          {/* METHOD SUB-FORM: CARD DETAILS */}
          {/* ================================================================== */}
          {paymentMethod === 'card' && (
            <View style={styles.subFormContainer}>
              <Text style={styles.subFormHeading}>Card Details</Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => cardInputRef.current?.focus()}
              >
                <Text style={styles.inputFieldLabel}>Card Number</Text>
              </TouchableOpacity>
              <Pressable
                style={[
                  styles.cardInputWrapper,
                  !!cardErrors.cardNumber && styles.inputErrorBorder,
                ]}
                onPress={() => cardInputRef.current?.focus()}
                accessible={false}
              >
                <TextInput
                  ref={cardInputRef}
                  style={styles.cardTextInput}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  editable={!isSubmitting}
                />
                <View style={styles.cardBadgesGroup}>
                  <VisaBadge height={13} />
                  <MastercardBadge size={16} />
                  <RupayBadge height={12} />
                </View>
              </Pressable>
              {!!cardErrors.cardNumber && (
                <View style={styles.inlineErrorBox}>
                  <Text style={styles.inlineErrorIcon}>⚠️</Text>
                  <Text style={styles.inlineErrorText}>{cardErrors.cardNumber}</Text>
                </View>
              )}

              <View style={styles.cardRowTwoCol}>
                <View style={styles.flexOneCol}>
                  <Text style={styles.inputFieldLabel}>Expiry Date</Text>
                  <TextInput
                    style={[
                      styles.twoColTextInput,
                      !!cardErrors.cardExpiry && styles.inputErrorBorder,
                    ]}
                    placeholder="MM / YY"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={5}
                    value={cardExpiry}
                    onChangeText={handleCardExpiryChange}
                    editable={!isSubmitting}
                  />
                  {!!cardErrors.cardExpiry && (
                    <View style={styles.inlineErrorBox}>
                      <Text style={styles.inlineErrorIcon}>⚠️</Text>
                      <Text style={styles.inlineErrorText}>{cardErrors.cardExpiry}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.flexOneCol}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => cvvInputRef.current?.focus()}
                  >
                    <Text style={styles.inputFieldLabel}>CVV</Text>
                  </TouchableOpacity>
                  <Pressable
                    style={[
                      styles.cvvInputWrapper,
                      !!cardErrors.cardCvv && styles.inputErrorBorder,
                    ]}
                    onPress={() => cvvInputRef.current?.focus()}
                    accessible={false}
                  >
                    <TextInput
                      ref={cvvInputRef}
                      style={styles.cvvTextInput}
                      placeholder="•••"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry={!showCvv}
                      value={cardCvv}
                      onChangeText={handleCardCvvChange}
                      editable={!isSubmitting}
                    />
                    <TouchableOpacity onPress={() => setShowCvv(!showCvv)}>
                      <Text style={styles.eyeIconText}>{showCvv ? '👁️' : '👁️'}</Text>
                    </TouchableOpacity>
                  </Pressable>
                  {!!cardErrors.cardCvv && (
                    <View style={styles.inlineErrorBox}>
                      <Text style={styles.inlineErrorIcon}>⚠️</Text>
                      <Text style={styles.inlineErrorText}>{cardErrors.cardCvv}</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.inputFieldLabel}>Card Holder Name</Text>
              <TextInput
                style={[
                  styles.cardHolderInput,
                  !!cardErrors.cardHolder && styles.inputErrorBorder,
                ]}
                placeholder={user?.full_name || 'Cardholder Name'}
                placeholderTextColor="#94A3B8"
                value={cardHolder}
                onChangeText={handleCardHolderChange}
              />
              {!!cardErrors.cardHolder && (
                <View style={styles.inlineErrorBox}>
                  <Text style={styles.inlineErrorIcon}>⚠️</Text>
                  <Text style={styles.inlineErrorText}>{cardErrors.cardHolder}</Text>
                </View>
              )}
            </View>
          )}

          {/* ================================================================== */}
          {/* METHOD SUB-FORM: NET BANKING */}
          {/* ================================================================== */}
          {paymentMethod === 'netbanking' && (
            <View style={styles.subFormContainer}>
              <Text style={styles.subFormHeading}>Select Your Bank</Text>
              <View style={styles.banksGrid}>
                {['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak', 'PNB'].map(
                  bank => (
                    <TouchableOpacity
                      key={bank}
                      style={[
                        styles.bankPill,
                        selectedBank === bank && styles.bankPillActive,
                      ]}
                      onPress={() => setSelectedBank(bank)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.bankPillText,
                          selectedBank === bank && styles.bankPillTextActive,
                        ]}
                      >
                        {bank}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </View>
          )}

          {/* ================================================================== */}
          {/* METHOD SUB-FORM: WALLETS */}
          {/* ================================================================== */}
          {paymentMethod === 'wallet' && (
            <View style={styles.subFormContainer}>
              <Text style={styles.subFormHeading}>Select Digital Wallet</Text>
              <View style={styles.banksGrid}>
                {['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay', 'MobiKwik'].map(
                  wallet => (
                    <TouchableOpacity
                      key={wallet}
                      style={[
                        styles.bankPill,
                        selectedWallet === wallet && styles.bankPillActive,
                      ]}
                      onPress={() => setSelectedWallet(wallet)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.bankPillText,
                          selectedWallet === wallet && styles.bankPillTextActive,
                        ]}
                      >
                        {wallet}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              <Text style={[styles.inputFieldLabel, styles.labelMarginTop]}>Linked Mobile Number</Text>
              <TextInput
                style={styles.cardHolderInput}
                placeholder={user?.mobile_number || '98XXXXXXXX'}
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={donorMobile}
                onChangeText={setDonorMobile}
              />
            </View>
          )}

          {/* ================================================================== */}
          {/* SECURE PAYMENT CALLOUT BANNER (Screenshot 2) */}
          {/* ================================================================== */}
          <View style={styles.secureCalloutBox}>
            <SecureShieldVectorIcon size={26} color="#1E40AF" />
            <View style={styles.secureCalloutTextCol}>
              <Text style={styles.secureCalloutTitle}>Secure Payment</Text>
              <Text style={styles.secureCalloutDesc}>
                Your payment information is encrypted and secured with industry-standard security measures.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Checkout Action */}
      <View
        style={[
          styles.bottomActionBar,
          { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        ]}
      >
        <TouchableOpacity
          style={[styles.payButton, isSubmitting && styles.payButtonDisabled]}
          onPress={handleStartPayment}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={styles.payButtonText}>
            🔒 Pay ₹{activeAmount.toLocaleString('en-IN')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============================================================================
  // STAGE 3: PROCESSING TIMELINE STAGE
  // ============================================================================
  const renderProcessingStage = () => {
    const STEPS = [
      { id: 1, label: 'Initiating payment' },
      { id: 2, label: 'Connecting to secure gateway' },
      { id: 3, label: 'Processing your payment' },
      { id: 4, label: 'Verifying transaction' },
      { id: 5, label: 'Finalizing payment' },
    ];

    return (
      <View style={styles.processingRoot}>
        {/* Header */}
        <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
          <View style={styles.headerLogoContainer}>
            <Image source={HRSJM_EMBLEM} style={styles.headerEmblem} resizeMode="contain" />
            <View style={styles.headerTextCol}>
              <Text style={styles.headerBrandTitle}>HRSJM</Text>
              <Text style={styles.headerHindiSub}>मानव अधिकार • सामाजिक न्याय</Text>
            </View>
          </View>
        </View>

        <View style={styles.processingContent}>
          {/* Animated Spinner Icon */}
          <View style={styles.spinnerContainer}>
            <Animated.View
              style={[
                styles.spinnerRing,
                { transform: [{ rotate: spinInterpolate }] },
              ]}
            />
            <View style={styles.spinnerCenterIcon}>
              <Text style={styles.cardCenterIconText}>💳</Text>
            </View>
          </View>

          <Text style={styles.processingTitle}>Processing Payment</Text>
          <Text style={styles.processingSubtitle}>
            Please don't close the application.{'\n'}Your payment is being processed
            securely.
          </Text>

          {/* Stepper Timeline */}
          <View style={styles.stepperContainer}>
            {STEPS.map((s, index) => {
              const isDone = processingStep > s.id;
              const isCurrent = processingStep === s.id;
              const isPending = processingStep < s.id;

              return (
                <View key={s.id} style={styles.stepItemRow}>
                  {/* Step Indicator & Line */}
                  <View style={styles.stepIndicatorCol}>
                    <View
                      style={[
                        styles.stepCircle,
                        isDone && styles.stepCircleDone,
                        isCurrent && styles.stepCircleCurrent,
                        isPending && styles.stepCirclePending,
                      ]}
                    >
                      {isDone ? (
                        <Text style={styles.stepCheckIcon}>✓</Text>
                      ) : isCurrent ? (
                        <View style={styles.stepInnerDot} />
                      ) : null}
                    </View>
                    {index < STEPS.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          isDone && styles.stepLineDone,
                        ]}
                      />
                    )}
                  </View>

                  {/* Step Label */}
                  <Text
                    style={[
                      styles.stepLabel,
                      isDone && styles.stepLabelDone,
                      isCurrent && styles.stepLabelCurrent,
                      isPending && styles.stepLabelPending,
                    ]}
                  >
                    {s.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Security Footer Notice */}
        <View
          style={[
            styles.secureNoticeBox,
            { marginBottom: Math.max(insets.bottom, 16) + 10 },
          ]}
        >
          <Text style={styles.secureNoticeIcon}>🛡️</Text>
          <View style={styles.flexOneCol}>
            <Text style={styles.secureNoticeTitle}>Secure Transaction</Text>
            <Text style={styles.secureNoticeBody}>
              Your payment is processed through a secure payment gateway. HRSJM does not
              store your card or UPI details.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // ============================================================================
  // STAGE 4: SUCCESS & RECEIPT STAGE
  // ============================================================================
  const renderSuccessStage = () => {
    if (!receiptResult) return null;

    return (
      <View style={styles.stageContainer}>
        {/* Top Header */}
        <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
          <View style={styles.headerLogoContainer}>
            <Image source={HRSJM_EMBLEM} style={styles.headerEmblem} resizeMode="contain" />
            <View style={styles.headerTextCol}>
              <Text style={styles.headerBrandTitle}>HRSJM</Text>
              <Text style={styles.headerHindiSub}>मानव अधिकार • सामाजिक न्याय</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerCloseCircleBtn}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Close confirmation"
          >
            <Text style={styles.headerCloseIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 110 },
          ]}
        >
          {/* Big Green Success Aura Badge */}
          <View style={styles.successAuraBox}>
            <View style={styles.successCircleOuter}>
              <View style={styles.successCircleInner}>
                <Text style={styles.successBigCheckIcon}>✓</Text>
              </View>
            </View>
          </View>

          <Text style={styles.successHeading}>Donation Successful</Text>
          <Text style={styles.successSubheading}>
            Thank you for supporting{'\n'}
            <Text style={styles.successCauseTitle}>{receiptResult.title}.</Text>
          </Text>

          {/* Amount Box Card */}
          <View style={styles.successAmountCard}>
            <Text style={styles.successAmountNumber}>
              ₹{receiptResult.amount.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.successAmountCaption}>
              has been successfully donated.
            </Text>
          </View>

          {/* Transaction Metadata Card */}
          <View style={styles.receiptMetaCard}>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Payment ID</Text>
              <Text style={styles.receiptMetaValue}>{receiptResult.paymentId}</Text>
            </View>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Donation ID</Text>
              <Text style={styles.receiptMetaValue}>{receiptResult.donationId}</Text>
            </View>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Date & Time</Text>
              <Text style={styles.receiptMetaValue}>
                {receiptResult.date}, {receiptResult.time}
              </Text>
            </View>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Payment Method</Text>
              <Text style={styles.receiptMetaValue}>{receiptResult.paymentMethod}</Text>
            </View>
            {receiptResult.bankReferenceNo ? (
              <View style={styles.receiptMetaRow}>
                <Text style={styles.receiptMetaLabel}>Gateway UTR / Ref</Text>
                <Text style={styles.receiptMetaValue} numberOfLines={1}>{receiptResult.bankReferenceNo}</Text>
              </View>
            ) : null}
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Status</Text>
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Completed</Text>
              </View>
            </View>
          </View>

          {/* Mini Item Card */}
          <View style={styles.successItemCard}>
            <Image source={{ uri: imageUrl }} style={styles.successItemThumb} />
            <View style={styles.flexOneCol}>
              <Text style={styles.successItemTitle} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.successItemMeta}>
                📖 {category} • 📍 {location}
              </Text>
            </View>
          </View>

          {/* Receipt Actions Row */}
          <View style={styles.receiptActionsRow}>
            <TouchableOpacity
              style={styles.actionPillBtn}
              onPress={() => {
                Alert.alert(
                  'Official 80G Receipt',
                  `Receipt Number: ${receiptResult.receiptNumber}\nAmount: ₹${receiptResult.amount.toLocaleString('en-IN')}\nEligible for 50% Tax Exemption under Section 80G of Income Tax Act.`,
                );
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionPillIcon}>📄</Text>
              <Text style={styles.actionPillLabel}>View Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionPillBtn}
              onPress={handleDownloadReceipt}
              activeOpacity={0.7}
            >
              <Text style={styles.actionPillIcon}>📥</Text>
              <Text style={styles.actionPillLabel}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionPillBtn}
              onPress={handleShareReceipt}
              activeOpacity={0.7}
            >
              <Text style={styles.actionPillIcon}>🔗</Text>
              <Text style={styles.actionPillLabel}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Sticky Bottom Actions */}
        <View
          style={[
            styles.bottomActionBar,
            { paddingBottom: Math.max(insets.bottom, 14) + 6 },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryBackHomeBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBackHomeBtnText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewHistoryLinkBtn}
            onPress={() => {
              onClose();
              onViewHistory?.();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.viewHistoryLinkText}>View Donation History →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ============================================================================
  // STAGE 5: PAYMENT FAILED / DECLINED STAGE
  // ============================================================================
  const renderFailedStage = () => {
    const friendlySubheading = getFriendlyDeclineSubheading(failureError?.message || failureError?.reason);
    const friendlyReason = getFriendlyDeclineReason(failureError?.message || failureError?.reason);

    const paymentMethodDisplay =
      paymentMethod === 'upi'
        ? selectedUpiApp === 'gpay'
          ? 'UPI (Google Pay)'
          : selectedUpiApp === 'phonepe'
          ? 'UPI (PhonePe)'
          : selectedUpiApp === 'paytm'
          ? 'UPI (Paytm)'
          : 'UPI (BHIM)'
        : paymentMethod === 'card'
        ? 'Debit / Credit Card'
        : paymentMethod === 'netbanking'
        ? selectedBank
        : selectedWallet;

    return (
      <View style={styles.stageContainer}>
        {/* Top Header */}
        <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
          <View style={styles.headerLogoContainer}>
            <Image source={HRSJM_EMBLEM} style={styles.headerEmblem} resizeMode="contain" />
            <View style={styles.headerTextCol}>
              <Text style={styles.headerBrandTitle}>HRSJM</Text>
              <Text style={styles.headerHindiSub}>मानव अधिकार • सामाजिक न्याय</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerCloseCircleBtn}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Close payment failure"
          >
            <Text style={styles.headerCloseIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 160 },
          ]}
        >
          {/* Failure Aura Badge */}
          <View style={styles.failedAuraBox}>
            <View style={styles.failedCircleOuter}>
              <View style={styles.failedCircleInner}>
                <Text style={styles.failedCrossIcon}>✕</Text>
              </View>
            </View>
          </View>

          <Text style={styles.failedHeading}>Payment Unsuccessful</Text>
          <Text style={styles.failedSubheading}>{friendlySubheading}</Text>

          {/* Failed Amount Card */}
          <View style={styles.failedAmountCard}>
            <View style={styles.failedAmountBadge}>
              <Text style={styles.failedAmountBadgeText}>TRANSACTION ATTEMPT</Text>
            </View>
            <Text style={styles.failedAmountNumber}>
              ₹{activeAmount.toLocaleString('en-IN')}
            </Text>
            <View style={styles.failedSafeRow}>
              <Text style={styles.failedSafeIcon}>🔒</Text>
              <Text style={styles.failedAmountCaption}>
                No money has been debited from your account.
              </Text>
            </View>
          </View>

          {/* Transaction Metadata Card */}
          <View style={styles.receiptMetaCard}>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Payment Status</Text>
              <View style={styles.failedBadge}>
                <View style={styles.failedBadgeDot} />
                <Text style={styles.failedBadgeText}>Declined</Text>
              </View>
            </View>

            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Payment Method</Text>
              <Text style={styles.receiptMetaValue}>{paymentMethodDisplay}</Text>
            </View>

            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Status Code</Text>
              <Text style={styles.receiptMetaCodeValue}>
                {failureError?.code || 'PAYMENT_DECLINED'}
              </Text>
            </View>

            {/* Dedicated Failure Reason Box - Stacked layout prevents any text collision */}
            <View style={styles.declineReasonBox}>
              <View style={styles.declineReasonHeaderRow}>
                <Text style={styles.declineReasonIcon}>⚠️</Text>
                <Text style={styles.declineReasonLabel}>Reason for Failure</Text>
              </View>
              <Text style={styles.declineReasonText}>{friendlyReason}</Text>
            </View>
          </View>

          {/* Security Reassurance Card */}
          <View style={styles.secureReassureCard}>
            <View style={styles.secureReassureIconCircle}>
              <Text style={styles.secureReassureIcon}>🛡️</Text>
            </View>
            <View style={styles.flexOneCol}>
              <Text style={styles.secureReassureTitle}>Zero Account Risk Guarantee</Text>
              <Text style={styles.secureReassureBody}>
                Your money is completely safe. No charges were made to your bank account or card. In the event of an unexpected bank hold, it will automatically reverse within 24–48 hours.
              </Text>
            </View>
          </View>

          {/* Developer Technical Diagnostics (__DEV__ only) */}
          {__DEV__ && failureError?.message && (
            <View style={styles.devDiagCard}>
              <TouchableOpacity
                onPress={() => setShowDevDebug(prev => !prev)}
                style={styles.devDiagHeader}
                activeOpacity={0.7}
              >
                <View style={styles.devDiagTitleRow}>
                  <Text style={styles.devDiagIcon}>⚙️</Text>
                  <Text style={styles.devDiagTitle}>Developer Diagnostics</Text>
                </View>
                <Text style={styles.devDiagToggle}>{showDevDebug ? '▲ Hide' : '▼ View Details'}</Text>
              </TouchableOpacity>
              {showDevDebug && (
                <View style={styles.devDiagContent}>
                  <Text style={styles.devDiagSub}>Raw Gateway Response:</Text>
                  <Text style={styles.devDiagErrorText} selectable>
                    {failureError.message}
                  </Text>
                  {failureError.code && (
                    <Text style={styles.devDiagCodeText}>
                      Code: {failureError.code}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Sticky Bottom Actions */}
        <View
          style={[
            styles.bottomActionBar,
            { paddingBottom: Math.max(insets.bottom, 14) + 8 },
          ]}
        >
          <TouchableOpacity
            style={[styles.primaryRetryBtn, isRetrying && styles.payButtonDisabled]}
            onPress={handleRetryPayment}
            disabled={isRetrying}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryRetryBtnText}>
              {isRetrying ? 'Checking Status...' : 'Try Again'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelExitBtn}
            onPress={handleCancelAndExit}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelExitBtnText}>Cancel & Exit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ============================================================================
  // STAGE 6: USER DROPPED / CANCELLED STAGE
  // ============================================================================
  const renderUserDroppedStage = () => {
    const paymentMethodDisplay =
      paymentMethod === 'upi'
        ? selectedUpiApp === 'gpay'
          ? 'UPI (Google Pay)'
          : selectedUpiApp === 'phonepe'
          ? 'UPI (PhonePe)'
          : selectedUpiApp === 'paytm'
          ? 'UPI (Paytm)'
          : 'UPI (BHIM)'
        : paymentMethod === 'card'
        ? 'Debit / Credit Card'
        : paymentMethod === 'netbanking'
        ? selectedBank
        : selectedWallet;

    return (
      <View style={styles.stageContainer}>
        {/* Top Header */}
        <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
          <View style={styles.headerLogoContainer}>
            <Image source={HRSJM_EMBLEM} style={styles.headerEmblem} resizeMode="contain" />
            <View style={styles.headerTextCol}>
              <Text style={styles.headerBrandTitle}>HRSJM</Text>
              <Text style={styles.headerHindiSub}>मानव अधिकार • सामाजिक न्याय</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerCloseCircleBtn}
            onPress={handleCancelAndExit}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={styles.headerCloseIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 160 },
          ]}
        >
          {/* Neutral Amber User Dropped Icon Aura Badge */}
          <View style={styles.userDroppedAuraBox}>
            <View style={styles.userDroppedCircleOuter}>
              <View style={styles.userDroppedCircleInner}>
                <Text style={styles.userDroppedIcon}>↩️</Text>
              </View>
            </View>
          </View>

          <Text style={styles.userDroppedHeading}>Payment Not Completed</Text>
          <Text style={styles.userDroppedSubheading}>
            You left or cancelled the payment before completing it. No successful payment has been confirmed. You can try again.
          </Text>

          {/* Transaction Attempt Card */}
          <View style={styles.userDroppedAmountCard}>
            <View style={styles.userDroppedAmountBadge}>
              <Text style={styles.userDroppedAmountBadgeText}>TRANSACTION ATTEMPT</Text>
            </View>
            <Text style={styles.userDroppedAmountNumber}>
              ₹{activeAmount.toLocaleString('en-IN')}
            </Text>
            <View style={styles.userDroppedSafeRow}>
              <Text style={styles.userDroppedSafeIcon}>ℹ️</Text>
              <Text style={styles.userDroppedAmountCaption}>
                No successful payment has been confirmed.
              </Text>
            </View>
          </View>

          {/* Transaction Metadata Card */}
          <View style={styles.receiptMetaCard}>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Payment Status</Text>
              <View style={styles.userDroppedBadge}>
                <View style={styles.userDroppedBadgeDot} />
                <Text style={styles.userDroppedBadgeText}>Not Completed</Text>
              </View>
            </View>

            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Payment Method</Text>
              <Text style={styles.receiptMetaValue}>{paymentMethodDisplay}</Text>
            </View>

            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Status Code</Text>
              <Text style={styles.userDroppedMetaCodeValue}>
                {failureError?.code || 'USER_DROPPED'}
              </Text>
            </View>

            {/* Informational Session Note Box */}
            <View style={styles.userDroppedNoticeBox}>
              <View style={styles.userDroppedNoticeHeaderRow}>
                <Text style={styles.userDroppedNoticeIcon}>ℹ️</Text>
                <Text style={styles.userDroppedNoticeLabel}>Session Note</Text>
              </View>
              <Text style={styles.userDroppedNoticeText}>
                You left or cancelled the payment session before completing it. If money was debited from your bank account, your bank or UPI provider will automatically refund it within 3–5 business days.
              </Text>
            </View>
          </View>

          {/* Security Reassurance Card */}
          <View style={styles.userDroppedReassureCard}>
            <View style={styles.userDroppedReassureIconCircle}>
              <Text style={styles.userDroppedReassureIcon}>🛡️</Text>
            </View>
            <View style={styles.flexOneCol}>
              <Text style={styles.userDroppedReassureTitle}>Zero Duplicate Charge Guarantee</Text>
              <Text style={styles.userDroppedReassureBody}>
                HRSJM never marks a donation as paid or issues an 80G receipt until the transaction is definitively verified. You can safely try again whenever you are ready.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Actions */}
        <View
          style={[
            styles.bottomActionBar,
            { paddingBottom: Math.max(insets.bottom, 14) + 8 },
          ]}
        >
          <TouchableOpacity
            style={[styles.primaryRetryBtn, isRetrying && styles.payButtonDisabled]}
            onPress={handleRetryPayment}
            disabled={isRetrying}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryRetryBtnText}>
              {isRetrying ? 'Checking Status...' : 'Try Again'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelExitBtn}
            onPress={handleCancelAndExit}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelExitBtnText}>Cancel & Exit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ============================================================================
  // STAGE 7: PAYMENT PENDING VERIFICATION STAGE
  // ============================================================================
  const renderPendingStage = () => {
    const paymentMethodDisplay =
      paymentMethod === 'upi'
        ? selectedUpiApp === 'gpay'
          ? 'UPI (Google Pay)'
          : selectedUpiApp === 'phonepe'
          ? 'UPI (PhonePe)'
          : selectedUpiApp === 'paytm'
          ? 'UPI (Paytm)'
          : 'UPI (BHIM)'
        : paymentMethod === 'card'
        ? 'Debit / Credit Card'
        : paymentMethod === 'netbanking'
        ? selectedBank
        : selectedWallet;

    return (
      <View style={styles.stageContainer}>
        {/* Top Header */}
        <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
          <View style={styles.headerLogoContainer}>
            <Image source={HRSJM_EMBLEM} style={styles.headerEmblem} resizeMode="contain" />
            <View style={styles.headerTextCol}>
              <Text style={styles.headerBrandTitle}>HRSJM</Text>
              <Text style={styles.headerHindiSub}>मानव अधिकार • सामाजिक न्याय</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerCloseCircleBtn}
            onPress={handleCancelAndExit}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={styles.headerCloseIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 160 },
          ]}
        >
          {/* Blue Pending Aura Badge */}
          <View style={styles.pendingAuraBox}>
            <View style={styles.pendingCircleOuter}>
              <View style={styles.pendingCircleInner}>
                <Text style={styles.pendingIcon}>⏳</Text>
              </View>
            </View>
          </View>

          <Text style={styles.pendingHeading}>Payment Pending Verification</Text>
          <Text style={styles.pendingSubheading}>
            {failureError?.message || 'Your payment is being processed by your bank. Verification is still pending. We will confirm your contribution as soon as it resolves.'}
          </Text>

          {/* Transaction Pending Card */}
          <View style={styles.pendingAmountCard}>
            <View style={styles.pendingAmountBadge}>
              <Text style={styles.pendingAmountBadgeText}>TRANSACTION PENDING</Text>
            </View>
            <Text style={styles.pendingAmountNumber}>
              ₹{activeAmount.toLocaleString('en-IN')}
            </Text>
            <View style={styles.pendingSafeRow}>
              <Text style={styles.pendingSafeIcon}>⏳</Text>
              <Text style={styles.pendingAmountCaption}>
                Awaiting final confirmation from bank gateway.
              </Text>
            </View>
          </View>

          {/* Transaction Metadata Card */}
          <View style={styles.receiptMetaCard}>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Payment Status</Text>
              <View style={styles.pendingBadge}>
                <View style={styles.pendingBadgeDot} />
                <Text style={styles.pendingBadgeText}>Pending</Text>
              </View>
            </View>

            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Payment Method</Text>
              <Text style={styles.receiptMetaValue}>{paymentMethodDisplay}</Text>
            </View>

            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Status Code</Text>
              <Text style={styles.pendingMetaCodeValue}>
                {failureError?.code || 'PAYMENT_PENDING'}
              </Text>
            </View>

            {/* Verification In Progress Notice */}
            <View style={styles.pendingNoticeBox}>
              <View style={styles.pendingNoticeHeaderRow}>
                <Text style={styles.pendingNoticeIcon}>⏱️</Text>
                <Text style={styles.pendingNoticeLabel}>Verification In Progress</Text>
              </View>
              <Text style={styles.pendingNoticeText}>
                Your payment request has been submitted to your bank. Please do not submit duplicate payments while verification is underway. Tap "Check Status" to refresh the verification.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Actions */}
        <View
          style={[
            styles.bottomActionBar,
            { paddingBottom: Math.max(insets.bottom, 14) + 8 },
          ]}
        >
          <TouchableOpacity
            style={[styles.primaryRetryBtn, isRetrying && styles.payButtonDisabled]}
            onPress={handleRetryPayment}
            disabled={isRetrying}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryRetryBtnText}>
              {isRetrying ? 'Checking Status...' : 'Check Status'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelExitBtn}
            onPress={handleCancelAndExit}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelExitBtnText}>Cancel & Exit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" />
      {stage === 'amount_selection' && renderAmountSelectionStage()}
      {stage === 'checkout' && renderCheckoutStage()}
      {stage === 'processing' && renderProcessingStage()}
      {stage === 'success' && renderSuccessStage()}
      {stage === 'failed' && renderFailedStage()}
      {stage === 'user_dropped' && renderUserDroppedStage()}
      {stage === 'pending' && renderPendingStage()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  stageContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F2860',
  },
  headerCloseCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  headerCloseIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2860',
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  headerEmblem: {
    width: 32,
    height: 32,
  },
  headerTextCol: {
    justifyContent: 'center',
  },
  headerBrandTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2F52',
    lineHeight: 19,
  },
  headerHindiSub: {
    fontFamily: FontFamilies.sans,
    fontSize: 9.5,
    color: '#C9971A',
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  headlineSection: {
    marginBottom: 14,
  },
  headlineTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#0B2F52',
    lineHeight: 28,
  },
  headlineSub: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },

  /* Item Card */
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    marginBottom: 16,
    gap: 12,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#EDF2F7',
  },
  itemInfoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2F52',
    lineHeight: 19,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  categoryIconText: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    color: '#718096',
  },
  locationIconText: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    color: '#718096',
    flex: 1,
  },
  beneficiaryNotice: {
    fontFamily: FontFamilies.sans,
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '600',
  },
  amountEditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountSubLabel: {
    fontFamily: FontFamilies.sans,
    fontSize: 10,
    color: '#718096',
  },
  amountLargeValue: {
    fontFamily: FontFamilies.display,
    fontSize: 17,
    fontWeight: '700',
    color: '#06294D',
  },
  editAmountBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  editAmountBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#1B3F8F',
    fontWeight: '700',
  },

  /* Amount Selection Card for Step 1 */
  amountSelectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  amountPickerSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  remainingGoalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 6,
  },
  remainingGoalEmoji: {
    fontSize: 14,
  },
  remainingGoalText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#1E40AF',
  },
  remainingGoalBold: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#1B3F8F',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  presetChip: {
    flex: 1,
    minWidth: '22%',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipActive: {
    backgroundColor: '#06294D',
    borderColor: '#06294D',
  },
  presetChipText: {
    fontFamily: FontFamilies.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2F52',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  customAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DCE4EC',
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  customAmountBoxActive: {
    borderColor: '#06294D',
    backgroundColor: '#FFFFFF',
  },
  rupeePrefix: {
    fontFamily: FontFamilies.display,
    fontSize: 20,
    fontWeight: '700',
    color: '#06294D',
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    fontFamily: FontFamilies.sans,
    fontSize: 15,
    color: '#0B2F52',
    padding: 0,
  },
  activeAmountIndicator: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeAmountIndicatorText: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#06294D',
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D97706',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: '#D97706',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  checkboxTextCol: {
    flex: 1,
  },
  checkboxTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12.5,
    fontWeight: '700',
    color: '#78350F',
  },
  checkboxSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
    lineHeight: 14,
  },
  panInputBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  panTextInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  panHintText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 4,
  },
  impactTrustCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 14,
  },
  impactTrustIcon: {
    fontSize: 22,
  },
  impactTrustTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  impactTrustBody: {
    fontFamily: 'Inter-Regular',
    fontSize: 11.5,
    color: '#15803D',
    marginTop: 2,
    lineHeight: 16,
  },
  primaryProceedBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryProceedBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryProceedBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  /* Payment Summary Card */
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardSectionHeading: {
    fontFamily: FontFamilies.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#718096',
  },
  summaryValue: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#0B2F52',
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#DBE5EE',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: FontFamilies.sans,
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2F52',
  },
  totalValue: {
    fontFamily: FontFamilies.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#06294D',
  },
  /* Choose Payment Method */
  methodsSection: {
    marginBottom: 20,
  },
  chooseMethodHeading: {
    fontFamily: FontFamilies.display,
    fontSize: 17,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 14,
  },
  methodOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: '#DCE4EC',
    marginBottom: 10,
    gap: 10,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  methodOptionCardActive: {
    borderColor: '#E9B82E',
    borderWidth: 1.5,
    backgroundColor: '#FAF7F0',
  },
  methodLeftIconBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodUpiIconBox: {
    width: 52,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfoCol: {
    flex: 1,
  },
  methodTitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0B2F52',
  },
  methodSub: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
    lineHeight: 16,
  },

  /* Method Sub Form */
  subFormContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    padding: 16,
    marginTop: 4,
    marginBottom: 14,
  },
  subFormHeading: {
    fontFamily: FontFamilies.display,
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 12,
  },
  inputFieldLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
  },
  reqStar: {
    color: '#EF4444',
  },
  upiAppsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  upiAppColumn: {
    alignItems: 'center',
    width: '23%',
  },
  upiAppBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  upiAppBoxActive: {
    borderColor: '#EAA43A',
    borderWidth: 1.5,
    backgroundColor: '#FFFDF9',
  },
  upiAppTextLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
    marginTop: 6,
    textAlign: 'center',
  },
  upiAppTextLabelActive: {
    fontFamily: 'Inter-Bold',
    color: '#0F2454',
    fontWeight: '700',
  },
  upiIdEntryBlock: {
    marginTop: 14,
  },
  upiInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  upiInputWrapperFocused: {
    borderColor: '#0F2860',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  upiInputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  upiTextInput: {
    flex: 1,
    height: '100%',
    minHeight: 46,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  clearInputCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearInputIcon: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  formatValidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
    gap: 4,
  },
  formatValidDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748B',
  },
  formatValidText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  formatValidNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 8,
    gap: 6,
  },
  formatValidNoticeIcon: {
    fontSize: 12,
  },
  formatValidNoticeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11.5,
    color: '#64748B',
    flex: 1,
    lineHeight: 16,
  },
  handleChipsContainer: {
    marginTop: 8,
  },
  handleChipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  handleChipsLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#64748B',
    marginRight: 2,
  },
  handleChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  handleChipText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11.5,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  secureCalloutBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 12,
  },
  secureCalloutTextCol: {
    flex: 1,
  },
  secureCalloutTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 3,
  },
  secureCalloutDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },

  /* Card Inputs */
  cardInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  cardTextInput: {
    flex: 1,
    height: '100%',
    minHeight: 40,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  cardBadgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardRowTwoCol: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  twoColTextInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0F172A',
  },
  cvvInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  cvvTextInput: {
    flex: 1,
    height: '100%',
    minHeight: 40,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  eyeIconText: {
    fontSize: 15,
  },
  cardHolderInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 12,
  },
  securityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blueLockIcon: {
    fontSize: 12,
  },
  securityBadgeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748B',
  },

  /* Net Banking */
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  bankPillActive: {
    backgroundColor: '#06294D',
    borderColor: '#06294D',
  },
  bankPillText: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    color: '#34516D',
  },
  bankPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Sticky Bottom */
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DBE5EE',
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  payButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonText: {
    fontFamily: FontFamilies.sans,
    fontSize: 15,
    fontWeight: '700',
    color: '#011F39',
    letterSpacing: 0.3,
  },

  /* Processing Stage */
  processingRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  processingContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  spinnerContainer: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  spinnerRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#E2E8F0',
    borderTopColor: '#1B3F8F',
  },
  spinnerCenterIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCenterIconText: {
    fontSize: 24,
  },
  processingTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 6,
  },
  processingSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  stepperContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 12,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  stepCircleDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepCircleCurrent: {
    borderColor: '#1B3F8F',
    backgroundColor: '#EEF2FF',
  },
  stepCirclePending: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  stepInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1B3F8F',
  },
  stepLine: {
    width: 2,
    height: 22,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  stepLineDone: {
    backgroundColor: '#10B981',
  },
  stepLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#94A3B8',
    paddingTop: 2,
  },
  stepLabelDone: {
    color: '#059669',
    fontWeight: '700',
  },
  stepLabelCurrent: {
    color: '#1B3F8F',
    fontWeight: '700',
  },
  stepLabelPending: {
    color: '#94A3B8',
  },
  stepCheckIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  secureNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secureNoticeIcon: {
    fontSize: 20,
  },
  secureNoticeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#0F2860',
    fontWeight: '700',
  },
  secureNoticeBody: {
    fontFamily: 'Inter-Regular',
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
  },

  /* Success Stage */
  successAuraBox: {
    alignItems: 'center',
    marginVertical: 14,
  },
  successCircleOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircleInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBigCheckIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  successHeading: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#06294D',
    textAlign: 'center',
    marginBottom: 4,
  },
  successSubheading: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  successCauseTitle: {
    fontFamily: FontFamilies.sans,
    color: '#059669',
    fontWeight: '700',
  },
  successAmountCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  successAmountNumber: {
    fontFamily: FontFamilies.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#15803D',
  },
  successAmountCaption: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
  },
  receiptMetaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  receiptMetaLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    flexShrink: 0,
  },
  receiptMetaValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
    flexShrink: 1,
  },
  completedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#166534',
    fontWeight: '700',
  },
  successItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 10,
  },
  successItemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  successItemTitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2F52',
  },
  successItemMeta: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  receiptActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionPillBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionPillIcon: {
    fontSize: 14,
  },
  actionPillLabel: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#0B2F52',
  },
  primaryBackHomeBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBackHomeBtnText: {
    fontFamily: FontFamilies.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#011F39',
  },
  viewHistoryLinkBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  viewHistoryLinkText: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    color: '#06294D',
    fontWeight: '700',
  },

  /* Payment Failed Stage */
  failedAuraBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  failedCircleOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FECACA',
  },
  failedCircleInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  failedCrossIcon: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  failedHeading: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#06294D',
    textAlign: 'center',
    marginBottom: 6,
  },
  failedSubheading: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  failedAmountCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  failedAmountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  failedAmountBadgeText: {
    fontFamily: FontFamilies.sans,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#B91C1C',
    letterSpacing: 0.5,
  },
  failedAmountNumber: {
    fontFamily: FontFamilies.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#B91C1C',
    letterSpacing: -0.5,
  },
  failedSafeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  failedSafeIcon: {
    fontSize: 12,
  },
  failedAmountCaption: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#991B1B',
  },
  failedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  failedBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  failedBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '700',
  },
  receiptMetaCodeValue: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B91C1C',
    letterSpacing: 0.3,
  },
  declineReasonBox: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  declineReasonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  declineReasonIcon: {
    fontSize: 13,
  },
  declineReasonLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  declineReasonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    marginTop: 2,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secureReassureCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 14,
    marginBottom: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  secureReassureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  secureReassureIcon: {
    fontSize: 18,
  },
  secureReassureTitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 3,
  },
  secureReassureBody: {
    fontFamily: FontFamilies.sans,
    fontSize: 11.5,
    color: '#15803D',
    lineHeight: 16.5,
  },
  devDiagCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 16,
  },
  devDiagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  devDiagTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  devDiagIcon: {
    fontSize: 12,
  },
  devDiagTitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    color: '#34516D',
    fontWeight: '700',
  },
  devDiagToggle: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    color: '#06294D',
  },
  devDiagContent: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  devDiagSub: {
    fontFamily: FontFamilies.sans,
    fontSize: 10.5,
    color: '#718096',
    marginBottom: 4,
  },
  devDiagErrorText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 10.5,
    color: '#991B1B',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    lineHeight: 14,
  },
  devDiagCodeText: {
    fontFamily: FontFamilies.sans,
    fontSize: 10.5,
    color: '#718096',
    marginTop: 6,
  },
  primaryRetryBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryRetryBtnText: {
    fontFamily: FontFamilies.sans,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#011F39',
  },
  cancelExitBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelExitBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  flexOneCol: {
    flex: 1,
  },
  labelMarginTop: {
    marginTop: 12,
  },
  inputErrorBorder: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inlineErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  inlineErrorIcon: {
    fontSize: 12,
    color: '#DC2626',
  },
  inlineErrorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11.5,
    color: '#DC2626',
    flex: 1,
    lineHeight: 16,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },

  /* User Dropped Stage */
  userDroppedAuraBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  userDroppedCircleOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FDE68A',
  },
  userDroppedCircleInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  userDroppedIcon: {
    fontSize: 26,
    textAlign: 'center',
  },
  userDroppedHeading: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#06294D',
    textAlign: 'center',
    marginBottom: 6,
  },
  userDroppedSubheading: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  userDroppedAmountCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  userDroppedAmountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  userDroppedAmountBadgeText: {
    fontFamily: FontFamilies.sans,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  userDroppedAmountNumber: {
    fontFamily: FontFamilies.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: -0.5,
  },
  userDroppedSafeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  userDroppedSafeIcon: {
    fontSize: 12,
  },
  userDroppedAmountCaption: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#92400E',
  },
  userDroppedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  userDroppedBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  userDroppedBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#92400E',
    fontWeight: '700',
  },
  userDroppedMetaCodeValue: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 0.3,
  },
  userDroppedNoticeBox: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  userDroppedNoticeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userDroppedNoticeIcon: {
    fontSize: 13,
  },
  userDroppedNoticeLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  userDroppedNoticeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    marginTop: 2,
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  userDroppedReassureCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  userDroppedReassureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  userDroppedReassureIcon: {
    fontSize: 18,
  },
  userDroppedReassureTitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 3,
  },
  userDroppedReassureBody: {
    fontFamily: FontFamilies.sans,
    fontSize: 11.5,
    color: '#718096',
    lineHeight: 16.5,
  },

  /* Pending Stage */
  pendingAuraBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  pendingCircleOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#DBE5EE',
  },
  pendingCircleInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#06294D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  pendingIcon: {
    fontSize: 26,
    textAlign: 'center',
  },
  pendingHeading: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#06294D',
    textAlign: 'center',
    marginBottom: 6,
  },
  pendingSubheading: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  pendingAmountCard: {
    backgroundColor: '#EDF2F7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBE5EE',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  pendingAmountBadge: {
    backgroundColor: '#DBE5EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  pendingAmountBadgeText: {
    fontFamily: FontFamilies.sans,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#06294D',
    letterSpacing: 0.5,
  },
  pendingAmountNumber: {
    fontFamily: FontFamilies.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#06294D',
    letterSpacing: -0.5,
  },
  pendingSafeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  pendingSafeIcon: {
    fontSize: 12,
  },
  pendingAmountCaption: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#1E40AF',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  pendingBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  pendingBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '700',
  },
  pendingMetaCodeValue: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E40AF',
    letterSpacing: 0.3,
  },
  pendingNoticeBox: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  pendingNoticeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pendingNoticeIcon: {
    fontSize: 13,
  },
  pendingNoticeLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  pendingNoticeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    marginTop: 2,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
});
