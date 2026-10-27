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
import {
  MembershipApplicationItem,
  getApplicationAccountType,
} from '../types/membershipApplications.types';

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
  const accountType = getApplicationAccountType ? getApplicationAccountType(application) : undefined;
  const isSeeker =
    accountType === 'seeker' ||
    (application.membershipType || '').toLowerCase().includes('seeker') ||
    Boolean(application.applicationId && application.applicationId.startsWith('HRSJM-SEK'));

  const getInitials = (name: string): string => {
    const parts = (name || '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name?.slice(0, 2) || 'NA').toUpperCase();
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
      style={[
        styles.card,
        isSeeker ? styles.cardSeeker : styles.cardMember,
      ]}
      activeOpacity={0.8}
      onPress={() => onView?.(application)}
      accessibilityRole="button"
      accessibilityLabel={`Application of ${application.applicantName}`}
    >
      {/* Top Header Row: Avatar + Name + Type Pill on left, Status Badge on right */}
      <View style={styles.cardHeaderRow}>
        {/* Left: Avatar */}
        <View style={styles.avatarContainer}>
          {application.avatarUrl ? (
            <Image
              source={{ uri: application.avatarUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View
              style={[
                styles.initialsFallback,
                isSeeker ? styles.initialsFallbackSeeker : styles.initialsFallbackMember,
              ]}
            >
              <Text
                style={[
                  styles.initialsText,
                  isSeeker ? styles.initialsTextSeeker : styles.initialsTextMember,
                ]}
              >
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
          <View style={[styles.typePill, isSeeker ? styles.typePillSeeker : styles.typePillMember]}>
            <Text
              style={[
                styles.typePillText,
                isSeeker ? styles.typePillTextSeeker : styles.typePillTextMember,
              ]}
              numberOfLines={1}
            >
              {isSeeker ? 'Donation Seeker' : (application.membershipType || 'Member')}
            </Text>
          </View>
        </View>

        {/* Top-Right: Status Badge */}
        <View style={styles.statusBadgeContainer}>
          {renderStatusBadge()}
        </View>
      </View>

      {/* Subtle Horizontal Divider */}
      <View style={[styles.horizontalDivider, isSeeker ? styles.dividerSeeker : styles.dividerMember]} />

      {/* Bottom Footer Row: App ID on left, Submission Date & Chevron on right */}
      <View style={styles.cardFooterRow}>
        <View style={styles.appIdRow}>
          <FileText size={12} color={isSeeker ? '#D97706' : '#2563EB'} strokeWidth={2} />
          <Text
            style={[styles.applicationId, isSeeker && styles.applicationIdSeeker]}
            numberOfLines={1}
          >
            {application.applicationId}
          </Text>
        </View>

        <View style={styles.footerRight}>
          <Text style={styles.submittedDate} numberOfLines={1}>
            {application.submittedAt}
          </Text>
          <ChevronRight size={15} color="#94A3B8" strokeWidth={2.2} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 14,
    marginHorizontal: Spacing.base,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardMember: {
    backgroundColor: '#EEF2F6', // little dark white (soft cool slate off-white)
    borderColor: '#D2DEEB',
    borderLeftWidth: 4,
    borderLeftColor: '#0F2860',
    shadowColor: '#0F2860',
  },
  cardSeeker: {
    backgroundColor: '#FFFFFF', // little light white (pure bright white)
    borderColor: '#EFE7DA',
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    shadowColor: '#78350F',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  initialsFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  initialsFallbackMember: {
    backgroundColor: '#DFE7F2',
    borderColor: '#CAD8EA',
  },
  initialsFallbackSeeker: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  initialsText: {
    fontSize: 15,
    fontWeight: '700',
  },
  initialsTextMember: {
    color: '#0F2860',
  },
  initialsTextSeeker: {
    color: '#92400E',
  },
  applicantInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    marginRight: 8,
  },
  applicantName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 19,
  },
  typePill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingVertical: 1.5,
    paddingHorizontal: 7,
    borderRadius: 4,
    marginTop: 3,
    borderWidth: 0.5,
  },
  typePillMember: {
    backgroundColor: '#DCE6F2',
    borderColor: '#BACFE6',
  },
  typePillSeeker: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  typePillTextMember: {
    color: '#0F2860',
  },
  typePillTextSeeker: {
    color: '#92400E',
  },
  statusBadgeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  horizontalDivider: {
    height: 1,
    marginTop: 9,
    marginBottom: 8,
  },
  dividerMember: {
    backgroundColor: '#D9E3EE',
  },
  dividerSeeker: {
    backgroundColor: '#F1ECE4',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    gap: 4,
  },
  applicationId: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  applicationIdSeeker: {
    color: '#B45309',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  submittedDate: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 9,
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
    fontSize: 11,
    fontWeight: '700',
  },
});
