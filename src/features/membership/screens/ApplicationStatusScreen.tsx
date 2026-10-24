import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useMembership } from '../context/MembershipContext';
import { ApplicationStatusStepper } from '../components/stepper';
import { GlobalPaymentModal, PaymentPayload } from '../../payments';
import { useAuthStore } from '../../auth/store/authStore';
import { FontFamilies } from '../../../core/theme';

export type ApplicationInnerStatus =
  | 'applied'
  | 'under_review'
  | 'approved'
  | 'rejected';

export interface ApplicationStatusScreenProps {
  initialStatus?: ApplicationInnerStatus;
  applicationId?: string;
}

interface StatusConfigItem {
  key: ApplicationInnerStatus;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerBg: string;
  bannerBorder: string;
  titleColor: string;
  iconBg: string;
  iconBorder?: string;
  iconType: 'check' | 'clock' | 'cross';
  timelineSteps: Array<{
    title: string;
    timeKey: 'applied' | 'underReview' | 'approved' | 'rejected';
    defaultTime: string;
  }>;
  timelineColor: 'green' | 'red';
  showApprovedRow?: boolean;
  showRejectedRow?: boolean;
  showReasonAlert?: boolean;
}

const STATUS_CONFIGS: Record<ApplicationInnerStatus, StatusConfigItem> = {
  applied: {
    key: 'applied',
    bannerTitle: 'Applied Successfully',
    bannerSubtitle: 'Your application has been submitted successfully.',
    bannerBg: '#ECFDF5',
    bannerBorder: '#A7F3D0',
    titleColor: '#059669',
    iconBg: '#10B981',
    iconType: 'check',
    timelineSteps: [
      {
        title: 'Applied Successfully',
        timeKey: 'applied',
        defaultTime: '12 Oct 2026, 10:30 AM',
      },
    ],
    timelineColor: 'green',
    showApprovedRow: false,
    showRejectedRow: false,
    showReasonAlert: false,
  },
  under_review: {
    key: 'under_review',
    bannerTitle: 'Under Review',
    bannerSubtitle: 'Your application is currently under review.',
    bannerBg: '#FFFBEB',
    bannerBorder: '#FDE68A',
    titleColor: '#0F172A',
    iconBg: '#FEF3C7',
    iconBorder: '#FCD34D',
    iconType: 'clock',
    timelineSteps: [
      {
        title: 'Applied Successfully',
        timeKey: 'applied',
        defaultTime: '12 Oct 2026, 10:30 AM',
      },
      {
        title: 'Under Review',
        timeKey: 'underReview',
        defaultTime: 'Recently',
      },
    ],
    timelineColor: 'green',
    showApprovedRow: false,
    showRejectedRow: false,
    showReasonAlert: false,
  },
  approved: {
    key: 'approved',
    bannerTitle: 'Approved',
    bannerSubtitle:
      'Your application has been approved.\nYou can now access all member benefits.',
    bannerBg: '#ECFDF5',
    bannerBorder: '#A7F3D0',
    titleColor: '#059669',
    iconBg: '#10B981',
    iconType: 'check',
    timelineSteps: [
      {
        title: 'Applied Successfully',
        timeKey: 'applied',
        defaultTime: '12 Oct 2026, 10:30 AM',
      },
      {
        title: 'Under Review',
        timeKey: 'underReview',
        defaultTime: 'Recently',
      },
      {
        title: 'Approved',
        timeKey: 'approved',
        defaultTime: '15 Oct 2026, 04:20 PM',
      },
    ],
    timelineColor: 'green',
    showApprovedRow: true,
    showRejectedRow: false,
    showReasonAlert: false,
  },
  rejected: {
    key: 'rejected',
    bannerTitle: 'Rejected',
    bannerSubtitle: 'Your application has been rejected.',
    bannerBg: '#FEF2F2',
    bannerBorder: '#FECACA',
    titleColor: '#DC2626',
    iconBg: '#EF4444',
    iconType: 'cross',
    timelineSteps: [
      {
        title: 'Applied Successfully',
        timeKey: 'applied',
        defaultTime: '12 Oct 2026, 10:30 AM',
      },
      {
        title: 'Under Review',
        timeKey: 'underReview',
        defaultTime: 'Recently',
      },
    ],
    timelineColor: 'red',
    showApprovedRow: false,
    showRejectedRow: true,
    showReasonAlert: true,
  },
};

const mapAppStatusToInnerStatus = (status?: string): ApplicationInnerStatus => {
  if (!status) return 'applied';
  const s = status.toLowerCase();
  if (s.includes('applied') || s.includes('submit') || s.includes('draft') || s === 'pending') {
    return 'applied';
  }
  if (s.includes('review')) {
    return 'under_review';
  }
  if (s.includes('approve') || s === 'active') {
    return 'approved';
  }
  if (s.includes('reject')) {
    return 'rejected';
  }
  return 'applied';
};

export const ApplicationStatusScreen: React.FC<ApplicationStatusScreenProps> = ({
  initialStatus,
  applicationId,
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { applications, activeApplication, reapply } = useMembership();

  const targetAppId = applicationId || route.params?.applicationId;
  const currentApp =
    applications.find(a => a.applicationId === targetAppId) ||
    activeApplication ||
    applications[0];

  const resolvedInitialStatus: ApplicationInnerStatus =
    initialStatus ||
    (route.params?.status && route.params.status !== 'under_review' ? route.params.status : undefined) ||
    (currentApp ? mapAppStatusToInnerStatus(currentApp.status) : 'applied');

  const [activeStatus, setActiveStatus] =
    useState<ApplicationInnerStatus>(resolvedInitialStatus);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const authUser = useAuthStore(state => state.user);

  useEffect(() => {
    if (currentApp?.status && !initialStatus && !route.params?.status) {
      setActiveStatus(mapAppStatusToInnerStatus(currentApp.status));
    }
  }, [currentApp?.status, initialStatus, route.params?.status]);

  const config = STATUS_CONFIGS[activeStatus] || STATUS_CONFIGS.applied;

  // Dynamic application data with exact reference fallback values
  const isTargetSeeker = Boolean(targetAppId && targetAppId.startsWith('HRSJM-SEK'));
  const appType =
    (isTargetSeeker && (!currentApp || !currentApp.membershipType.toLowerCase().includes('seeker')))
      ? 'Donation Seeker'
      : (currentApp?.membershipType || 'Membership Application');
  const appId = targetAppId || currentApp?.applicationId || 'APP-20261012-001';
  const appliedOn = currentApp?.submittedAt || '12 Oct 2026, 10:30 AM';
  const underReviewOn = currentApp?.underReviewAt || currentApp?.submittedAt || 'Recently';
  const approvedOn = currentApp?.approvedAt || '15 Oct 2026, 04:20 PM';
  const rejectedOn = currentApp?.rejectedAt || '16 Oct 2026, 11:45 AM';
  const rejectionReason =
    currentApp?.rejectionReason || 'Incomplete documents';

  const timestamps = {
    applied: appliedOn,
    underReview: underReviewOn,
    approved: approvedOn,
    rejected: rejectedOn,
  };

  const isDonationSeeker = Boolean(
    isTargetSeeker ||
    appType.toLowerCase().includes('seeker') ||
    appId.startsWith('HRSJM-SEK') ||
    (currentApp?.membershipType && currentApp.membershipType.toLowerCase().includes('seeker'))
  );

  const bannerSubtitle =
    isDonationSeeker && activeStatus === 'approved'
      ? 'Your application has been approved.\nYour donation seeker account is now active.'
      : config.bannerSubtitle;

  const handleBackToStatus = () => {
    const navState = navigation.getState?.();
    const routeNames: string[] = navState?.routeNames || [];
    if (routeNames.includes('MyApplication')) {
      navigation.navigate('MyApplication');
    } else {
      navigation.goBack();
    }
  };

  const handleOpenPaymentModal = () => {
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentDone(true);
    setPaymentModalVisible(false);
  };

  const paymentPayload: PaymentPayload = {
    purpose: 'membership',
    title: `Membership Registration Fee - ${appType}`,
    subtitle: 'Human Rights & Social Justice Mission',
    category: 'Membership Application',
    amount: 800,
    donorName: authUser?.full_name || 'Member Applicant',
    donorMobile: authUser?.mobile_number || '',
    donorEmail: authUser?.email || '',
    entityId: appId || `app-${Date.now()}`,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header matching reference */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToStatus}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back to My Status"
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19l-7-7 7-7"
              stroke="#0F172A"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Application Status</Text>
        <View style={styles.headerRightSpace} />
      </View>

      {/* Top 4-Step Horizontal Stepper with Interactive Step Switching */}
      <View style={styles.topStepperContainer}>
        <ApplicationStatusStepper
          status={activeStatus}
          onStepPress={(_stepNum, stepKey) => setActiveStatus(stepKey as ApplicationInnerStatus)}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrap}>
          {/* 1. Status Banner Card */}
          <View
            style={[
              styles.bannerCard,
              {
                backgroundColor: config.bannerBg,
                borderColor: config.bannerBorder,
              },
            ]}
          >
            <View
              style={[
                styles.bannerIconCircle,
                {
                  backgroundColor: config.iconBg,
                  borderColor: config.iconBorder || 'transparent',
                  borderWidth: config.iconBorder ? 1.5 : 0,
                },
              ]}
            >
              {config.iconType === 'check' && (
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M5 13l4 4L19 7"
                    stroke="#FFFFFF"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
              {config.iconType === 'clock' && (
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="9" stroke="#0F172A" strokeWidth={2.2} />
                  <Path
                    d="M12 7v5l3.2 2"
                    stroke="#0F172A"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
              {config.iconType === 'cross' && (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="#FFFFFF"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </View>

            <View style={styles.bannerTextCol}>
              <Text style={[styles.bannerTitle, { color: config.titleColor }]}>
                {config.bannerTitle}
              </Text>
              <Text style={styles.bannerSubtitle}>{bannerSubtitle}</Text>
            </View>
          </View>

          {/* 2. Application Details Card */}
          <View style={styles.detailsCard}>
            {/* Application Type */}
            <View style={styles.detailRow}>
              <View style={styles.detailLabelGroup}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    stroke="#64748B"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                    stroke="#64748B"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.detailLabel}>Application Type</Text>
              </View>
              <Text style={styles.detailValue}>{appType}</Text>
            </View>

            {/* Application ID */}
            <View style={styles.detailRow}>
              <View style={styles.detailLabelGroup}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    stroke="#64748B"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                    stroke="#64748B"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.detailLabel}>Application ID</Text>
              </View>
              <Text style={styles.detailValue}>{appId}</Text>
            </View>

            {/* Applied on */}
            <View
              style={[
                styles.detailRow,
                !config.showApprovedRow &&
                  !config.showRejectedRow &&
                  styles.detailRowLast,
              ]}
            >
              <View style={styles.detailLabelGroup}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                    stroke="#64748B"
                    strokeWidth={1.8}
                  />
                  <Path
                    d="M16 2v4M8 2v4M3 10h18"
                    stroke="#64748B"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                  />
                </Svg>
                <Text style={styles.detailLabel}>Applied on</Text>
              </View>
              <Text style={styles.detailValue}>{appliedOn}</Text>
            </View>

            {/* Approved on (Approved status only) */}
            {config.showApprovedRow && (
              <View style={[styles.detailRow, styles.detailRowLast]}>
                <View style={styles.detailLabelGroup}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      stroke="#64748B"
                      strokeWidth={1.8}
                    />
                    <Path
                      d="M16 2v4M8 2v4M3 10h18"
                      stroke="#64748B"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                    />
                  </Svg>
                  <Text style={styles.detailLabel}>Approved on</Text>
                </View>
                <Text style={styles.detailValue}>{approvedOn}</Text>
              </View>
            )}

            {/* Rejected on (Rejected status only) */}
            {config.showRejectedRow && (
              <View style={[styles.detailRow, styles.detailRowLast]}>
                <View style={styles.detailLabelGroup}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      stroke="#64748B"
                      strokeWidth={1.8}
                    />
                    <Path
                      d="M16 2v4M8 2v4M3 10h18"
                      stroke="#64748B"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                    />
                  </Svg>
                  <Text style={styles.detailLabel}>Rejected on</Text>
                </View>
                <Text style={styles.detailValue}>{rejectedOn}</Text>
              </View>
            )}

            {/* Rejection Reason Alert Box (Rejected status only) */}
            {config.showReasonAlert && (
              <View style={styles.reasonAlertBox}>
                <View style={styles.reasonIconWrap}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="#EF4444">
                    <Circle cx="12" cy="12" r="10" fill="#EF4444" />
                    <Path
                      d="M12 7v6M12 17h.01"
                      stroke="#FFFFFF"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                    />
                  </Svg>
                </View>
                <View style={styles.reasonTextWrap}>
                  <Text style={styles.reasonHeader}>Reason</Text>
                  <Text style={styles.reasonBody}>{rejectionReason}</Text>
                </View>
              </View>
            )}
          </View>

          {/* 3. Status Timeline Card */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineHeader}>Status Timeline</Text>

            <View style={styles.timelineList}>
              {config.timelineSteps.map((step, idx) => {
                const isLast = idx === config.timelineSteps.length - 1;
                const isRed = config.timelineColor === 'red';
                const circleBg = isRed ? '#EF4444' : '#10B981';
                const lineBg = isRed ? '#EF4444' : '#10B981';
                const timeValue = timestamps[step.timeKey] || step.defaultTime;

                return (
                  <View key={step.title} style={styles.timelineItem}>
                    {/* Left indicator column (Circle + Connecting Line) */}
                    <View style={styles.timelineIndicatorCol}>
                      <View
                        style={[
                          styles.timelineCircle,
                          { backgroundColor: circleBg },
                        ]}
                      >
                        {isRed ? (
                          <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                            <Path
                              d="M6 6l12 12M18 6L6 18"
                              stroke="#FFFFFF"
                              strokeWidth={3.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                        ) : (
                          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                            <Path
                              d="M5 13l4 4L19 7"
                              stroke="#FFFFFF"
                              strokeWidth={3.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                        )}
                      </View>

                      {!isLast && (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: lineBg },
                          ]}
                        />
                      )}
                    </View>

                    {/* Right text column */}
                    <View
                      style={[
                        styles.timelineTextCol,
                        !isLast && { paddingBottom: 22 },
                      ]}
                    >
                      <Text style={styles.timelineStepTitle}>{step.title}</Text>
                      <Text style={styles.timelineStepTime}>{timeValue}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Re-apply for Membership Button (When rejected) */}
          {activeStatus === 'rejected' && (
            <TouchableOpacity
              style={styles.reapplyPrimaryButton}
              onPress={() => {
                reapply();
                navigation.navigate('MembershipCategories');
              }}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Re-apply for Membership"
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M1 4v6h6M23 20v-6h-6"
                  stroke="#FFFFFF"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
                  stroke="#FFFFFF"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.reapplyPrimaryButtonText}>Re-apply for Membership</Text>
            </TouchableOpacity>
          )}

          {/* Membership Fee & Payment Action Card (Members only, never Donation Seekers) */}
          {!isDonationSeeker && activeStatus !== 'rejected' && (
            <View style={styles.feeStatusCard}>
              <View style={styles.feeStatusRow}>
                <View style={styles.feeStatusLeft}>
                  <Text style={styles.feeStatusLabel}>Membership Registration Fee</Text>
                  <Text style={styles.feeStatusSub}>{appType} (1 Year Validity)</Text>
                </View>
                <View style={styles.feeStatusBadge}>
                  <Text style={styles.feeStatusBadgeText}>₹800</Text>
                </View>
              </View>

              <View style={styles.feePaymentDivider} />

              <View style={styles.paymentGatewayRow}>
                <View style={styles.paymentStatusIndicator}>
                  <View style={[styles.statusDot, paymentDone && styles.statusDotGreen]} />
                  <Text style={styles.paymentStatusText}>
                    {paymentDone ? 'Payment Verified (Cashfree PG)' : 'Payment Status: Fee Due / Online'}
                  </Text>
                </View>
              </View>

              {!paymentDone && (
                <TouchableOpacity
                  style={styles.payFeeGatewayButton}
                  onPress={handleOpenPaymentModal}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Pay Membership Fee via Cashfree Gateway"
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Rect x="2" y="5" width="20" height="14" rx="2" stroke="#FFFFFF" strokeWidth={2} />
                    <Path d="M2 10h20" stroke="#FFFFFF" strokeWidth={2} />
                  </Svg>
                  <Text style={styles.payFeeGatewayButtonText}>Pay Membership Fee (₹800)</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* 4. Back to My Status Button */}
          <TouchableOpacity
            style={styles.backToStatusButton}
            onPress={handleBackToStatus}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Back to My Status"
          >
            <Text style={styles.backToStatusButtonText}>Back to My Status</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Cashfree Payment Gateway Modal */}
      <GlobalPaymentModal
        visible={paymentModalVisible}
        payload={paymentPayload}
        initialStage="checkout"
        onClose={() => setPaymentModalVisible(false)}
        onSuccess={handlePaymentSuccess}
        onNavigateHome={() => navigation.navigate('UserHome' as any)}
      />
    </SafeAreaView>
  );
};

// Export individual screen components matching each status exactly
export const ApplicationUnderReviewScreen: React.FC<any> = () => (
  <ApplicationStatusScreen initialStatus="under_review" />
);

export const ApplicationApprovedStatusScreen: React.FC<any> = () => (
  <ApplicationStatusScreen initialStatus="approved" />
);

export const ApplicationRejectedStatusScreen: React.FC<any> = () => (
  <ApplicationStatusScreen initialStatus="rejected" />
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  headerTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 17,
    fontWeight: '700',
    color: '#0B2F52',
    textAlign: 'center',
  },
  headerRightSpace: {
    width: 38,
  },
  topStepperContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },

  // 1. Status Banner Card
  bannerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 3,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },

  // 2. Application Details Card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
    textAlign: 'right',
  },

  // Rejection Reason Box
  reasonAlertBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    marginBottom: 8,
  },
  reasonIconWrap: {
    marginTop: 1,
  },
  reasonTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  reasonHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  reasonBody: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
    marginTop: 2,
    lineHeight: 18,
  },

  // 3. Status Timeline Card
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  timelineHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  timelineList: {
    paddingLeft: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 24,
  },
  timelineCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2.5,
    flex: 1,
    minHeight: 28,
  },
  timelineTextCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  timelineStepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  timelineStepTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  // Re-apply for Membership Button
  reapplyPrimaryButton: {
    backgroundColor: '#1B3F8F',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
    gap: 8,
    shadowColor: '#1B3F8F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  reapplyPrimaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // 4. Back to My Status Button
  backToStatusButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1B3F8F',
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  backToStatusButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B3F8F',
  },
  // Fee status card styles
  feeStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
    marginBottom: 8,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  feeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeStatusLeft: {
    flex: 1,
  },
  feeStatusLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
  },
  feeStatusSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  feeStatusBadge: {
    backgroundColor: '#FFF6D9',
    borderColor: '#B88916',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  feeStatusBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#926C05',
  },
  feePaymentDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  paymentGatewayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  statusDotGreen: {
    backgroundColor: '#10B981',
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  payFeeGatewayButton: {
    backgroundColor: '#123B7A',
    borderRadius: 10,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    shadowColor: '#123B7A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  payFeeGatewayButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ApplicationStatusScreen;
