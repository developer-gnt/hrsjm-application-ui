import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { SolidCommunityIcon } from './MembershipIcons';

interface CurrentMembershipCardProps {
  postName?: string;
  validTill?: string;
  daysRemaining?: number | string;
}

export const CurrentMembershipCard: React.FC<CurrentMembershipCardProps> = ({
  postName = 'District Unit',
  validTill = '15 Oct 2026',
  daysRemaining = '7 days',
}) => {
  return (
    <View
      style={styles.cardContainer}
      accessibilityRole="region"
      accessibilityLabel="Current Membership Information"
    >
      {/* Left Column: Post Name & Icon */}
      <View style={styles.postSection}>
        <View style={styles.iconCircle}>
          <SolidCommunityIcon size={20} color="#1E40AF" />
        </View>
        <View style={styles.postTextWrapper}>
          <Text style={styles.labelSmall}>Current Membership</Text>
          <Text style={styles.postTitleText} numberOfLines={1}>
            {postName}
          </Text>
        </View>
      </View>

      {/* Vertical Divider */}
      <View style={styles.divider} />

      {/* Middle Column: Valid Till */}
      <View style={styles.metaSection}>
        <Text style={styles.labelSmall}>Valid Till</Text>
        <Text style={styles.metaValueDark}>{validTill}</Text>
      </View>

      {/* Vertical Divider */}
      <View style={styles.divider} />

      {/* Right Column: Days Remaining */}
      <View style={styles.metaSection}>
        <Text style={styles.labelSmall}>Days Remaining</Text>
        <Text style={styles.metaValueOrange}>{daysRemaining}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1.5,
  },
  postSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.25,
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  postTextWrapper: {
    flex: 1,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 13,
  },
  postTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2860',
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 6,
  },
  metaSection: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  metaValueDark: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F2860',
    marginTop: 2,
    lineHeight: 16,
  },
  metaValueOrange: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#EA580C',
    marginTop: 2,
    lineHeight: 16,
  },
});
