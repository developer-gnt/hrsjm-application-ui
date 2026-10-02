import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

export type AdminStatCardTint = 'blue' | 'gold' | 'green' | 'purple';

interface AdminStatCardProps {
  icon: string;
  title: string;
  value: string | number;
  /** Month-over-month growth percent, e.g. 12 for "+12%". */
  growthPercent?: number;
  /** Supporting note, e.g. "+268 this month". */
  note?: string;
  tint?: AdminStatCardTint;
  onPress?: () => void;
}

const TINT_STYLES: Record<
  AdminStatCardTint,
  { background: string; iconBackground: string; iconColor: string }
> = {
  blue: {
    background: AdminColors.infoLight,
    iconBackground: AdminColors.info,
    iconColor: AdminColors.cardSurface,
  },
  gold: {
    background: AdminColors.accentGoldLight,
    iconBackground: AdminColors.accentGold,
    iconColor: AdminColors.primaryDark,
  },
  green: {
    background: AdminColors.successLight,
    iconBackground: AdminColors.success,
    iconColor: AdminColors.cardSurface,
  },
  purple: {
    background: AdminColors.accentPurpleLight,
    iconBackground: AdminColors.accentPurple,
    iconColor: AdminColors.cardSurface,
  },
};

/** Tinted KPI card for the admin dashboard. */
export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  icon,
  title,
  value,
  growthPercent,
  note,
  tint = 'blue',
  onPress,
}) => {
  const colors = TINT_STYLES[tint];
  const growthLabel =
    growthPercent === undefined || growthPercent === null
      ? null
      : `${growthPercent >= 0 ? '↑' : '↓'} ${Math.abs(growthPercent)}%`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View
        style={[styles.iconBadge, { backgroundColor: colors.iconBackground }]}
      >
        <Text style={[styles.icon, { color: colors.iconColor }]}>{icon}</Text>
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {growthLabel ? <Text style={styles.growth}>{growthLabel}</Text> : null}
      </View>

      {note ? <Text style={styles.note}>{note}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  value: {
    ...Typography.metric,
    color: AdminColors.textPrimary,
  },
  growth: {
    ...Typography.caption,
    color: AdminColors.success,
  },
  note: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
});
