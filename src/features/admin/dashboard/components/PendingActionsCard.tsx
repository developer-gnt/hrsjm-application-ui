import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';

export interface PendingActionItem {
  icon: string;
  title: string;
  count: number;
  onPress?: () => void;
}

interface PendingActionsCardProps {
  items: PendingActionItem[];
}

/** Quick-access card routing to pending approval queues (BRD Phase 4). */
export const PendingActionsCard: React.FC<PendingActionsCardProps> = ({
  items,
}) => {
  const visible = items.filter((item) => item.onPress);
  if (visible.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Pending Actions</Text>

      <View style={styles.rows}>
        {visible.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.row}
            onPress={item.onPress}
            activeOpacity={0.8}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <Text style={styles.rowTitle}>{item.title}</Text>
            </View>

            <View style={styles.rowRight}>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{item.count}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
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
  rows: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AdminColors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowIcon: {
    fontSize: 16,
  },
  rowTitle: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countPill: {
    backgroundColor: AdminColors.errorLight,
    borderRadius: 999,
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
  },
  countText: {
    ...Typography.caption,
    color: AdminColors.error,
  },
  chevron: {
    ...Typography.bodyBold,
    color: AdminColors.textMuted,
  },
});
