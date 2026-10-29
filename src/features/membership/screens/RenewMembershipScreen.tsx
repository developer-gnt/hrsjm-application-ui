import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RenewMembershipHeader } from '../components/RenewMembershipHeader';
import { MembershipExpiryAlert } from '../components/MembershipExpiryAlert';
import { CurrentMembershipCard } from '../components/CurrentMembershipCard';
import { RenewalPlanSection } from '../components/RenewalPlanSection';
import { ThreeYearRenewalInfoCard } from '../components/ThreeYearRenewalInfoCard';
import { MembershipRenewalEligibilitySection } from '../components/MembershipRenewalEligibilitySection';
import { FreeRenewalPolicyCard } from '../components/FreeRenewalPolicyCard';
import { RenewContactBar } from '../components/RenewContactBar';
import { RenewNowButton } from '../components/RenewNowButton';
import { MembershipArrearsCard } from '../components/MembershipArrearsCard';
import { getDynamicRenewalPlan, RenewalPlanOption } from '../data/renewalPlansData';
import { GlobalPaymentModal, PaymentPayload } from '../../payments';
import { RenewalQuotePayload } from '../../payments/types/payment.types';
import { apiClient } from '../../../core/api/client';
import { ApiRoutes } from '../../../core/constants/api-routes';
import { useMembershipDetailsData } from '../hooks/useMembershipDetailsData';
import { calculateRenewalQuoteClientSide } from '../utils/renewalCalculation';
import {
  navigateToProfile,
} from '../../../core/navigation/appRouter';
import { BorderRadius, Spacing, FontFamilies } from '../../../core';
import { useAuthStore } from '../../auth/store/authStore';

interface RenewMembershipScreenProps {
  onBack?: () => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onPlanSelect?: (plan: RenewalPlanOption) => void;
  onRenewPress?: (selectedPlanId: string) => void;
  onWebsitePress?: () => void;
  onWhatsAppPress?: () => void;
  postName?: string;
  validTill?: string;
  daysRemaining?: string;
}

export const RenewMembershipScreen: React.FC<RenewMembershipScreenProps> = ({
  onBack,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
  onPlanSelect,
  onRenewPress,
  onWebsitePress,
  onWhatsAppPress,
  postName: propPostName,
  validTill: propValidTill,
  daysRemaining: propDaysRemaining,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const authUser = useAuthStore(state => state.user);
  const memberData = useMembershipDetailsData();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1-year');
  const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [paymentPayload, setPaymentPayload] = useState<PaymentPayload | null>(null);

  // Authoritative Renewal Quotation State
  const [quote, setQuote] = useState<RenewalQuotePayload | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 460 : width;

  const fetchQuote = async () => {
    try {
      setIsLoadingQuote(true);
      setQuoteError(null);
      const res = await apiClient.get<any>(ApiRoutes.RENEWALS.QUOTE);
      const data = (res as any)?.data !== undefined ? (res as any).data : res;
      if (data && typeof data === 'object' && ('total_payable' in data || 'periods' in data)) {
        setQuote(data);
        return;
      }
      throw new Error('Invalid quotation data');
    } catch (err: any) {
      // Graceful fallback: calculate quote locally from member details
      // Never block the user with an "Internal server error" banner
      const expiryCandidate =
        memberData?.validTill && memberData.validTill !== 'Pending Approval'
          ? memberData.validTill
          : null;

      const fallbackQuote = calculateRenewalQuoteClientSide({
        currentExpiry: expiryCandidate,
        registrationDate: memberData?.joinDate || null,
        membershipId: memberData?.memberId || 'current_membership',
        membershipNumber: memberData?.memberId || null,
        status: memberData?.status || 'Active',
      });

      setQuote(fallbackQuote);
      setQuoteError(null);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, [memberData?.validTill, memberData?.memberId]);

  const handleMenu = () => {
    if (onMenuPress) {
      onMenuPress();
    }
  };

  const handleNotifications = () => {
    if (onNotificationsPress) {
      onNotificationsPress();
    }
  };

  const handleProfile = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      navigateToProfile();
    }
  };

  const handleSelectPlan = (plan: RenewalPlanOption) => {
    setSelectedPlanId(plan.id);
    if (onPlanSelect) {
      onPlanSelect(plan);
    }
  };

  const handleRenew = () => {
    if (onRenewPress) {
      onRenewPress(selectedPlanId);
      return;
    }

    if (quote?.requires_verification) {
      return;
    }

    const hasArrears = !!quote?.is_overdue && !!quote?.periods && quote.periods.length > 0;
    const nextRenewalSequence = (quote?.paid_periods_count || 0) + 1;
    const applicablePlan = getDynamicRenewalPlan(nextRenewalSequence);

    const finalAmount = hasArrears ? quote.total_payable : applicablePlan.priceAmount;
    const title = hasArrears
      ? `Membership Renewal (${quote.unpaid_periods_count} Years Arrears)`
      : `Membership Renewal (${applicablePlan.label})`;

    setPaymentPayload({
      userId: authUser?.id,
      donorName: authUser?.full_name || 'Member',
      donorMobile: authUser?.mobile_number || '',
      donorEmail: authUser?.email || '',
      purpose: 'membership',
      title,
      category: 'Membership',
      amount: finalAmount,
      entityId: quote?.membership_id || 'membership_renewal',
      renewalQuote: quote || undefined,
    });
    setPaymentModalVisible(true);
  };

  const bottomPadding = Math.max(insets.bottom, 20) + Spacing.lg;
  const hasArrears = !!quote?.is_overdue && !!quote?.periods && quote.periods.length > 0;

  const formattedExpiry = propValidTill || (quote?.current_expiry
    ? new Date(quote.current_expiry).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : (memberData.hasData && memberData.validTill ? memberData.validTill : '15 Oct 2026'));

  const expiryDaysLabel = propDaysRemaining || (quote?.is_overdue
    ? `${quote.days_overdue} days overdue`
    : `${quote?.days_remaining ?? (memberData.hasData && memberData.daysRemaining ? memberData.daysRemaining : 7)} days`);

  const effectivePostName =
    propPostName ||
    (quote?.membership_number
      ? `Member #${quote.membership_number}`
      : memberData.hasData && memberData.membershipType && memberData.membershipType !== 'Individual Member'
      ? memberData.membershipType
      : memberData?.memberId
      ? `Member #${memberData.memberId}`
      : 'District Unit');

  const nextRenewalSequence = (quote?.paid_periods_count || 0) + 1;
  const applicablePlan = getDynamicRenewalPlan(nextRenewalSequence);
  const payableButtonAmount = hasArrears ? quote!.total_payable : applicablePlan.priceAmount;

  return (
    <View style={styles.screenContainer}>
      <View
        style={[
          styles.mainShell,
          isTabletOrDesktop && {
            alignSelf: 'center',
            width: contentMaxWidth,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: '#E2E8F0',
            shadowColor: '#0F2860',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          },
        ]}
      >
        {/* HRSJM Header */}
        <RenewMembershipHeader
          paddingTop={insets.top}
          onMenuPress={handleMenu}
          onNotificationsPress={handleNotifications}
          onProfilePress={handleProfile}
        />

        {/* Scrollable Page Body */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPadding },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Section 02: Page Heading */}
          <View style={styles.pageTitleContainer}>
            <Text style={styles.pageTitleText}>Renew Membership</Text>
          </View>

          {/* Loading Indicator */}
          {isLoadingQuote && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#0F2860" />
              <Text style={styles.loadingText}>Fetching renewal quotation...</Text>
            </View>
          )}

          {/* Error Banner with Retry */}
          {!!quoteError && !isLoadingQuote && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {quoteError}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchQuote} activeOpacity={0.7}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Inconsistent History Verification Alert */}
          {quote?.requires_verification && (
            <View style={styles.verificationAlertBox}>
              <Text style={styles.verificationAlertIcon}>⚠️</Text>
              <View style={styles.verificationAlertCol}>
                <Text style={styles.verificationAlertTitle}>Administrative Verification Required</Text>
                <Text style={styles.verificationAlertDesc}>
                  {quote.verification_reason ||
                    'Membership history is incomplete or requires verification before arrears can be calculated.'}
                </Text>
              </View>
            </View>
          )}

          {/* Section 03: Membership Expiry Alert */}
          <MembershipExpiryAlert
            daysRemaining={quote?.is_overdue ? quote.days_overdue : (quote?.days_remaining ?? (parseInt(String(expiryDaysLabel), 10) || 7))}
            message={quote?.is_overdue ? 'Your membership has expired!' : 'Your membership is expiring soon!'}
            isOverdue={!!quote?.is_overdue}
          />

          {/* Section 04: Current Membership Card */}
          <CurrentMembershipCard
            postName={effectivePostName}
            validTill={formattedExpiry}
            daysRemaining={expiryDaysLabel}
          />

          {/* Section 05: Outstanding Arrears Breakdown (Rendered when arrears exist) */}
          {hasArrears && <MembershipArrearsCard quote={quote!} />}

          {/* Section 06: Renewal Plan Section (Rendered when member has no overdue arrears) */}
          {!hasArrears && (
            <RenewalPlanSection
              plan={applicablePlan}
              sequenceNumber={nextRenewalSequence}
            />
          )}

          {/* Section 07: Three Year Renewal Information */}
          <ThreeYearRenewalInfoCard />

          {/* Section 08: Membership Renewal Eligibility */}
          <MembershipRenewalEligibilitySection />

          {/* Section 09: Note for Free Renewal Policy */}
          <FreeRenewalPolicyCard />

          {/* Section 10: Website + WhatsApp Contact Bar */}
          <RenewContactBar
            websiteUrl="https://hrsjm.org/"
            whatsAppNumber="7021057853"
            onWebsitePress={onWebsitePress}
            onWhatsAppPress={onWhatsAppPress}
          />

          {/* Section 11: Renew Now Button with Dynamic Amount */}
          <RenewNowButton
            onPress={handleRenew}
            amount={payableButtonAmount}
            disabled={isLoadingQuote || quote?.requires_verification}
            label={
              quote?.requires_verification
                ? 'Verification Required'
                : hasArrears
                ? `Pay ₹${payableButtonAmount.toLocaleString('en-IN')} & Clear Arrears →`
                : `Pay ₹${payableButtonAmount.toLocaleString('en-IN')} & Renew →`
            }
          />
        </ScrollView>
      </View>

      <GlobalPaymentModal
        visible={paymentModalVisible}
        payload={paymentPayload}
        initialStage="checkout"
        onClose={() => setPaymentModalVisible(false)}
        onNavigateHome={onBack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  mainShell: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  scrollContent: {
    paddingTop: Spacing.xs,
  },
  pageTitleContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  pageTitleText: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#0B2F52',
    letterSpacing: -0.2,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: Spacing.md,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    color: '#0F2860',
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 12.5,
    color: '#DC2626',
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  verificationAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 10,
  },
  verificationAlertIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  verificationAlertCol: {
    flex: 1,
  },
  verificationAlertTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#C2410C',
    lineHeight: 18,
  },
  verificationAlertDesc: {
    fontSize: 12,
    color: '#9A3412',
    marginTop: 2,
    lineHeight: 16,
  },
});
