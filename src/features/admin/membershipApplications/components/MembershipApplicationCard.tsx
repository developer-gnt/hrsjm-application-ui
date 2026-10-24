import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { FileText, ChevronRight } from '../../../../core/components/icons';
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
      case 'submitted':
      default:
        return (
          <View style={[styles.statusBadge, styles.badgeSubmitted]}>
            <Text style={[styles.statusText, styles.textSubmitted]}>Submitted</Text>
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
            <FileText size={12} color="#2563EB" strokeWidth={2} />
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

        {/* Far Right: Chevron */}
        <View style={styles.arrowContainer}>
          <ChevronRight size={18} color="#94A3B8" strokeWidth={2.2} />
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
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeApproved: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  textApproved: {
    color: '#059669',
  },
  badgeUnderReview: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  textUnderReview: {
    color: '#D97706',
  },
  badgeRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  textRejected: {
    color: '#DC2626',
  },
  badgeSubmitted: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  textSubmitted: {
    color: '#2563EB',
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  submittedDate: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
