import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';
import type { RightsStatsSummary } from '../types/rights.types';

interface StatCardConfig {
  key: keyof RightsStatsSummary;
  label: string;
  icon: string;
  backgroundColor: string;
}

/** Card order/tones per the reference: Total (blue), Drafts (amber), Published (green), Archived (red). */
const STAT_CARDS: StatCardConfig[] = [
  {
    key: 'total',
    label: 'Total Articles',
    icon: '📄',
    backgroundColor: AdminColors.primaryLight,
  },
  {
    key: 'drafts',
    label: 'Drafts',
    icon: '🕐',
    backgroundColor: AdminColors.warningLight,
  },
  {
    key: 'published',
    label: 'Published',
    icon: '✅',
    backgroundColor: AdminColors.statusActiveLight,
  },
  {
    key: 'archived',
    label: 'Archived',
    icon: '❌',
    backgroundColor: AdminColors.statusInactiveLight,
  },
];

/**
 * Summary/stat row for the Know Your Rights screen.
 * Values are UI demonstration data for now (reference numbers, not backend
 * values) and will be fed by the backend once the Rights API is confirmed.
 */
export const RightsSummaryCard: React.FC<{
  stats: RightsStatsSummary;
  style?: ViewStyle;
}> = ({ stats, style }) => {
  return (
    <View style={[styles.row, style]}>
      {STAT_CARDS.map(card => {
        const value = stats[card.key];

        return (
          <View
            key={card.key}
            style={[styles.card, { backgroundColor: card.backgroundColor }]}
            accessible
            accessibilityLabel={`${card.label}: ${value}`}
            accessibilityRole="text"
          >
            <View style={styles.iconChip}>
              <Text style={styles.icon}>{card.icon}</Text>
            </View>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
              {card.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    minHeight: 94,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChip: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  icon: {
    fontSize: 12,
  },
  value: {
    ...Typography.metric,
    fontSize: 19,
    lineHeight: 24,
    color: AdminColors.textPrimary,
  },
  label: {
    ...Typography.caption,
    fontSize: 9,
    lineHeight: 12,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
