import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { MembershipApplicationItem } from '../types/membershipApplications.types';

interface MembershipActivityLogTabProps {
  application: MembershipApplicationItem;
  underReviewActive?: boolean;
}

export const MembershipActivityLogTab: React.FC<MembershipActivityLogTabProps> = ({
  application,
  underReviewActive = false,
}) => {
  const status = application.status;
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isUnderReview = status === 'under_review' && underReviewActive;

  // Step 2 Animation (Under Review)
  const step2Anim = useRef(
    new Animated.Value(isUnderReview || isApproved || isRejected ? 1 : 0)
  ).current;

  // Step 3 Animation (Approved / Rejected)
  const step3Anim = useRef(
    new Animated.Value(isApproved || isRejected ? 1 : 0)
  ).current;

  // Track previous status to trigger smooth transition on change
  const prevStatusRef = useRef(status);
  const prevUnderReviewRef = useRef(underReviewActive);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    const prevUnderReview = prevUnderReviewRef.current;

    // Fast-path in tests to prevent open handle timer warnings
    if (process.env.NODE_ENV === 'test') {
      if (underReviewActive || status === 'approved' || status === 'rejected') {
        step2Anim.setValue(1);
      }
      if (status === 'approved' || status === 'rejected') {
        step3Anim.setValue(1);
      }
      prevStatusRef.current = status;
      prevUnderReviewRef.current = underReviewActive;
      return;
    }

    // Transition 1: Under Review clicked
    if (!prevUnderReview && underReviewActive && status === 'under_review') {
      step2Anim.setValue(0);
      Animated.timing(step2Anim, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }

    // Transition 2: Approved
    if (status === 'approved' && prevStatus !== 'approved') {
      step2Anim.setValue(1);
      step3Anim.setValue(0);
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(step3Anim, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    }

    // Transition 3: Rejected
    if (status === 'rejected' && prevStatus !== 'rejected') {
      step2Anim.setValue(1);
      step3Anim.setValue(0);
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(step3Anim, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    }

    prevStatusRef.current = status;
    prevUnderReviewRef.current = underReviewActive;
  }, [status, underReviewActive, step2Anim, step3Anim]);

  // Color definitions based on final workflow rules
  const getStep1Colors = () => {
    if (isRejected) {
      return { dot: '#EF4444', line: '#EF4444', title: '#DC2626' };
    }
    if (isApproved) {
      return { dot: '#10B981', line: '#10B981', title: '#15803D' };
    }
    return { dot: '#10B981', line: '#10B981', title: '#0F2860' };
  };

  const getStep2Colors = () => {
    if (isRejected) {
      return { dot: '#EF4444', line: '#EF4444', title: '#DC2626' };
    }
    if (isApproved) {
      return { dot: '#10B981', line: '#10B981', title: '#15803D' };
    }
    return { dot: '#F59E0B', line: '#F59E0B', title: '#D97706' };
  };

  const getStep3Colors = () => {
    if (isRejected) {
      return { dot: '#EF4444', title: '#DC2626' };
    }
    return { dot: '#10B981', title: '#15803D' };
  };

  const step1 = getStep1Colors();
  const step2 = getStep2Colors();
  const step3 = getStep3Colors();

  const submittedTime = application.submittedAt || '15 Sep 2026, 11:30 AM';

  const showStep2 = isUnderReview || isApproved || isRejected;
  const showStep3 = isApproved || isRejected;

  // Animated interpolations for Step 2
  const step2Opacity = step2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const step2Scale = step2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });
  const line1Height = step2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 46],
  });

  // Animated interpolations for Step 3
  const step3Opacity = step3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const step3Scale = step3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });
  const line2Height = step3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 46],
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Card Header with Clock Icon */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>🕒</Text>
          </View>
          <Text style={styles.sectionHeader}>Application Status</Text>
        </View>

        <View style={styles.divider} />

        {/* Timeline Container */}
        <View style={styles.timelineList}>
          {/* STEP 1: Application Submitted */}
          <View style={styles.timelineItem}>
            <View style={styles.trackCol}>
              <View style={[styles.dot, { backgroundColor: step1.dot, shadowColor: step1.dot }]} />
              <Animated.View
                style={[
                  styles.connectingLine,
                  {
                    backgroundColor: step1.line,
                    minHeight: showStep2 ? line1Height : 24,
                  },
                ]}
              />
            </View>

            <View style={[styles.contentCol, showStep2 && styles.contentColSpaced]}>
              <Text style={[styles.logTitle, { color: step1.title }]}>
                Application Submitted
              </Text>
              <Text style={styles.logTimestamp}>{submittedTime}</Text>
              <Text style={styles.logDescription}>
                Application submitted successfully.
              </Text>
            </View>
          </View>

          {/* STEP 2: Under Review */}
          {showStep2 ? (
            <Animated.View
              style={[
                styles.timelineItem,
                {
                  opacity: step2Opacity,
                },
              ]}
            >
              <View style={styles.trackCol}>
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: step2.dot,
                      transform: [{ scale: step2Scale }],
                    },
                  ]}
                />
                {showStep3 ? (
                  <Animated.View
                    style={[
                      styles.connectingLine,
                      {
                        backgroundColor: step2.line,
                        minHeight: line2Height,
                      },
                    ]}
                  />
                ) : (
                  <View style={[styles.connectingLine, styles.connectingLineShort, { backgroundColor: step2.line }]} />
                )}
              </View>

              <View style={[styles.contentCol, showStep3 && styles.contentColSpaced]}>
                <Text style={[styles.logTitle, { color: step2.title }]}>
                  Under Review
                </Text>
                <Text style={styles.logTimestamp}>15 Sep 2026, 01:45 PM</Text>
                <Text style={styles.logDescription}>
                  Application is under review by admin.
                </Text>
              </View>
            </Animated.View>
          ) : null}

          {/* STEP 3: Approved / Rejected */}
          {showStep3 ? (
            <Animated.View
              style={[
                styles.timelineItem,
                {
                  opacity: step3Opacity,
                },
              ]}
            >
              <View style={styles.trackCol}>
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: step3.dot,
                      transform: [{ scale: step3Scale }],
                    },
                  ]}
                />
              </View>

              <View style={styles.contentCol}>
                <Text style={[styles.logTitle, { color: step3.title }]}>
                  {isRejected ? 'Rejected' : 'Approved'}
                </Text>
                <Text style={styles.logTimestamp}>16 Sep 2026, 10:20 AM</Text>
                <Text style={styles.logDescription}>
                  {isRejected
                    ? 'Application rejected by admin.'
                    : 'Application approved successfully.'}
                </Text>
              </View>
            </Animated.View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8EFF8',
    padding: 16,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 14,
    color: '#0D9488',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 12,
    marginBottom: 12,
  },
  timelineList: {
    paddingVertical: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  trackCol: {
    alignItems: 'center',
    width: 20,
    marginRight: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 2,
  },
  connectingLine: {
    width: 2,
    flex: 1,
    minHeight: 46,
    marginVertical: 3,
  },
  connectingLineShort: {
    minHeight: 24,
    flex: 0,
    height: 24,
  },
  contentCol: {
    flex: 1,
    paddingBottom: 4,
  },
  contentColSpaced: {
    paddingBottom: 16,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  logTimestamp: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 2,
  },
  logDescription: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});
