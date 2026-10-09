import React from 'react';
import {
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

        {/* Floating Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {cause.categoryIcon} {cause.category}
          </Text>
        </View>

        {/* Status indicator */}
        <View
          style={[
            styles.statusBadge,
            isCompleted ? styles.statusBadgeClosed : styles.statusBadgeActive,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isCompleted ? styles.statusDotClosed : styles.statusDotActive,
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
          <Text style={styles.metaText} numberOfLines={1}>
            📍 {cause.location}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText} numberOfLines={1}>
            👥 {cause.targetBeneficiaries}
          </Text>
        </View>

        {/* Fundraising Numbers */}
        <View style={styles.financialRow}>
          <View>
            <Text style={styles.raisedAmountText}>
              {formatRupee(cause.raisedAmount)}
            </Text>
            <Text style={styles.financialLabel}>Raised</Text>
          </View>
          <View style={styles.goalCol}>
            <Text style={styles.goalAmountText}>
              {formatRupee(cause.targetAmount)}
            </Text>
            <Text style={styles.financialLabel}>Goal</Text>
          </View>
        </View>

        {/* Progress Bar with Percentage */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${percentRaised}%` },
                isCompleted && styles.progressBarFillCompleted,
              ]}
            />
          </View>
          <Text style={styles.progressPercentText}>{percentRaised}%</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.viewDetailsBtn}
            onPress={() => onViewDetails(cause)}
            activeOpacity={0.7}
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
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Donate to ${cause.title}`}
          >
            <Text style={styles.donateHeartIcon}>{isCompleted ? '✅' : '💛'}</Text>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrapper: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  causeImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusBadgeActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusBadgeClosed: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotClosed: {
    backgroundColor: '#3B82F6',
  },
  statusText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#065F46',
  },
  statusTextClosed: {
    color: '#1E40AF',
  },
  contentArea: {
    padding: 16,
  },
  causeTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  metaDot: {
    color: '#94A3B8',
    fontSize: 10,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  raisedAmountText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 20,
  },
  goalAmountText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'right',
  },
  financialLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  goalCol: {
    alignItems: 'flex-end',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  progressBarTrack: {
    flex: 1,
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1B3F8F',
    borderRadius: 4,
  },
  progressBarFillCompleted: {
    backgroundColor: '#10B981',
  },
  progressPercentText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#1B3F8F',
    minWidth: 34,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewDetailsBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  donateBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#1B3F8F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#1B3F8F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  donateBtnDisabled: {
    backgroundColor: '#0F2860',
  },
  donateHeartIcon: {
    fontSize: 13,
  },
  donateBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
