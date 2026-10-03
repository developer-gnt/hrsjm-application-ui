import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';
import type { NewsStatsSummary } from '../types/news.types';

interface StatCardConfig {
  key: keyof NewsStatsSummary;
  label: string;
  icon: string;
  backgroundColor: string;
}

/** Card order/tones per the reference: Total (blue), Drafts (amber), Published (green), Archived (red). */
const STAT_CARDS: StatCardConfig[] = [
  {
    key: 'total',
    label: 'Total News',
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

interface NewsSummaryCardProps {
  icon: string;
  label: string;
  value: number;
  backgroundColor: string;
  style?: ViewStyle;
}

/** One compact tinted summary card (reference "42 / Total News" style). */
export const NewsSummaryCard: React.FC<NewsSummaryCardProps> = ({
  icon,
  label,
  value,
  backgroundColor,
  style,
}) => {
  return (
    <View
      style={[styles.card, { backgroundColor }, style]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
      accessibilityRole="text"
    >
      <View style={styles.iconChip}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </View>
  );
};

interface NewsSummaryStatsProps {
  stats: NewsStatsSummary;
  style?: ViewStyle;
}

/**
 * Summary/stat row for the News screen.
 * Values are UI demonstration data for now (reference numbers, not backend
 * values) and will be fed by the backend once the News API is confirmed.
 */
export const NewsSummaryStats: React.FC<NewsSummaryStatsProps> = ({ stats, style }) => {
  return (
    <View style={[styles.row, style]}>
      {STAT_CARDS.map(card => (
        <NewsSummaryCard
          key={card.key}
          icon={card.icon}
          label={card.label}
          value={stats[card.key]}
          backgroundColor={card.backgroundColor}
          style={styles.cardFlex}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  card: {
    minHeight: 94,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFlex: {
    flex: 1,
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
