import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { DisplayMembershipStatus } from '../hooks/useMembershipDetailsData';

interface MembershipValidityCardProps {
  validTill: string;
  totalDuration: string;
  daysRemaining: string;
  status: DisplayMembershipStatus;
}

export const MembershipValidityCard: React.FC<MembershipValidityCardProps> = ({
  validTill,
  totalDuration,
  daysRemaining,
  status,
}) => {
  const getStatusBadgeStyle = () => {
    switch (status) {
      case 'Active':
        return {
          container: styles.badgeActive,
          text: styles.badgeTextActive,
          panelBg: '#F0FDF4',
          panelBorder: '#DCFCE7',
        };
      case 'Under Review':
        return {
          container: styles.badgeReview,
          text: styles.badgeTextReview,
          panelBg: '#FFFBEB',
          panelBorder: '#FEF3C7',
        };
      case 'Rejected':
        return {
          container: styles.badgeRejected,
          text: styles.badgeTextRejected,
          panelBg: '#FEF2F2',
          panelBorder: '#FEE2E2',
        };
      default:
        return {
          container: styles.badgeDefault,
          text: styles.badgeTextDefault,
          panelBg: '#F8FAFC',
          panelBorder: '#F1F5F9',
        };
    }
  };

  const badgeStyle = getStatusBadgeStyle();

  return (
    <View style={styles.sectionContainer} accessibilityRole="region" accessibilityLabel="Membership Validity Section">
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Membership Validity</Text>

      {/* Main Validity Card */}
      <View style={styles.cardContainer}>
        {/* Top Info Row */}
        <View style={styles.topRow}>
          {/* Calendar Icon */}
          <View style={styles.calendarIconContainer}>
            <View style={styles.calendarBox}>
              <View style={styles.calendarBinderRow}>
                <View style={styles.calendarBinder} />
                <View style={styles.calendarBinder} />
              </View>
              <View style={styles.calendarTopBar} />
              <View style={styles.calendarGrid}>
                <View style={styles.calendarDot} />
                <View style={styles.calendarDot} />
                <View style={styles.calendarDot} />
                <View style={styles.calendarDot} />
                <View style={styles.calendarDot} />
                <View style={styles.calendarDot} />
              </View>
            </View>
          </View>

          {/* Valid Till Details */}
          <View style={styles.middleColumn}>
            <Text style={styles.validTillLabel}>Valid Till</Text>
            <Text style={styles.validTillValue} numberOfLines={1}>
              {validTill}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, badgeStyle.container]}>
            <Text style={[styles.statusBadgeText, badgeStyle.text]}>{status}</Text>
          </View>
        </View>

        {/* Bottom Banner Panel (Total Duration & Days Remaining) */}
        <View
          style={[
            styles.bottomPanel,
            { backgroundColor: badgeStyle.panelBg, borderTopColor: badgeStyle.panelBorder },
          ]}
        >
          {/* Total Duration */}
          <View style={styles.panelColumnLeft}>
            <Text style={styles.panelLabel}>Total Duration</Text>
            <Text style={styles.panelValue}>{totalDuration}</Text>
          </View>

          {/* Days Remaining */}
          <View style={styles.panelColumnRight}>
            <Text style={styles.panelLabel}>Days Remaining</Text>
            <Text style={styles.panelValue}>{daysRemaining}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  calendarIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  calendarBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
  },
  calendarBinderRow: {
    position: 'absolute',
    top: -2,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 3,
  },
  calendarBinder: {
    width: 2,
    height: 4,
    backgroundColor: '#0F2860',
    borderRadius: 1,
  },
  calendarTopBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#D97706',
  },
  calendarGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#1E3A8A',
  },
  middleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  validTillLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  validTillValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2860',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginLeft: 8,
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
  bottomPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  panelColumnLeft: {
    flex: 1,
  },
  panelColumnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  panelLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 3,
  },
  panelValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
  },
});
