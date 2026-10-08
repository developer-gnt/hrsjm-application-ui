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
  onReview,
  onReconsider,
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

  const renderActionButtons = () => {
    switch (application.status) {
      case 'approved':
        return (
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => onView?.(application)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`View ${application.applicantName}`}
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        );
      case 'under_review':
        return (
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => onView?.(application)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`View ${application.applicantName}`}
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => onReview?.(application)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Review ${application.applicantName}`}
            >
              <Text style={styles.reviewButtonText}>Review</Text>
            </TouchableOpacity>
          </View>
        );
      case 'rejected':
        return (
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => onView?.(application)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`View ${application.applicantName}`}
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reconsiderButton}
              onPress={() => onReconsider?.(application)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Reconsider ${application.applicantName}`}
            >
              <Text style={styles.reconsiderButtonText}>Reconsider</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onView?.(application)}
      accessibilityRole="button"
      accessibilityLabel={`Application of ${application.applicantName}`}
    >
      <View style={styles.cardHeaderRow}>
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

        {/* Middle: Details */}
        <View style={styles.middleDetails}>
          <Text style={styles.applicantName} numberOfLines={1}>
            {application.applicantName}
          </Text>
          <Text style={styles.membershipType} numberOfLines={1}>
            {application.membershipType}
          </Text>
          <View style={styles.appIdRow}>
            <Text style={styles.docIcon}>📄</Text>
            <Text style={styles.applicationId}>{application.applicationId}</Text>
          </View>
        </View>

        {/* Right: Status & Chevron */}
        <View style={styles.rightColumn}>
          <View style={styles.statusAndChevron}>
            {renderStatusBadge()}
            <Text style={styles.chevron}>›</Text>
          </View>
          <View style={styles.submissionTimeContainer}>
            <Text style={styles.submittedLabel}>Submitted on</Text>
            <Text style={styles.submittedDate}>{application.submittedAt}</Text>
          </View>
          {renderActionButtons()}
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
    padding: 14,
    marginHorizontal: Spacing.base,
    marginBottom: 12,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
  },
  initialsFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  middleDetails: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },
  applicantName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 20,
  },
  membershipType: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  appIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  docIcon: {
    fontSize: 12,
    color: '#1E3A8A',
  },
  applicationId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 135,
  },
  statusAndChevron: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
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
  chevron: {
    fontSize: 18,
    color: '#1E3A8A',
    fontWeight: '600',
    lineHeight: 18,
  },
  submissionTimeContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 8,
  },
  submittedLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  submittedDate: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
    marginTop: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewButton: {
    backgroundColor: '#EEF3FC',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  reviewButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reconsiderButton: {
    backgroundColor: '#EEF3FC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E5F8',
  },
  reconsiderButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
  },
});
