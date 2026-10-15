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

interface MembershipApplicationCardProps {
  application: MembershipApplicationItem;
  onView?: (application: MembershipApplicationItem) => void;
  onReview?: (application: MembershipApplicationItem) => void;
  onReconsider?: (application: MembershipApplicationItem) => void;
}

export const MembershipApplicationCard: React.FC<MembershipApplicationCardProps> = ({
  application,
  onView,
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

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onView?.(application)}
      accessibilityRole="button"
      accessibilityLabel={`Application of ${application.applicantName}`}
    >
      <View style={styles.cardRow}>
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

        {/* Middle-Left: Applicant Information */}
        <View style={styles.applicantInfo}>
          <Text style={styles.applicantName} numberOfLines={1}>
            {application.applicantName}
          </Text>
          <Text style={styles.membershipType} numberOfLines={1}>
            {application.membershipType}
          </Text>
          <View style={styles.appIdRow}>
            <Text style={styles.docIcon}>📄</Text>
            <Text style={styles.applicationId} numberOfLines={1}>
              {application.applicationId}
            </Text>
          </View>
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Middle-Right: Status & Submission Date/Time */}
        <View style={styles.statusSection}>
          <View style={styles.badgeWrapper}>{renderStatusBadge()}</View>
          <Text style={styles.submittedDate} numberOfLines={1}>
            {application.submittedAt}
          </Text>
        </View>

        {/* Far Right: Right Arrow Chevron */}
        <View style={styles.arrowContainer}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8EFF8',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: Spacing.base,
    marginBottom: 10,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
  },
  initialsFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E5F8',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  applicantInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 4,
  },
  applicantName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 18,
  },
  membershipType: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  appIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  docIcon: {
    fontSize: 11,
    color: '#1E3A8A',
  },
  applicationId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  verticalDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  statusSection: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    minWidth: 110,
    maxWidth: 130,
  },
  badgeWrapper: {
    marginBottom: 4,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
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
  submittedDate: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 22,
    color: '#0F2860',
    fontWeight: '700',
    lineHeight: 22,
  },
});
