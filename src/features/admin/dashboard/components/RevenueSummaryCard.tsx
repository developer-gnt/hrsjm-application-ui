import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { formatINR } from '../../../../core/utils';

interface RevenueSummaryCardProps {
  membershipIncome: number;
  donationIncome: number;
}

/** Revenue overview card (BRD Phase 4: membership + donation income, net). */
export const RevenueSummaryCard: React.FC<RevenueSummaryCardProps> = ({
  membershipIncome,
  donationIncome,
}) => {
  const total = membershipIncome + donationIncome;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Revenue</Text>

      <View style={styles.totalRow}>
        <Text style={styles.totalValue}>{formatINR(total)}</Text>
        <Text style={styles.totalLabel}>Collected</Text>
      </View>

      <View style={styles.breakdownRow}>
        <View style={[styles.item, { backgroundColor: AdminColors.infoLight }]}>
          <Text style={styles.itemValue}>{formatINR(membershipIncome)}</Text>
          <Text style={styles.itemLabel}>Membership</Text>
        </View>
        <View
          style={[styles.item, { backgroundColor: AdminColors.accentGoldLight }]}
        >
          <Text style={styles.itemValue}>{formatINR(donationIncome)}</Text>
          <Text style={styles.itemLabel}>Donations</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.card,
  },
  title: {
    ...Typography.cardTitle,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  totalValue: {
    ...Typography.metricLarge,
    color: AdminColors.textPrimary,
  },
  totalLabel: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  item: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  itemValue: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
  itemLabel: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
});
