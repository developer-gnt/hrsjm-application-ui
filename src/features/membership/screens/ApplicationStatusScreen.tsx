import React, { useState } from 'react';
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
        defaultTime: '15 Oct 2026, 02:15 PM',
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
        defaultTime: '15 Oct 2026, 02:15 PM',
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
        defaultTime: '15 Oct 2026, 02:15 PM',
      },
    ],
    timelineColor: 'red',
    showApprovedRow: false,
    showRejectedRow: true,
    showReasonAlert: true,
  },
};

const mapAppStatusToInnerStatus = (status?: string): ApplicationInnerStatus => {
  if (!status) return 'under_review';
  const s = status.toLowerCase();
  if (s.includes('applied') || s.includes('submit') || s.includes('draft')) {
    return 'applied';
  }
  if (s.includes('approve')) {
    return 'approved';
  }
  if (s.includes('reject')) {
    return 'rejected';
  }
  return 'under_review';
};

export const ApplicationStatusScreen: React.FC<ApplicationStatusScreenProps> = ({
  initialStatus,
  applicationId,
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { applications, activeApplication } = useMembership();

  const targetAppId = applicationId || route.params?.applicationId;
  const currentApp =
    applications.find(a => a.applicationId === targetAppId) ||
    activeApplication ||
    applications[0];

  const resolvedInitialStatus: ApplicationInnerStatus =
    initialStatus ||
    route.params?.status ||
    (currentApp ? mapAppStatusToInnerStatus(currentApp.status) : 'under_review');

  const [activeStatus, setActiveStatus] =
    useState<ApplicationInnerStatus>(resolvedInitialStatus);

  const config = STATUS_CONFIGS[activeStatus] || STATUS_CONFIGS.under_review;

  // Dynamic application data with exact reference fallback values
  const appType = currentApp?.membershipType || 'Membership Application';
  const appId = currentApp?.applicationId || 'APP-20261012-001';
  const appliedOn = currentApp?.submittedAt || '12 Oct 2026, 10:30 AM';
  const approvedOn = currentApp?.approvedAt || '15 Oct 2026, 04:20 PM';
  const rejectedOn = currentApp?.rejectedAt || '16 Oct 2026, 11:45 AM';
  const rejectionReason =
    currentApp?.rejectionReason || 'Incomplete documents';

  const timestamps = {
    applied: appliedOn,
    underReview: '15 Oct 2026, 02:15 PM',
    approved: approvedOn,
    rejected: rejectedOn,
  };

  const handleBackToStatus = () => {
    const navState = navigation.getState?.();
    const routeNames: string[] = navState?.routeNames || [];
    if (routeNames.includes('MyApplication')) {
      navigation.navigate('MyApplication');
    } else {
      navigation.goBack();
    }
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
              <Text style={styles.bannerSubtitle}>{config.bannerSubtitle}</Text>
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
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
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
    backgroundColor: '#F8FAFC',
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
});

export default ApplicationStatusScreen;
