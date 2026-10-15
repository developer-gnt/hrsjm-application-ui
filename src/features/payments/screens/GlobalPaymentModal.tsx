import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
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
} from '../types/payment.types';
import { globalPaymentService } from '../services/payment.service';
import { useAuthStore } from '../../auth/store/authStore';
import { causesService } from '../../member/services/causes.service';
import {
  UpiBrandLogo,
  BhimFlagLogo,
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

type PaymentStage = 'amount_selection' | 'checkout' | 'processing' | 'success' | 'failed';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export const GlobalPaymentModal: React.FC<GlobalPaymentModalProps> = ({
  visible,
  payload,
  onClose,
  onSuccess,
  onNavigateHome,
  onViewHistory,
  initialStage,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(state => state.user);

  // Default dynamic UPI ID from authenticated user
  const initialUpiId = user?.mobile_number
    ? `${user.mobile_number}@upi`
    : user?.email
    ? `${user.email.split('@')[0]}@upi`
    : 'user@upi';

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
  const [upiId, setUpiId] = useState<string>(initialUpiId);

  // Card details
  const [cardNumber, setCardNumber] = useState<string>('1234 5678 9012 3456');
  const [cardExpiry, setCardExpiry] = useState<string>('MM / YY');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>(user?.full_name || '');
  const [showCvv, setShowCvv] = useState<boolean>(false);

  // Net banking & Wallets
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState<string>('Paytm Wallet');
  const [simulationMode, setSimulationMode] = useState<'success' | 'failure'>('success');

  // Processing timeline step (0 to 5)
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [receiptResult, setReceiptResult] = useState<PaymentReceiptDetails | null>(null);
  const [failureError, setFailureError] = useState<{
    code: string;
    message: string;
    reason?: string;
  } | null>(null);

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

      const dynamicUpi = user?.mobile_number
        ? `${user.mobile_number}@upi`
        : user?.email
        ? `${user.email.split('@')[0]}@upi`
        : 'user@upi';
      setUpiId(dynamicUpi);
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
    if (activeAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setStage('processing');
    setProcessingStep(1);

    // Simulated multi-step realistic gateway transitions
    setTimeout(() => setProcessingStep(2), 800);
    setTimeout(() => setProcessingStep(3), 1600);
    setTimeout(() => setProcessingStep(4), 2400);

    setTimeout(async () => {
      try {
        let upiAppLabel = 'Google Pay';
        if (selectedUpiApp === 'phonepe') upiAppLabel = 'PhonePe';
        else if (selectedUpiApp === 'paytm') upiAppLabel = 'Paytm';
        else if (selectedUpiApp === 'bhim') upiAppLabel = 'BHIM UPI';

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
            upiId,
            selectedUpiApp: upiAppLabel,
            cardNumber,
            cardHolderName: cardHolder,
            bankName: selectedBank,
            walletName: selectedWallet,
            simulationMode,
          },
        );

        // Record donation in causesService so all cause statistics reflect immediately
        if (payload.purpose === 'donation') {
          causesService.recordDonation(payload.entityId || payload.title, activeAmount, result.paymentId);
        }

        setReceiptResult(result);
        setStage('success');
        onSuccess?.(result);
      } catch (error: any) {
        setFailureError({
          code: 'PAYMENT_DECLINED',
          message: error?.message || 'Payment was declined by the simulated bank server / issuer.',
          reason: simulationMode === 'failure'
            ? 'Simulated bank decline triggered via Sandbox controls.'
            : 'Payment network declined transaction authorization.',
        });
        setStage('failed');
      }
    }, 2800);
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
          <View style={{ flex: 1 }}>
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 90 },
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

        {/* Professional Sandbox Simulator Card */}
        <View style={styles.sandboxCard}>
          <View style={styles.sandboxHeaderRow}>
            <View style={styles.sandboxBadge}>
              <View style={styles.sandboxActiveDot} />
              <Text style={styles.sandboxBadgeText}>TEST ENVIRONMENT</Text>
            </View>
            <Text style={styles.sandboxGatewaySub}>HRSJM Gateway Simulator</Text>
          </View>

          <View style={styles.sandboxControlSection}>
            <Text style={styles.sandboxSectionTitle}>Simulated Bank Response</Text>
            <View style={styles.sandboxSegmentContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentOptionBtn,
                  simulationMode === 'success' && styles.segmentOptionSuccess,
                ]}
                onPress={() => setSimulationMode('success')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentOptionText,
                    simulationMode === 'success' && styles.segmentOptionTextActive,
                  ]}
                >
                  ✓ Approve (HTTP 200)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentOptionBtn,
                  simulationMode === 'failure' && styles.segmentOptionFail,
                ]}
                onPress={() => setSimulationMode('failure')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentOptionText,
                    simulationMode === 'failure' && styles.segmentOptionTextActive,
                  ]}
                >
                  ✕ Decline (HTTP 402)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sandboxQuickFillRow}>
            <Text style={styles.sandboxQuickFillLabel}>Quick Test:</Text>
            <TouchableOpacity
              style={styles.sandboxChip}
              onPress={() => {
                setPaymentMethod('upi');
                setSelectedUpiApp('bhim');
                setUpiId('success@upi');
                setSimulationMode('success');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.sandboxChipText}>⚡ BHIM (success@upi)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sandboxChip}
              onPress={() => {
                setPaymentMethod('card');
                setCardNumber('4111 2222 3333 4444');
                setCardExpiry('12/28');
                setCardCvv('123');
                setSimulationMode('success');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.sandboxChipText}>💳 Visa 4111</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Select Payment Method (Screenshot 2) */}
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
                <Text style={styles.inputFieldLabel}>Or enter UPI ID / VPA</Text>
                <View style={styles.upiInputWrapper}>
                  <TextInput
                    style={styles.upiTextInput}
                    placeholder={user?.mobile_number ? `${user.mobile_number}@upi` : 'user@okhdfcbank'}
                    placeholderTextColor="#94A3B8"
                    value={upiId}
                    onChangeText={setUpiId}
                    autoCapitalize="none"
                  />
                  <View style={styles.verifiedGreenCircle}>
                    <Text style={styles.verifiedGreenCheck}>✓</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ================================================================== */}
          {/* METHOD SUB-FORM: CARD DETAILS */}
          {/* ================================================================== */}
          {paymentMethod === 'card' && (
            <View style={styles.subFormContainer}>
              <Text style={styles.subFormHeading}>Card Details</Text>

              <Text style={styles.inputFieldLabel}>Card Number</Text>
              <View style={styles.cardInputWrapper}>
                <TextInput
                  style={styles.cardTextInput}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                />
                <View style={styles.cardBadgesGroup}>
                  <VisaBadge height={13} />
                  <MastercardBadge size={16} />
                  <RupayBadge height={12} />
                </View>
              </View>

              <View style={styles.cardRowTwoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputFieldLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.twoColTextInput}
                    placeholder="MM / YY"
                    placeholderTextColor="#94A3B8"
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputFieldLabel}>CVV</Text>
                  <View style={styles.cvvInputWrapper}>
                    <TextInput
                      style={styles.cvvTextInput}
                      placeholder="•••"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      secureTextEntry={!showCvv}
                      value={cardCvv}
                      onChangeText={setCardCvv}
                    />
                    <TouchableOpacity onPress={() => setShowCvv(!showCvv)}>
                      <Text style={styles.eyeIconText}>{showCvv ? '👁️' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <Text style={styles.inputFieldLabel}>Card Holder Name</Text>
              <TextInput
                style={styles.cardHolderInput}
                placeholder={user?.full_name || 'Cardholder Name'}
                placeholderTextColor="#94A3B8"
                value={cardHolder}
                onChangeText={setCardHolder}
              />
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

              <Text style={[styles.inputFieldLabel, { marginTop: 12 }]}>Linked Mobile Number</Text>
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
          style={styles.payButton}
          onPress={handleStartPayment}
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
          <View style={{ flex: 1 }}>
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
            <View style={{ flex: 1 }}>
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
            { paddingBottom: Math.max(insets.bottom, 20) + 120 },
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
          <Text style={styles.failedSubheading}>
            {failureError?.message || 'Payment was declined by the simulated bank server / card issuer.'}
          </Text>

          {/* Failed Amount Card */}
          <View style={styles.failedAmountCard}>
            <Text style={styles.failedAmountNumber}>
              ₹{activeAmount.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.failedAmountCaption}>
              No money has been debited from your account.
            </Text>
          </View>

          {/* Transaction Metadata Card */}
          <View style={styles.receiptMetaCard}>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Payment Status</Text>
              <View style={styles.failedBadge}>
                <Text style={styles.failedBadgeText}>Declined</Text>
              </View>
            </View>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Payment Method</Text>
              <Text style={styles.receiptMetaValue}>
                {paymentMethod === 'upi'
                  ? `UPI (${selectedUpiApp.toUpperCase()})`
                  : paymentMethod === 'card'
                  ? 'Debit / Credit Card'
                  : paymentMethod === 'netbanking'
                  ? selectedBank
                  : selectedWallet}
              </Text>
            </View>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Decline Code</Text>
              <Text style={styles.receiptMetaValue}>SIM_GATEWAY_DECLINE_402</Text>
            </View>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaLabel}>Reason</Text>
              <Text style={styles.receiptMetaValue} numberOfLines={2}>
                {failureError?.reason || 'Bank issuer declined test authorization.'}
              </Text>
            </View>
          </View>

          {/* Security Reassurance Card */}
          <View style={styles.secureReassureCard}>
            <Text style={styles.secureReassureIcon}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.secureReassureTitle}>Zero Account Risk</Text>
              <Text style={styles.secureReassureBody}>
                Your money is completely safe. No charges were made to your bank account or card.
              </Text>
            </View>
          </View>

          {/* Simulator Quick Resolution Helper Card */}
          <View style={styles.simulatorHelperCard}>
            <View style={styles.simulatorHelperHeader}>
              <Text style={styles.simulatorHelperTag}>⚡ DEVELOPER SANDBOX HINT</Text>
            </View>
            <Text style={styles.simulatorHelperText}>
              This transaction declined because the simulator was set to <Text style={{ fontWeight: '700', color: '#B91C1C' }}>✕ Decline (HTTP 402)</Text>.
            </Text>
            <TouchableOpacity
              style={styles.simulatorHelperBtn}
              onPress={() => {
                setSimulationMode('success');
                setStage('checkout');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.simulatorHelperBtnText}>Switch to "Approve (200)" & Retry →</Text>
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
            style={styles.primaryRetryBtn}
            onPress={() => setStage('checkout')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryRetryBtnText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewHistoryLinkBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.viewHistoryLinkText}>Cancel & Exit</Text>
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
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 18,
  },
  headerHindiSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 9.5,
    color: '#C9A227',
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  headlineSection: {
    marginBottom: 14,
  },
  headlineTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
  },
  headlineSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },

  /* Item Card */
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 12,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  itemInfoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  categoryIconText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  locationIconText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  beneficiaryNotice: {
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#64748B',
  },
  amountLargeValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
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
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  presetChipText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
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
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  customAmountBoxActive: {
    borderColor: '#1B3F8F',
    backgroundColor: '#FFFFFF',
  },
  rupeePrefix: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2860',
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#0F172A',
    padding: 0,
  },
  activeAmountIndicator: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeAmountIndicatorText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: '#1B3F8F',
    fontWeight: '800',
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
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  summaryValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
  },
  totalValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
  },

  /* Professional Sandbox Simulator Card */
  sandboxCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 18,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sandboxHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sandboxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  sandboxActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  sandboxBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.4,
  },
  sandboxGatewaySub: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#64748B',
  },
  sandboxControlSection: {
    marginBottom: 10,
  },
  sandboxSectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#475569',
    marginBottom: 6,
  },
  sandboxSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 9,
    padding: 3,
    gap: 4,
  },
  segmentOptionBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentOptionSuccess: {
    backgroundColor: '#16A34A',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentOptionFail: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  segmentOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  sandboxQuickFillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sandboxQuickFillLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#64748B',
  },
  sandboxChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },
  sandboxChipText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#0F2860',
    fontWeight: '600',
  },

  /* Choose Payment Method */
  methodsSection: {
    marginBottom: 20,
  },
  chooseMethodHeading: {
    fontFamily: 'Poppins-Bold',
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2454',
    marginBottom: 14,
  },
  methodOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 10,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  methodOptionCardActive: {
    borderColor: '#EAA43A',
    borderWidth: 1.5,
    backgroundColor: '#FFFDF9',
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
    fontFamily: 'Poppins-Bold',
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F2454',
  },
  methodSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },

  /* Method Sub Form */
  subFormContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginTop: 4,
    marginBottom: 14,
  },
  subFormHeading: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2454',
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
    marginTop: 4,
  },
  upiInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  upiTextInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  verifiedGreenCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedGreenCheck: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
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
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
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
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
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
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  bankPillText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#334155',
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
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  payButton: {
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
  payButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
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
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
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
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2860',
    textAlign: 'center',
    marginBottom: 4,
  },
  successSubheading: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  successCauseTitle: {
    fontFamily: 'Inter-Bold',
    color: '#10B981',
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
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    fontWeight: '800',
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
  },
  receiptMetaValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
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
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  successItemMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748B',
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
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionPillIcon: {
    fontSize: 14,
  },
  actionPillLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  primaryBackHomeBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  primaryBackHomeBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewHistoryLinkBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  viewHistoryLinkText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#1B3F8F',
    fontWeight: '700',
  },

  /* Payment Failed Stage */
  failedAuraBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  failedCircleOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#FEF2F2',
  },
  failedCircleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  failedCrossIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  failedHeading: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2454',
    textAlign: 'center',
    marginBottom: 6,
  },
  failedSubheading: {
    fontFamily: 'Inter-Regular',
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  failedAmountCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  failedAmountNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 26,
    fontWeight: '900',
    color: '#B91C1C',
  },
  failedAmountCaption: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#991B1B',
    marginTop: 4,
  },
  failedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  failedBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '700',
  },
  secureReassureCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 12,
    marginBottom: 14,
    gap: 10,
    alignItems: 'center',
  },
  secureReassureIcon: {
    fontSize: 22,
  },
  secureReassureTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  secureReassureBody: {
    fontFamily: 'Inter-Regular',
    fontSize: 11.5,
    color: '#15803D',
    lineHeight: 16,
  },
  simulatorHelperCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 14,
    marginBottom: 16,
  },
  simulatorHelperHeader: {
    marginBottom: 6,
  },
  simulatorHelperTag: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  simulatorHelperText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 17,
    marginBottom: 10,
  },
  simulatorHelperBtn: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  simulatorHelperBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  primaryRetryBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#1B3F8F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  primaryRetryBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
