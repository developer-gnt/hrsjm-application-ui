import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';
import type { EventStatsSummary } from '../types/events.types';

interface StatCardConfig {
  key: keyof EventStatsSummary;
  label: string;
  icon: string;
  backgroundColor: string;
}

const STAT_CARDS: StatCardConfig[] = [
  {
    key: 'total',
    label: 'Total Events',
    icon: '📅',
    backgroundColor: AdminColors.primaryLight,
  },
  {
    key: 'upcoming',
    label: 'Upcoming',
    icon: '🕐',
    backgroundColor: AdminColors.statusExpiringLight,
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: '✅',
    backgroundColor: AdminColors.statusActiveLight,
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    icon: '❌',
    backgroundColor: AdminColors.statusInactiveLight,
  },
];

interface EventSummaryStatsProps {
  stats: EventStatsSummary;
  style?: ViewStyle;
}

/**
 * Summary/stat row for the Events screen.
 * Values are UI demonstration data for now (computed from the local sample
 * dataset) and will be fed by the backend once the Events API is confirmed.
 */
export const EventSummaryStats: React.FC<EventSummaryStatsProps> = ({ stats, style }) => {
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
    color: AdminColors.textPrimary,
  },
  label: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});