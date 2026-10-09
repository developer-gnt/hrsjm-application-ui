import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { DisplayMembershipStatus } from '../hooks/useMembershipDetailsData';

interface MembershipInformationCardProps {
  fullName: string;
  membershipType: string;
  memberId: string;
  dob?: string;
  joinDate: string;
  validTill: string;
  status: DisplayMembershipStatus;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
  valueComponent?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
  isLast = false,
  valueComponent,
}) => (
  <View style={styles.rowWrapper}>
    <View style={styles.rowLeft}>
      <View style={styles.iconBox}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>

    <View style={styles.rowRight}>
      {valueComponent ? (
        valueComponent
      ) : (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value || '—'}
        </Text>
      )}
    </View>
    {!isLast && <View style={styles.divider} />}
  </View>
);

export const MembershipInformationCard: React.FC<MembershipInformationCardProps> = ({
  fullName,
  membershipType,
  memberId,
  dob,
  joinDate,
  validTill,
  status,
}) => {
  const getStatusBadgeStyle = () => {
    switch (status) {
      case 'Active':
        return { container: styles.badgeActive, text: styles.badgeTextActive };
      case 'Under Review':
        return { container: styles.badgeReview, text: styles.badgeTextReview };
      case 'Rejected':
        return { container: styles.badgeRejected, text: styles.badgeTextRejected };
      default:
        return { container: styles.badgeDefault, text: styles.badgeTextDefault };
    }
  };

  const badgeStyle = getStatusBadgeStyle();

  return (
    <View style={styles.sectionContainer} accessibilityRole="region" accessibilityLabel="Membership Information Section">
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Membership Information</Text>

      {/* Rows Container Card */}
      <View style={styles.cardContainer}>
        {/* 1. Full Name */}
        <InfoRow
          icon={
            <View style={styles.personIcon}>
              <View style={styles.personHead} />
              <View style={styles.personBody} />
            </View>
          }
          label="Full Name"
          value={fullName || 'Not provided'}
        />

        {/* 2. Membership Type */}
        <InfoRow
          icon={
            <View style={styles.badgeIcon}>
              <View style={styles.badgeShield} />
              <View style={styles.badgeStar} />
            </View>
          }
          label="Membership Type"
          value={membershipType}
        />

        {/* 3. Member ID */}
        <InfoRow
          icon={
            <View style={styles.idCardIcon}>
              <View style={styles.idCardDot} />
              <View style={styles.idCardLine} />
            </View>
          }
          label="Member ID"
          value={memberId}
        />

        {/* 4. Date of Birth (only if collected / provided) */}
        <InfoRow
          icon={
            <View style={styles.calendarIcon}>
              <View style={styles.calendarHanger} />
              <View style={styles.calendarDot} />
            </View>
          }
          label="Date of Birth"
          value={dob ? dob : 'Not provided'}
        />

        {/* 5. Join Date */}
        <InfoRow
          icon={
            <View style={styles.calendarIcon}>
              <View style={styles.calendarHanger} />
              <View style={styles.calendarDot} />
            </View>
          }
          label="Join Date"
          value={joinDate}
        />

        {/* 6. Valid Till */}
        <InfoRow
          icon={
            <View style={styles.calendarIcon}>
              <View style={styles.calendarHanger} />
              <View style={styles.calendarDot} />
            </View>
          }
          label="Valid Till"
          value={validTill}
        />

        {/* 7. Status */}
        <InfoRow
          icon={
            <View style={styles.statusIcon}>
              <View style={styles.statusCheck} />
            </View>
          }
          label="Status"
          value={status}
          isLast={true}
          valueComponent={
            <View style={[styles.statusBadge, badgeStyle.container]}>
              <Text style={[styles.statusBadgeText, badgeStyle.text]}>{status}</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    width: '100%',
    paddingHorizontal: 0,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    marginBottom: Spacing.md,
    paddingHorizontal: 16,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 16,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    position: 'relative',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  rowRight: {
    alignItems: 'flex-end',
    maxWidth: '52%',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
    textAlign: 'right',
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 0,
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  /* Status Badges */
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeActive: {
    backgroundColor: '#DCFCE7',
  },
  badgeTextActive: {
    color: '#15803D',
  },
  badgeReview: {
    backgroundColor: '#FEF3C7',
  },
  badgeTextReview: {
    color: '#B45309',
  },
  badgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  badgeTextRejected: {
    color: '#DC2626',
  },
  badgeDefault: {
    backgroundColor: '#F1F5F9',
  },
  badgeTextDefault: {
    color: '#64748B',
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* Vector Icons */
  personIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
  },
  personBody: {
    width: 14,
    height: 7,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#1E3A8A',
    marginTop: 1,
  },

  badgeIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeShield: {
    width: 14,
    height: 15,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
  },
  badgeStar: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D97706',
  },

  idCardIcon: {
    width: 18,
    height: 14,
    borderRadius: 2.5,
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  idCardDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E3A8A',
  },
  idCardLine: {
    width: 6,
    height: 1.5,
    backgroundColor: '#64748B',
    borderRadius: 0.75,
  },

  calendarIcon: {
    width: 17,
    height: 17,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calendarHanger: {
    position: 'absolute',
    top: 1,
    left: 2,
    right: 2,
    height: 1.5,
    backgroundColor: '#D97706',
  },
  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E3A8A',
    marginTop: 2,
  },

  statusIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCheck: {
    width: 7,
    height: 4,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#1E3A8A',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
});
