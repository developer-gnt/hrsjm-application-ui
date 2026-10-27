import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
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
import { RenewalPlanOption, RENEWAL_PLANS } from '../data/renewalPlansData';
import { GlobalPaymentModal, PaymentPayload } from '../../payments';
import {
  navigateToMembershipApplications,
  navigateToProfile,
} from '../../../core/navigation/appRouter';
import { BorderRadius, Spacing, FontFamilies } from '../../../core';
import { useMembershipDetailsData } from '../hooks/useMembershipDetailsData';

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
  const memberData = useMembershipDetailsData();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1-year');
  const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [paymentPayload, setPaymentPayload] = useState<PaymentPayload | null>(null);

  const effectivePostName =
    propPostName ||
    (memberData.hasData && memberData.membershipType && memberData.membershipType !== 'Individual Member'
      ? memberData.membershipType
      : 'District Unit');
  const effectiveValidTill = propValidTill || (memberData.hasData && memberData.validTill ? memberData.validTill : '15 Oct 2026');
  const effectiveDaysRemaining = propDaysRemaining || (memberData.hasData && memberData.daysRemaining ? memberData.daysRemaining : '7 days');
  const alertDaysNumber = parseInt(String(effectiveDaysRemaining), 10) || 7;

  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 460 : width;

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
    const plan = RENEWAL_PLANS.find(p => p.id === selectedPlanId) || RENEWAL_PLANS[0];
    setPaymentPayload({
      purpose: 'membership',
      title: `Membership Renewal (${plan.duration})`,
      category: 'Membership',
      amount: plan.priceAmount,
      entityId: 'membership_renewal',
    });
    setPaymentModalVisible(true);
  };

  const bottomPadding = Math.max(insets.bottom, 20) + Spacing.lg;

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

          {/* Section 03: Membership Expiry Alert */}
          <MembershipExpiryAlert
            daysRemaining={alertDaysNumber}
            message="Your membership is expiring soon!"
          />

          {/* Section 04: Current Membership Card */}
          <CurrentMembershipCard
            postName={effectivePostName}
            validTill={effectiveValidTill}
            daysRemaining={effectiveDaysRemaining}
          />

          {/* Section 05: Renewal Plan Section */}
          <RenewalPlanSection
            selectedPlanId={selectedPlanId}
            onSelectPlan={handleSelectPlan}
          />

          {/* Section 06: Three Year Renewal Information */}
          <ThreeYearRenewalInfoCard />

          {/* Section 07: Membership Renewal Eligibility */}
          <MembershipRenewalEligibilitySection />

          {/* Section 08: Note for Free Renewal Policy */}
          <FreeRenewalPolicyCard />

          {/* Section 09: Website + WhatsApp Contact Bar */}
          <RenewContactBar
            websiteUrl="https://hrsjm.org/"
            whatsAppNumber="7021057853"
            onWebsitePress={onWebsitePress}
            onWhatsAppPress={onWhatsAppPress}
          />

          {/* Section 10: Renew Now Button */}
          <RenewNowButton onPress={handleRenew} />
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
});
