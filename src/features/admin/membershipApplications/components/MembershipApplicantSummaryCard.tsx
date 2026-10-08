import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { MembershipApplicationItem } from '../types/membershipApplications.types';

interface MembershipApplicantSummaryCardProps {
  application: MembershipApplicationItem;
  onPress?: () => void;
}

export const MembershipApplicantSummaryCard: React.FC<MembershipApplicantSummaryCardProps> = ({
  application,
  onPress,
}) => {
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name.slice(0, 2) || 'NA').toUpperCase();
  };

  const renderStatusBadge = () => {
    switch (application.status) {
      case 'approved':
        return (
          <View style={[styles.statusBadge, styles.badgeApproved]}>
            <Text style={[styles.statusText, styles.textApproved]}>Approved</Text>
          </View>
        );
      case 'under_review':
        return (
          <View style={[styles.statusBadge, styles.badgeUnderReview]}>
            <Text style={[styles.statusText, styles.textUnderReview]}>Under Review</Text>
          </View>
        );
      case 'rejected':
        return (
          <View style={[styles.statusBadge, styles.badgeRejected]}>
            <Text style={[styles.statusText, styles.textRejected]}>Rejected</Text>
          </View>
        );
    }
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Summary of ${application.applicantName}`}
    >
      {/* Left: Avatar */}
      <View style={styles.avatarContainer}>
        {application.avatarUrl ? (
          <Image
            source={{ uri: application.avatarUrl }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.initialsFallback}>
            <Text style={styles.initialsText}>
              {getInitials(application.applicantName)}
            </Text>
          </View>
        )}
      </View>

      {/* Middle Left: Applicant Name & Info */}
      <View style={styles.leftInfoColumn}>
        <Text style={styles.applicantName} numberOfLines={1}>
          {application.applicantName}
        </Text>
        <Text style={styles.membershipType} numberOfLines={1}>
          {application.membershipType}
        </Text>
        <View style={styles.idRow}>
          <Text style={styles.docIcon}>📄</Text>
          <Text style={styles.appIdText}>{application.applicationId}</Text>
        </View>
      </View>

      {/* Vertical Divider */}
      <View style={styles.verticalDivider} />

      {/* Right Column: Status Badge & Date */}
      <View style={styles.rightStatusColumn}>
        {renderStatusBadge()}
        <Text style={styles.dateText} numberOfLines={1}>
          {application.submittedAt}
        </Text>
      </View>

      {/* Far Right Chevron */}
      <View style={styles.chevronContainer}>
        <Text style={styles.chevronIcon}>›</Text>
      </View>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8EFF8',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
  },
  initialsFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E5F8',
  },
  initialsText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  leftInfoColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 21,
  },
  membershipType: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4,
  },
  docIcon: {
    fontSize: 12,
    color: '#1E3A8A',
  },
  appIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  verticalDivider: {
    width: 1,
    height: 44,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  rightStatusColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
    gap: 6,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeApproved: {
    backgroundColor: '#DCFCE7',
  },
  textApproved: {
    color: '#15803D',
  },
  badgeUnderReview: {
    backgroundColor: '#FEF3C7',
  },
  textUnderReview: {
    color: '#B45309',
  },
  badgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  textRejected: {
    color: '#DC2626',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  chevronContainer: {
    marginLeft: 8,
    paddingRight: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronIcon: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E3A8A',
    lineHeight: 22,
  },
});
