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
import { RenewalPlanOption } from '../data/renewalPlansData';
import {
  navigateToMembershipApplications,
  navigateToProfile,
} from '../../../core/navigation/appRouter';
import { BorderRadius, Spacing } from '../../../core';

interface RenewMembershipScreenProps {
  onBack?: () => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onPlanSelect?: (plan: RenewalPlanOption) => void;
  onRenewPress?: (selectedPlanId: string) => void;
  onWebsitePress?: () => void;
  onWhatsAppPress?: () => void;
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
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1-year');

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
    }
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
            daysRemaining={7}
            message="Your membership is expiring soon!"
          />

          {/* Section 04: Current Membership Card */}
          <CurrentMembershipCard
            postName="District Unit"
            validTill="15 Oct 2026"
            daysRemaining="7 days"
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
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  mainShell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: -0.2,
  },
});
