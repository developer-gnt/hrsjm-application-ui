import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MemberCause } from '../types/causes.types';

interface CauseCardProps {
  cause: MemberCause;
  onViewDetails: (cause: MemberCause) => void;
  onDonate: (cause: MemberCause) => void;
}

export const CauseCard: React.FC<CauseCardProps> = ({
  cause,
  onViewDetails,
  onDonate,
}) => {
  const percentRaised = Math.min(
    100,
    Math.round((cause.raisedAmount / (cause.targetAmount || 1)) * 100),
  );

  // Animated progress bar value
  const animatedProgress = useRef(new Animated.Value(0)).current;

  // Pulse animation for active status dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Ease-in and ease-out animated progress bar fill
    Animated.timing(animatedProgress, {
      toValue: percentRaised,
      duration: 1100,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Subtle pulsing loop for the active status indicator
    if (cause.status === 'active' && percentRaised < 100) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.35,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [percentRaised, cause.status, animatedProgress, pulseAnim]);

  const progressWidthInterpolated = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const formatRupee = (val: number) => {
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  const isCompleted = cause.status === 'closed' || percentRaised >= 100;

  return (
    <View style={styles.cardContainer}>
      {/* Top Media Banner */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: cause.imageUrl }}
          style={styles.causeImage}
          resizeMode="cover"
        />

        {/* Subtle Dark Bottom Gradient Overlay for Visual Depth */}
        <View style={styles.imageOverlay} />

        {/* Floating Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {cause.categoryIcon} {cause.category}
          </Text>
        </View>

        {/* Status indicator with animated pulse */}
        <View
          style={[
            styles.statusBadge,
            isCompleted ? styles.statusBadgeClosed : styles.statusBadgeActive,
          ]}
        >
          <Animated.View
            style={[
              styles.statusDot,
              isCompleted ? styles.statusDotClosed : styles.statusDotActive,
              !isCompleted && { transform: [{ scale: pulseAnim }] },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isCompleted ? styles.statusTextClosed : styles.statusTextActive,
            ]}
          >
            {isCompleted ? 'Goal Reached' : 'Active'}
          </Text>
        </View>
      </View>

      {/* Card Content Area */}
      <View style={styles.contentArea}>
        {/* Cause Title */}
        <Text style={styles.causeTitle} numberOfLines={2}>
          {cause.title}
        </Text>

        {/* Location & Beneficiaries Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillIcon}>📍</Text>
            <Text style={styles.metaText} numberOfLines={1}>
              {cause.location}
            </Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillIcon}>👥</Text>
            <Text style={styles.metaText} numberOfLines={1}>
              {cause.targetBeneficiaries}
            </Text>
          </View>
        </View>

        {/* Fundraising Metrics Row */}
        <View style={styles.financialRow}>
          <View style={styles.financialCol}>
            <Text style={styles.raisedAmountText}>
              {formatRupee(cause.raisedAmount)}
            </Text>
            <Text style={styles.financialLabel}>Raised so far</Text>
          </View>
          <View style={[styles.financialCol, styles.goalCol]}>
            <Text style={styles.goalAmountText}>
              {formatRupee(cause.targetAmount)}
            </Text>
            <Text style={styles.financialLabel}>Goal Amount</Text>
          </View>
        </View>

        {/* Smooth Ease-in-Out Animated Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: progressWidthInterpolated },
                isCompleted && styles.progressBarFillCompleted,
              ]}
            />
          </View>
          <View style={styles.percentageBadge}>
            <Text style={styles.progressPercentText}>{percentRaised}%</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.viewDetailsBtn}
            onPress={() => onViewDetails(cause)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${cause.title}`}
          >
            <Text style={styles.viewDetailsBtnText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.donateBtn,
              isCompleted && styles.donateBtnDisabled,
            ]}
            onPress={() => onDonate(cause)}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={`Donate to ${cause.title}`}
          >
            <Text style={styles.donateHeartIcon}>
              {isCompleted ? '✓' : '💛'}
            </Text>
            <Text style={styles.donateBtnText}>
              {isCompleted ? 'Goal Reached' : 'Donate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 16,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#0B2854',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrapper: {
    height: 170,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  causeImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2860',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(236, 253, 245, 0.95)',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  statusBadgeClosed: {
    backgroundColor: 'rgba(239, 246, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusDotActive: {
    backgroundColor: '#059669',
  },
  statusDotClosed: {
    backgroundColor: '#2563EB',
  },
  statusText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#047857',
  },
  statusTextClosed: {
    color: '#1D4ED8',
  },
  contentArea: {
    padding: 18,
  },
  causeTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 23,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  metaPillIcon: {
    fontSize: 12,
  },
  metaText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
    maxWidth: 220,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  financialCol: {
    gap: 2,
  },
  raisedAmountText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2860',
  },
  goalCol: {
    alignItems: 'flex-end',
  },
  goalAmountText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  financialLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  progressBarTrack: {
    flex: 1,
    height: 9,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#1B3F8F',
  },
  progressBarFillCompleted: {
    backgroundColor: '#059669',
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#EEF3FC',
  },
  progressPercentText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#1B3F8F',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  viewDetailsBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  donateBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#1B3F8F',
    gap: 7,
    shadowColor: '#1B3F8F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  donateBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  donateHeartIcon: {
    fontSize: 14,
  },
  donateBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default CauseCard;
