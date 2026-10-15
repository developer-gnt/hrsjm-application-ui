import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { MembershipApplicationItem } from '../types/membershipApplications.types';

interface MembershipApplicantSummaryCardProps {
  application: MembershipApplicationItem;
}

export const MembershipApplicantSummaryCard: React.FC<MembershipApplicantSummaryCardProps> = ({
  application,
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
    <View style={styles.card}>
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

        {/* Center: Applicant Information & Contacts */}
        <View style={styles.mainInfo}>
          <Text style={styles.applicantName} numberOfLines={1}>
            {application.applicantName}
          </Text>
          <Text style={styles.membershipType} numberOfLines={1}>
            {application.membershipType}
          </Text>

          <View style={styles.metaList}>
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>📄</Text>
              <Text style={styles.appIdText} numberOfLines={1}>
                {application.applicationId}
              </Text>
            </View>

            {application.phone ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>📞</Text>
                <Text style={styles.metaText} numberOfLines={1}>
                  {application.phone}
                </Text>
              </View>
            ) : null}

            {application.email ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>✉️</Text>
                <Text style={styles.metaText} numberOfLines={1}>
                  {application.email}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Right: Status, Date & Chevron */}
        <View style={styles.rightSection}>
          <View style={styles.topRightRow}>
            <View style={styles.badgeWrapper}>{renderStatusBadge()}</View>
            <Text style={styles.chevron}>›</Text>
          </View>

          <View style={styles.submittedContainer}>
            <Text style={styles.submittedLabel}>Submitted on</Text>
            <Text style={styles.submittedDate}>{application.submittedAt}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 10,
    marginTop: 2,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  mainInfo: {
    flex: 1,
    paddingRight: 6,
  },
  applicantName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 20,
  },
  membershipType: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    marginBottom: 4,
  },
  metaList: {
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 10,
    color: '#1E3A8A',
  },
  appIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  metaText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 105,
    maxWidth: 130,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeWrapper: {},
  statusBadge: {
    paddingVertical: 2.5,
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
  chevron: {
    fontSize: 18,
    color: '#0F2860',
    fontWeight: '700',
    lineHeight: 18,
  },
  submittedContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  submittedLabel: {
    fontSize: 9.5,
    color: '#64748B',
  },
  submittedDate: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
    marginTop: 1,
  },
});
