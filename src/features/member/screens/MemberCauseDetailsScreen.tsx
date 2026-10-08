import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MemberCause } from '../types/causes.types';
import { MemberDonationModal } from '../components/MemberDonationModal';

interface MemberCauseDetailsScreenProps {
  cause: MemberCause;
  onBack: () => void;
  onDonationSuccess?: () => void;
}

export const MemberCauseDetailsScreen: React.FC<MemberCauseDetailsScreenProps> = ({
  cause,
  onBack,
  onDonationSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const [donationModalVisible, setDonationModalVisible] = useState(false);

  const percentRaised = Math.min(
    100,
    Math.round((cause.raisedAmount / (cause.targetAmount || 1)) * 100),
  );
  const remainingAmount = Math.max(0, cause.targetAmount - cause.raisedAmount);

  const formatRupee = (val: number) => {
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  const isCompleted = cause.status === 'closed' || percentRaised >= 100;

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
      >
        {/* Hero Image Banner */}
        <View style={styles.heroWrapper}>
          <Image
            source={{ uri: cause.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Top Bar Navigation */}
          <View style={[styles.heroTopBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.backCircleBtn}
              onPress={onBack}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <View style={styles.heroActionsRow}>
              <View
                style={[
                  styles.heroStatusBadge,
                  isCompleted ? styles.heroStatusBadgeClosed : styles.heroStatusBadgeActive,
                ]}
              >
                <Text style={styles.heroStatusBadgeText}>
                  {isCompleted ? 'Goal Reached' : 'Active Cause'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cause Main Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryTag}>
              {cause.categoryIcon} {cause.category}
            </Text>
            <Text style={styles.locationTag}>📍 {cause.location}</Text>
          </View>

          <Text style={styles.causeMainTitle}>{cause.title}</Text>

          {/* Verified NGO Shield */}
          <View style={styles.verifiedRow}>
            <Text style={styles.verifiedShield}>🛡️</Text>
            <Text style={styles.verifiedText}>
              HRSJM Verified Social Impact Initiative
            </Text>
          </View>
        </View>

        {/* Fundraising Progress Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Fundraising Progress</Text>

          <View style={styles.fundAmountsRow}>
            <View>
              <Text style={styles.fundRaisedBig}>
                {formatRupee(cause.raisedAmount)}
              </Text>
              <Text style={styles.fundSubtitle}>
                Raised of {formatRupee(cause.targetAmount)}
              </Text>
            </View>

            <View style={styles.percentBadge}>
              <Text style={styles.percentBadgeText}>{percentRaised}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${percentRaised}%` },
                isCompleted && styles.progressFillCompleted,
              ]}
            />
          </View>

          <View style={styles.donorInfoRow}>
            <Text style={styles.donorMetaText}>
              👥 <Text style={styles.donorBold}>{cause.donorCount}</Text> generous donors
            </Text>
            <Text style={styles.donorMetaText}>
              ⏳ <Text style={styles.donorBold}>{cause.daysLeft ?? 30}</Text> days remaining
            </Text>
          </View>
        </View>

        {/* Impact Statistics Grid (2x2) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Impact Statistics</Text>

          <View style={styles.impactGrid}>
            <View style={styles.impactGridItem}>
              <View style={styles.impactIconBubble}>
                <Text style={styles.impactEmoji}>👥</Text>
              </View>
              <Text style={styles.impactValue}>
                {cause.beneficiariesCount.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.impactLabel}>Beneficiaries</Text>
            </View>

            <View style={styles.impactGridItem}>
              <View style={styles.impactIconBubble}>
                <Text style={styles.impactEmoji}>🎯</Text>
              </View>
              <Text style={styles.impactValue}>{cause.targetBeneficiaries}</Text>
              <Text style={styles.impactLabel}>Target Group</Text>
            </View>

            <View style={styles.impactGridItem}>
              <View style={styles.impactIconBubble}>
                <Text style={styles.impactEmoji}>💰</Text>
              </View>
              <Text style={styles.impactValue}>
                {formatRupee(cause.raisedAmount)}
              </Text>
              <Text style={styles.impactLabel}>Amount Raised</Text>
            </View>

            <View style={styles.impactGridItem}>
              <View style={styles.impactIconBubble}>
                <Text style={styles.impactEmoji}>⏳</Text>
              </View>
              <Text style={styles.impactValue}>
                {formatRupee(remainingAmount)}
              </Text>
              <Text style={styles.impactLabel}>Remaining Goal</Text>
            </View>
          </View>
        </View>

        {/* About this Cause Story */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>About this Cause</Text>
          <Text style={styles.storyText}>{cause.aboutStory}</Text>
        </View>

        {/* Trust & Transparency Badge */}
        <View style={styles.trustBanner}>
          <Text style={styles.trustIcon}>🏛️</Text>
          <View style={styles.trustTextCol}>
            <Text style={styles.trustTitle}>100% Direct Impact Transparency</Text>
            <Text style={styles.trustSubtitle}>
              All contributions are monitored under HRSJM social audit protocols and eligible for 80G tax deductions.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Donate CTA Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 14) },
        ]}
      >
        <View style={styles.bottomBarInfo}>
          <Text style={styles.bottomBarRaisedText}>
            {formatRupee(cause.raisedAmount)}
          </Text>
          <Text style={styles.bottomBarGoalText}>
            of {formatRupee(cause.targetAmount)} goal
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.donateCtaBtn, isCompleted && styles.donateCtaBtnCompleted]}
          onPress={() => setDonationModalVisible(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Donate to ${cause.title}`}
        >
          <Text style={styles.donateCtaIcon}>💛</Text>
          <Text style={styles.donateCtaText}>
            {isCompleted ? 'Contribute More' : 'Donate Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Donation Modal Sheet */}
      <MemberDonationModal
        visible={donationModalVisible}
        cause={cause}
        onClose={() => setDonationModalVisible(false)}
        onSuccess={() => onDonationSuccess?.()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroWrapper: {
    width: '100%',
    height: 250,
    position: 'relative',
    backgroundColor: '#0F2860',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: -2,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroStatusBadgeActive: {
    backgroundColor: '#10B981',
  },
  heroStatusBadgeClosed: {
    backgroundColor: '#3B82F6',
  },
  heroStatusBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  categoryTag: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#1B3F8F',
    backgroundColor: '#EEF3FC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  locationTag: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  causeMainTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 25,
    marginBottom: 10,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  verifiedShield: {
    fontSize: 14,
  },
  verifiedText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeading: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  fundAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  fundRaisedBig: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 24,
  },
  fundSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    fontWeight: '800',
    color: '#1B3F8F',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1B3F8F',
    borderRadius: 4,
  },
  progressFillCompleted: {
    backgroundColor: '#10B981',
  },
  donorInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  donorMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  donorBold: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  impactGridItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  impactIconBubble: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  impactEmoji: {
    fontSize: 14,
  },
  impactValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 18,
  },
  impactLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  storyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#334155',
    lineHeight: 21,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: '#FFF8E6',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
  },
  trustIcon: {
    fontSize: 24,
  },
  trustTextCol: {
    flex: 1,
  },
  trustTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 2,
  },
  trustSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomBarInfo: {
    flex: 1,
    paddingRight: 12,
  },
  bottomBarRaisedText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 21,
  },
  bottomBarGoalText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  donateCtaBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1B3F8F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1B3F8F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  donateCtaBtnCompleted: {
    backgroundColor: '#0F2860',
  },
  donateCtaIcon: {
    fontSize: 14,
  },
  donateCtaText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
