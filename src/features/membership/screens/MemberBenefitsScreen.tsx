import React, { useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BecomeMemberHeader } from '../components/BecomeMemberHeader';
import { MembershipValidityCard } from '../components/MembershipValidityCard';
import {
  useMembershipDetailsData,
  MembershipDetailsData,
} from '../hooks/useMembershipDetailsData';
import {
  navigateToProfile,
  navigateToRenewMembership,
} from '../../../core/navigation/appRouter';
import {
  Calendar,
  FileText,
  Heart,
  House,
  User,
  CheckCircle2,
} from '../../../core/components/icons';
import { BorderRadius, Spacing } from '../../../core';

export interface BenefitDetail {
  id: string;
  title: string;
  description: string;
  fullDetails: string;
  actionLabel?: string;
  iconType: 'events' | 'learning' | 'network' | 'volunteer' | 'updates' | 'discounts';
}

interface MemberBenefitsScreenProps {
  onBack?: () => void;
  onNavigateTab?: (tabKey: string) => void;
  onRenewPress?: () => void;
  initialData?: Partial<MembershipDetailsData>;
  showBottomNav?: boolean;
}

export const MemberBenefitsScreen: React.FC<MemberBenefitsScreenProps> = ({
  onBack,
  onNavigateTab,
  onRenewPress,
  initialData,
  showBottomNav = true,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const memberData = useMembershipDetailsData(initialData);

  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 440 : width;

  const [selectedBenefit, setSelectedBenefit] = useState<BenefitDetail | null>(null);

  const benefits: BenefitDetail[] = [
    {
      id: 'events',
      title: 'Access to Events',
      description: 'Exclusive invites to workshops, seminars and campaigns.',
      fullDetails:
        'As an active HRSJM member, you receive priority invitations and complimentary access to national conventions, legal awareness workshops, human rights summits, and local outreach campaigns.',
      actionLabel: 'View Events',
      iconType: 'events',
    },
    {
      id: 'learning',
      title: 'Learning Resources',
      description: 'Educational materials, research papers and guides.',
      fullDetails:
        'Access a comprehensive digital library of human rights documentation, legal acts, constitutional rights guides, RTI filing toolkits, and civic awareness handbooks.',
      actionLabel: 'Explore Resources',
      iconType: 'learning',
    },
    {
      id: 'network',
      title: 'Community Network',
      description: 'Connect with like-minded members and experts.',
      fullDetails:
        'Collaborate with social advocates, legal experts, community leaders, and volunteer coordinators across all state and district committees through the verified member directory.',
      actionLabel: 'View Network',
      iconType: 'network',
    },
    {
      id: 'volunteer',
      title: 'Volunteer Opportunities',
      description: 'Be part of on-ground initiatives and social programs.',
      fullDetails:
        'Lead or participate in grassroots legal aid camps, disaster relief drives, child protection initiatives, and community assistance programs organized by HRSJM.',
      actionLabel: 'Join Initiatives',
      iconType: 'volunteer',
    },
    {
      id: 'updates',
      title: 'Special Updates',
      description: 'Get the latest news, policy updates and success stories.',
      fullDetails:
        'Receive official newsletters, rapid legal advisory alerts, policy reform briefings, and monthly progress reports directly on your member dashboard.',
      actionLabel: 'Read Updates',
      iconType: 'updates',
    },
    {
      id: 'discounts',
      title: 'Member Discounts',
      description: 'Priority access and discounts on select events and programs.',
      fullDetails:
        'Enjoy subsidized registration for certified human rights advocacy courses, legal conferences, official merchandise, publications, and delegate passes.',
      actionLabel: 'Explore Offers',
      iconType: 'discounts',
    },
  ];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).window?.history?.length > 1) {
      (globalThis as any).window.history.back();
    } else {
      navigateToProfile();
    }
  };

  const handleRenew = () => {
    if (onRenewPress) {
      onRenewPress();
    } else {
      navigateToRenewMembership();
    }
  };

  const handleBenefitAction = (benefit: BenefitDetail) => {
    setSelectedBenefit(null);
    if (onNavigateTab) {
      if (benefit.id === 'events') onNavigateTab('events');
      else if (benefit.id === 'learning') onNavigateTab('rights');
      else onNavigateTab('home');
    }
  };

  const renderBenefitIcon = (type: BenefitDetail['iconType']) => {
    switch (type) {
      case 'events':
        return (
          <View style={styles.groupIcon}>
            <View style={styles.groupSideLeft}>
              <View style={styles.groupSideHead} />
              <View style={styles.groupSideBody} />
            </View>
            <View style={styles.groupCenter}>
              <View style={styles.groupCenterHead} />
              <View style={styles.groupCenterBody} />
            </View>
            <View style={styles.groupSideRight}>
              <View style={styles.groupSideHead} />
              <View style={styles.groupSideBody} />
            </View>
          </View>
        );
      case 'learning':
        return (
          <View style={styles.flagIcon}>
            <View style={styles.flagPole} />
            <View style={styles.flagBanner} />
          </View>
        );
      case 'network':
        return (
          <View style={styles.networkIcon}>
            <View style={styles.networkNodeTop} />
            <View style={styles.networkNodeLeft} />
            <View style={styles.networkNodeRight} />
            <View style={styles.networkNodeBottom} />
            <View style={styles.networkLineV} />
            <View style={styles.networkLineH} />
          </View>
        );
      case 'volunteer':
        return (
          <View style={styles.flagIcon}>
            <View style={styles.flagPole} />
            <View style={styles.flagBanner} />
          </View>
        );
      case 'updates':
        return (
          <View style={styles.checkIconBox}>
            <View style={styles.checkSquareOuter} />
            <View style={styles.checkStemShort} />
            <View style={styles.checkStemLong} />
          </View>
        );
      case 'discounts':
        return (
          <View style={styles.discountIcon}>
            <View style={styles.discountBadge} />
            <View style={styles.discountDotTop} />
            <View style={styles.discountLine} />
            <View style={styles.discountDotBottom} />
          </View>
        );
    }
  };

  const navItems = [
    { key: 'home', label: 'Home', icon: House },
    { key: 'causes', label: 'Causes', icon: Heart },
    { key: 'events', label: 'Events', icon: Calendar },
    { key: 'receipts', label: 'Receipts', icon: FileText },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  const handleTabPress = (key: string) => {
    if (onNavigateTab) {
      onNavigateTab(key);
    } else {
      navigateToProfile();
    }
  };

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
          },
        ]}
      >
        {/* 1. Header with back button & brand logo */}
        <BecomeMemberHeader
          paddingTop={insets.top}
          onBack={handleBack}
        />

        {/* 2. Scrollable Body */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + (showBottomNav ? 75 : 24) },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Status Row Bar */}
          <View style={styles.statusRowContainer}>
            <View style={styles.statusLeftGroup}>
              <CheckCircle2 size={22} color="#0B2F52" />
              <Text style={styles.statusLabelText}>Status</Text>
            </View>
            <View
              style={[
                styles.statusPill,
                memberData.status === 'Active'
                  ? styles.statusPillActive
                  : styles.statusPillReview,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  memberData.status === 'Active'
                    ? styles.statusPillTextActive
                    : styles.statusPillTextReview,
                ]}
              >
                {memberData.status || 'Active'}
              </Text>
            </View>
          </View>

          {/* Page Heading */}
          <View style={styles.headingSection}>
            <Text style={styles.pageTitle}>Membership Benefits</Text>
          </View>

          {/* 2-Column Benefits Grid */}
          <View style={styles.gridContainer}>
            {benefits.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.benefitCard}
                activeOpacity={0.75}
                onPress={() => setSelectedBenefit(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}: ${item.description}`}
              >
                {/* Warm Gold Circle with Icon */}
                <View style={styles.iconCircle}>
                  {renderBenefitIcon(item.iconType)}
                </View>

                {/* Card Title */}
                <Text style={styles.benefitTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                {/* Card Description */}
                <Text style={styles.benefitDescription} numberOfLines={3}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Membership Validity Card */}
          <View style={styles.validityWrapper}>
            <MembershipValidityCard
              validTill={memberData.validTill}
              totalDuration={memberData.totalDuration}
              daysRemaining={memberData.daysRemaining}
              status={memberData.status}
            />
          </View>
        </ScrollView>

        {/* 3. Bottom Navigation */}
        {showBottomNav && (
          <View
            style={[
              styles.bottomNavContainer,
              { paddingBottom: Math.max(insets.bottom, 6) },
            ]}
          >
            {navItems.map((tab) => {
              const IconComp = tab.icon;
              const isSelected = tab.key === 'profile';
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.navItem}
                  onPress={() => handleTabPress(tab.key)}
                  activeOpacity={0.7}
                >
                  <IconComp
                    size={22}
                    color={isSelected ? '#E9B82E' : '#718096'}
                  />
                  <Text
                    style={[
                      styles.navLabel,
                      isSelected && styles.navLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* 4. Benefit Details Modal */}
      {selectedBenefit && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedBenefit(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconCircle}>
                {renderBenefitIcon(selectedBenefit.iconType)}
              </View>
              <Text style={styles.modalTitle}>{selectedBenefit.title}</Text>
              <Text style={styles.modalDescription}>
                {selectedBenefit.fullDetails}
              </Text>

              <View style={styles.modalActions}>
                {selectedBenefit.actionLabel && (
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={() => handleBenefitAction(selectedBenefit)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalPrimaryBtnText}>
                      {selectedBenefit.actionLabel}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedBenefit(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FAF7F0', // color-ivory-50 as per design.md
  },
  mainShell: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FAF7F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* Status Bar */
  statusRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8,
  },
  statusLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2F52', // color-text-primary
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  statusPillActive: {
    backgroundColor: '#DCFCE7', // Light green
  },
  statusPillReview: {
    backgroundColor: '#FEF3C7',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusPillTextActive: {
    color: '#16A34A', // Green active text
  },
  statusPillTextReview: {
    color: '#D97706',
  },

  /* Heading */
  headingSection: {
    marginVertical: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B2F52',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },

  /* 2-Column Benefits Grid */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginBottom: 20,
  },
  benefitCard: {
    width: '48.2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    minHeight: 142,
    shadowColor: '#06294D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF2DC', // Warm gold tone from design.md
    borderWidth: 1,
    borderColor: '#FDE4B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B2F52',
    marginBottom: 4,
    lineHeight: 17,
  },
  benefitDescription: {
    fontSize: 10.5,
    lineHeight: 14.5,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Validity Card Wrapper */
  validityWrapper: {
    marginTop: 4,
  },

  /* Bottom Navigation */
  bottomNavContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#718096',
    marginTop: 3,
  },
  navLabelActive: {
    color: '#E9B82E', // Gold accent
    fontWeight: '700',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 27, 49, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF2DC',
    borderWidth: 1,
    borderColor: '#FDE4B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B2F52',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#34516D',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    width: '100%',
    gap: 8,
  },
  modalPrimaryBtn: {
    backgroundColor: '#FAD465', // Main gold accent
    borderRadius: BorderRadius.full,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#06294D',
  },
  modalCloseBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
  },

  /* Vector Icons */
  groupIcon: {
    width: 24,
    height: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative',
  },
  groupCenter: {
    alignItems: 'center',
    zIndex: 2,
  },
  groupCenterHead: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.4,
    borderColor: '#0B2F52',
  },
  groupCenterBody: {
    width: 11,
    height: 6,
    borderTopLeftRadius: 5.5,
    borderTopRightRadius: 5.5,
    borderWidth: 1.4,
    borderBottomWidth: 0,
    borderColor: '#0B2F52',
    marginTop: 1,
    backgroundColor: '#FFF2DC',
  },
  groupSideLeft: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    bottom: 1,
    zIndex: 1,
  },
  groupSideRight: {
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    bottom: 1,
    zIndex: 1,
  },
  groupSideHead: {
    width: 5.5,
    height: 5.5,
    borderRadius: 2.75,
    borderWidth: 1.2,
    borderColor: '#0B2F52',
  },
  groupSideBody: {
    width: 8.5,
    height: 4.5,
    borderTopLeftRadius: 4.25,
    borderTopRightRadius: 4.25,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: '#0B2F52',
    marginTop: 0.8,
    backgroundColor: '#FFF2DC',
  },

  flagIcon: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  flagPole: {
    width: 2,
    height: 16,
    backgroundColor: '#0B2F52',
    borderRadius: 1,
    position: 'absolute',
    left: 2,
    top: 1,
  },
  flagBanner: {
    width: 12,
    height: 9,
    borderWidth: 1.5,
    borderColor: '#0B2F52',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    position: 'absolute',
    left: 4,
    top: 2,
    backgroundColor: '#FFF2DC',
  },

  networkIcon: {
    width: 20,
    height: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkNodeTop: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.3,
    borderColor: '#0B2F52',
    position: 'absolute',
    top: 1,
  },
  networkNodeBottom: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.3,
    borderColor: '#0B2F52',
    position: 'absolute',
    bottom: 1,
  },
  networkNodeLeft: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.3,
    borderColor: '#0B2F52',
    position: 'absolute',
    left: 1,
  },
  networkNodeRight: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.3,
    borderColor: '#0B2F52',
    position: 'absolute',
    right: 1,
  },
  networkLineV: {
    width: 1.3,
    height: 12,
    backgroundColor: '#0B2F52',
    position: 'absolute',
  },
  networkLineH: {
    width: 12,
    height: 1.3,
    backgroundColor: '#0B2F52',
    position: 'absolute',
  },

  checkIconBox: {
    width: 18,
    height: 18,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSquareOuter: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#0B2F52',
  },
  checkStemShort: {
    width: 4,
    height: 1.5,
    backgroundColor: '#0B2F52',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    left: 5,
    top: 9,
  },
  checkStemLong: {
    width: 8,
    height: 1.5,
    backgroundColor: '#0B2F52',
    transform: [{ rotate: '-45deg' }],
    position: 'absolute',
    left: 7,
    top: 7.5,
  },

  discountIcon: {
    width: 18,
    height: 18,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.4,
    borderColor: '#0B2F52',
  },
  discountLine: {
    width: 10,
    height: 1.4,
    backgroundColor: '#0B2F52',
    transform: [{ rotate: '-45deg' }],
    position: 'absolute',
  },
  discountDotTop: {
    width: 2.4,
    height: 2.4,
    borderRadius: 1.2,
    backgroundColor: '#0B2F52',
    position: 'absolute',
    top: 5,
    left: 5.5,
  },
  discountDotBottom: {
    width: 2.4,
    height: 2.4,
    borderRadius: 1.2,
    backgroundColor: '#0B2F52',
    position: 'absolute',
    bottom: 5,
    right: 5.5,
  },
});
